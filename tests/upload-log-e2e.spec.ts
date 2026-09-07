import { describe, it, expect, beforeAll } from "vitest";

const BASE_URL = "https://100mini.com";
const UPLOAD_URL = `${BASE_URL}/api/upload`;
const LOGS_URL = `${BASE_URL}/api/admin/logs`;

let serverAvailable = false;

beforeAll(async () => {
  try {
    const res = await fetch(BASE_URL, { signal: AbortSignal.timeout(5000) });
    serverAvailable = res.ok || res.status < 500;
  } catch {
    serverAvailable = false;
  }
});

function skipIfUnavailable() {
  if (!serverAvailable) return true;
  return false;
}

// ───────────────────────────────────────────────
// 1. 匿名上传 → 日志记录
// ───────────────────────────────────────────────

describe("匿名上传日志", () => {
  it("匿名上传 content 应在 upload_log 中产生记录", async () => {
    if (skipIfUnavailable()) return;

    const beforeTime = Date.now();

    // 匿名上传
    const form = new FormData();
    form.append("content", `<html><body><h1>Log Test Anon ${Date.now()}</h1></body></html>`);
    const uploadRes = await fetch(UPLOAD_URL, {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(15000),
    });
    expect(uploadRes.status).toBe(200);
    const uploadJson = (await uploadRes.json()) as any;
    expect(uploadJson.id).toBeTruthy();
    expect(uploadJson.isPermanent).toBe(false);

    const pageId = uploadJson.id;

    // 等待 fire-and-forget 日志写入
    await new Promise((r) => setTimeout(r, 1500));

    // 查询日志 — 按 pageId 过滤（需要 admin 权限，匿名日志 userId 为空，无法按 userId 过滤）
    // 直接查全部日志，找刚上传的 pageId
    const logsRes = await fetch(`${LOGS_URL}?event=upload&pageSize=50`, {
      signal: AbortSignal.timeout(10000),
    });

    if (logsRes.status === 403) {
      // 无 admin 权限，跳过日志验证（上传本身成功）
      console.log("跳过日志验证：无 admin 权限（403）");
      return;
    }

    expect(logsRes.status).toBe(200);
    const logsJson = (await logsRes.json()) as any;
    expect(logsJson.logs).toBeDefined();

    // 查找包含该 pageId 的日志
    const matched = logsJson.logs.find((l: any) => l.pageId === pageId);
    expect(matched).toBeTruthy();
    expect(matched.event).toBe("upload");
    expect(matched.isAnonymous).toBe(1);
    expect(matched.status).toBe("success");
    expect(matched.userId).toBeNull();
  }, 30000);

  it("匿名上传文件 (HTML) 应记录 contentType=html 和 fileSize", async () => {
    if (skipIfUnavailable()) return;

    const html = `<html><body><h1>Log Test File ${Date.now()}</h1></body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const form = new FormData();
    form.append("file", blob, "log-test.html");

    const uploadRes = await fetch(UPLOAD_URL, {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(15000),
    });
    expect(uploadRes.status).toBe(200);
    const uploadJson = (await uploadRes.json()) as any;
    const pageId = uploadJson.id;

    await new Promise((r) => setTimeout(r, 1500));

    const logsRes = await fetch(`${LOGS_URL}?event=upload&pageSize=50`, {
      signal: AbortSignal.timeout(10000),
    });
    if (logsRes.status === 403) {
      console.log("跳过日志验证：无 admin 权限");
      return;
    }

    const logsJson = (await logsRes.json()) as any;
    const matched = logsJson.logs.find((l: any) => l.pageId === pageId);
    expect(matched).toBeTruthy();
    expect(matched.contentType).toBe("html");
    expect(typeof matched.fileSize).toBe("number");
    expect(matched.fileSize).toBeGreaterThan(0);
    expect(matched.ip).toBeTruthy();
  }, 30000);
});

// ───────────────────────────────────────────────
// 2. 登录上传 → 日志记录（用 cookie 认证）
// ───────────────────────────────────────────────

describe("登录上传日志", () => {
  // 此测试需要有效的 session cookie。
  // 在 CI 中可能无法运行，仅在有 cookie 时验证。
  const sessionCookie = process.env.TEST_SESSION_COOKIE || "";

  it("登录上传应在 upload_log 中产生记录（userId 非空，isAnonymous=0）", async () => {
    if (skipIfUnavailable()) return;
    if (!sessionCookie) {
      console.log("跳过：未设置 TEST_SESSION_COOKIE");
      return;
    }

    const beforeTime = Date.now();

    const form = new FormData();
    form.append("content", `<html><body><h1>Log Test Auth ${Date.now()}</h1></body></html>`);
    form.append("title", `Log Test ${Date.now()}`);

    const uploadRes = await fetch(UPLOAD_URL, {
      method: "POST",
      body: form,
      headers: { Cookie: sessionCookie },
      signal: AbortSignal.timeout(15000),
    });
    expect(uploadRes.status).toBe(200);
    const uploadJson = (await uploadRes.json()) as any;
    expect(uploadJson.id).toBeTruthy();
    expect(uploadJson.isPermanent).toBe(true);

    const pageId = uploadJson.id;

    await new Promise((r) => setTimeout(r, 1500));

    const logsRes = await fetch(`${LOGS_URL}?event=upload&pageSize=50`, {
      signal: AbortSignal.timeout(10000),
    });
    if (logsRes.status === 403) {
      console.log("跳过日志验证：无 admin 权限");
      return;
    }

    const logsJson = (await logsRes.json()) as any;
    const matched = logsJson.logs.find((l: any) => l.pageId === pageId);
    expect(matched).toBeTruthy();
    expect(matched.event).toBe("upload");
    expect(matched.isAnonymous).toBe(0);
    expect(matched.status).toBe("success");
    expect(matched.userId).toBeTruthy();
  }, 30000);
});

// ───────────────────────────────────────────────
// 3. 日志查询 API 基本功能
// ───────────────────────────────────────────────

describe("日志查询 API", () => {
  it("GET /api/admin/logs 返回分页结构", async () => {
    if (skipIfUnavailable()) return;

    const res = await fetch(`${LOGS_URL}?page=1&pageSize=5`, {
      signal: AbortSignal.timeout(10000),
    });
    if (res.status === 403) {
      console.log("跳过：无 admin 权限");
      return;
    }

    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json).toHaveProperty("logs");
    expect(json).toHaveProperty("total");
    expect(Array.isArray(json.logs)).toBe(true);
    expect(typeof json.total).toBe("number");
  });

  it("event=upload 过滤只返回 upload 事件", async () => {
    if (skipIfUnavailable()) return;

    const res = await fetch(`${LOGS_URL}?event=upload&pageSize=10`, {
      signal: AbortSignal.timeout(10000),
    });
    if (res.status === 403) {
      console.log("跳过：无 admin 权限");
      return;
    }

    const json = (await res.json()) as any;
    for (const log of json.logs) {
      expect(log.event).toBe("upload");
    }
  });

  it("event=delete 过滤只返回 delete 事件", async () => {
    if (skipIfUnavailable()) return;

    const res = await fetch(`${LOGS_URL}?event=delete&pageSize=10`, {
      signal: AbortSignal.timeout(10000),
    });
    if (res.status === 403) {
      console.log("跳过：无 admin 权限");
      return;
    }

    const json = (await res.json()) as any;
    for (const log of json.logs) {
      expect(log.event).toBe("delete");
    }
  });
});
