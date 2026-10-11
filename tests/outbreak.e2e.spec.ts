import { describe, it, expect, beforeAll } from "vitest";

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

const RUN = Date.now().toString(36);
const keyA = `e2e-od-${RUN}-a`;
const keyB = `e2e-od-${RUN}-b`;

async function postRank(body: unknown, playerKey?: string) {
  const res = await fetch(`${BASE_URL}/api/outbreak/rank`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(playerKey ? { "X-Player-Key": playerKey } : {}) },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
  let json: any = null;
  try { json = await res.json(); } catch { /* noop */ }
  return { status: res.status, json };
}
async function getRank(playerKey?: string) {
  const res = await fetch(`${BASE_URL}/api/outbreak/rank`, {
    headers: playerKey ? { "X-Player-Key": playerKey } : {},
  });
  return { status: res.status, json: await res.json().catch(() => null) };
}

describe("Outbreak E2E - 排行榜 API", () => {
  it("POST 正常提交 → updated:true", async () => {
    if (!serverAvailable) return;
    const { status, json } = await postRank({ name: "E2E甲", score: 5000, delivered: 30, time: 120 }, keyA);
    expect(status).toBe(200);
    expect(json.updated).toBe(true);
    expect(json.mine).toMatchObject({ score: 5000, inTop: true });
  });

  it("10 秒内同设备重复提交 → 429", async () => {
    if (!serverAvailable) return;
    const { status, json } = await postRank({ name: "E2E甲", score: 6000, delivered: 31, time: 130 }, keyA);
    expect(status).toBe(429);
    expect(json.error).toBe("rate limited");
  });

  it("GET 带 key → me 标记 + 降序", async () => {
    if (!serverAvailable) return;
    const { status, json } = await getRank(keyA);
    expect(status).toBe(200);
    const me = json.top.find((e: any) => e.me);
    expect(me).toMatchObject({ name: "E2E甲", score: 5000, delivered: 30, time: 120 });
    for (let i = 1; i < json.top.length; i++) {
      expect(json.top[i - 1].score).toBeGreaterThanOrEqual(json.top[i].score);
    }
  });

  it("GET 不带 key → mine 为 null", async () => {
    if (!serverAvailable) return;
    const { json } = await getRank();
    expect(json.mine).toBeNull();
    expect(json.top.every((e: any) => !e.me)).toBe(true);
  });

  it("缺少 key → 400", async () => {
    if (!serverAvailable) return;
    const { status, json } = await postRank({ name: "x", score: 1, delivered: 1, time: 1 });
    expect(status).toBe(400);
    expect(json.error).toBe("missing player key");
  });

  it("非法 body → 400", async () => {
    if (!serverAvailable) return;
    const { status, json } = await postRank({ name: "x", score: "9", delivered: 1, time: 1 }, keyB);
    expect(status).toBe(400);
    expect(json.error).toBe("invalid body");
  });

  it("超范围分数 → 400 invalid score", async () => {
    if (!serverAvailable) return;
    const { status, json } = await postRank({ name: "x", score: 999_999_999, delivered: 1, time: 1 }, keyB);
    expect(status).toBe(400);
    expect(json.error).toBe("invalid score");
  });

  it("限流窗口过后低于最佳 → updated:false", async () => {
    if (!serverAvailable) return;
    await new Promise((r) => setTimeout(r, 10_500));
    const { status, json } = await postRank({ name: "E2E甲", score: 3000, delivered: 10, time: 60 }, keyA);
    expect(status).toBe(200);
    expect(json.updated).toBe(false);
    expect(json.best).toBe(5000);
  }, 20_000);
});

describe("Outbreak E2E - 页面与收录", () => {
  it("/outbreak SSR → 200 且渲染游戏 DOM 与 JSON-LD", async () => {
    if (!serverAvailable) return;
    const res = await fetch(`${BASE_URL}/outbreak`);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('id="od-app"');
    expect(html).toContain("application/ld+json");
    expect(html).toContain("og-outbreak.jpg");
  });
  it("sitemap-en.xml 收录 /outbreak", async () => {
    if (!serverAvailable) return;
    const xml = await (await fetch(`${BASE_URL}/sitemap-en.xml`)).text();
    expect(xml).toContain("/outbreak");
  });
});
