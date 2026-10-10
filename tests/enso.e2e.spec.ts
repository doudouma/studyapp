import { describe, it, expect, beforeAll } from "vitest";

/**
 * Enso (一笔禅圆) 端到端测试
 * 前置：本地 dev server 已运行 (npm run dev，端口 5173，本地 D1 已建 enso_rank 表)。
 * 未运行时全部用例自动跳过（与 deliveryrush.e2e.spec.ts 同模式）。
 *
 * 覆盖：页面 SSR、sitemap 收录、/api/enso/rank 完整回环
 * （提交 → 限流 → 查询 me 标记 → 低于最佳 → 参数校验错误）。
 */

const BASE_URL = "http://localhost:5173";

let serverAvailable = false;

beforeAll(async () => {
  try {
    const res = await fetch(BASE_URL, { signal: AbortSignal.timeout(3000) });
    serverAvailable = res.ok || res.status < 500;
  } catch {
    serverAvailable = false;
  }
});

/** 每次运行用唯一 playerKey，避免与历史测试数据互相干扰（限流/最佳分按 key 隔离） */
const RUN = Date.now().toString(36);
const keyA = `e2e-enso-${RUN}-player-a`;
const keyB = `e2e-enso-${RUN}-player-b`;

async function postRank(body: unknown, playerKey?: string) {
  const res = await fetch(`${BASE_URL}/api/enso/rank`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(playerKey ? { "X-Player-Key": playerKey } : {}),
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
  let json: any = null;
  try {
    json = await res.json();
  } catch {
    /* 非 JSON 响应 */
  }
  return { status: res.status, json };
}

async function getRank(playerKey?: string) {
  const res = await fetch(`${BASE_URL}/api/enso/rank`, {
    headers: playerKey ? { "X-Player-Key": playerKey } : {},
  });
  return { status: res.status, json: await res.json().catch(() => null) };
}

// ───────────────────────────────────────────────
// 1. 页面与收录
// ───────────────────────────────────────────────
describe("Enso E2E - 页面与收录", () => {
  it("/enso SSR → 200 且渲染游戏 DOM 与 JSON-LD", async () => {
    if (!serverAvailable) return;
    const res = await fetch(`${BASE_URL}/enso`);
    expect(res.status).toBe(200);
    const html = await res.text();
    // 游戏根节点由 React SSR 直出
    expect(html).toContain('id="enso-game"');
    // head 中的结构化数据（WebApplication / FAQPage）
    expect(html).toContain("application/ld+json");
    // 页面专属社交分享图
    expect(html).toContain("og-enso.jpg");
  });

  it("sitemap-en.xml 已收录 /enso", async () => {
    if (!serverAvailable) return;
    const res = await fetch(`${BASE_URL}/sitemap-en.xml`);
    expect(res.status).toBe(200);
    const xml = await res.text();
    expect(xml).toContain("/enso");
  });
});

// ───────────────────────────────────────────────
// 2. 排行榜 API 完整回环（用例按声明顺序执行）
// ───────────────────────────────────────────────
describe("Enso E2E - 排行榜 API", () => {
  it("POST 正常提交 → 200 且 updated:true", async () => {
    if (!serverAvailable) return;
    const { status, json } = await postRank(
      { name: "E2E甲", score: 5000, passed: 30, avg: 88 },
      keyA
    );
    expect(status).toBe(200);
    expect(json.updated).toBe(true);
    expect(json.best).toBe(5000);
    expect(json.mine).toMatchObject({ score: 5000, inTop: true });
    expect(json.mine.rank).toBeGreaterThanOrEqual(1);
  });

  it("10 秒内同设备重复提交 → 429 限流", async () => {
    if (!serverAvailable) return;
    const { status, json } = await postRank(
      { name: "E2E甲", score: 6000, passed: 31, avg: 89 },
      keyA
    );
    expect(status).toBe(429);
    expect(json.error).toBe("rate limited");
  });

  it("GET 带 X-Player-Key → top 含 me:true 条目且 mine 一致", async () => {
    if (!serverAvailable) return;
    const { status, json } = await getRank(keyA);
    expect(status).toBe(200);
    const me = json.top.find((e: any) => e.me);
    expect(me).toMatchObject({ name: "E2E甲", score: 5000, passed: 30, avg: 88 });
    expect(json.mine).toMatchObject({ score: 5000, inTop: true });
    // top 按 score 降序
    for (let i = 1; i < json.top.length; i++) {
      expect(json.top[i - 1].score).toBeGreaterThanOrEqual(json.top[i].score);
    }
  });

  it("GET 不带 X-Player-Key → mine 为 null 且无 me 标记", async () => {
    if (!serverAvailable) return;
    const { status, json } = await getRank();
    expect(status).toBe(200);
    expect(json.mine).toBeNull();
    expect(json.top.every((e: any) => !e.me)).toBe(true);
  });

  it("另一设备刷新纪录 → updated:true", async () => {
    if (!serverAvailable) return;
    const { status, json } = await postRank(
      { name: "E2E乙", score: 10000, passed: 50, avg: 92 },
      keyB
    );
    expect(status).toBe(200);
    expect(json.updated).toBe(true);
    expect(json.best).toBe(10000);
    expect(json.mine.inTop).toBe(true);
  });

  it("POST 缺少或过短的 X-Player-Key → 400", async () => {
    if (!serverAvailable) return;
    const noKey = await postRank({ name: "x", score: 1, passed: 1, avg: 50 });
    expect(noKey.status).toBe(400);
    expect(noKey.json.error).toBe("missing player key");

    const shortKey = await postRank({ name: "x", score: 1, passed: 1, avg: 50 }, "abc");
    expect(shortKey.status).toBe(400);
  });

  it("POST 非法 body → 400（非 JSON / 字段类型错误）", async () => {
    if (!serverAvailable) return;
    const badJson = await postRank("not-json", keyA);
    expect(badJson.status).toBe(400);

    const badType = await postRank({ name: "x", score: "9999", passed: 1, avg: 50 }, keyA);
    expect(badType.status).toBe(400);
    expect(badType.json.error).toBe("invalid body");
  });

  it("POST 超范围分数 → 400 invalid score（防刷校验）", async () => {
    if (!serverAvailable) return;
    const tooBig = await postRank(
      { name: "x", score: 999_999_999, passed: 1, avg: 50 },
      keyA
    );
    expect(tooBig.status).toBe(400);
    expect(tooBig.json.error).toBe("invalid score");

    const badAvg = await postRank({ name: "x", score: 100, passed: 1, avg: 200 }, keyA);
    expect(badAvg.status).toBe(400);
    expect(badAvg.json.error).toBe("invalid score");
  });

  it("限流窗口过后提交低于个人最佳的分数 → updated:false 且返回原最佳", async () => {
    if (!serverAvailable) return;
    // 服务端限流窗口 10 秒：等待窗口过后再提交
    await new Promise((r) => setTimeout(r, 10_500));
    const { status, json } = await postRank(
      { name: "E2E甲", score: 3000, passed: 10, avg: 80 },
      keyA
    );
    expect(status).toBe(200);
    expect(json.updated).toBe(false);
    expect(json.best).toBe(5000);
    expect(json.mine).toMatchObject({ score: 5000, inTop: true });
  }, 20_000);
});
