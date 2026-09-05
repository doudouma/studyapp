import { describe, it, expect, beforeAll } from "vitest";
import { generatePetLandingHTML, type PetLandingData } from "../app/components/petsafe/pet-landing-template";

const BASE_URL = "http://localhost:5173";
const API_URL = `${BASE_URL}/api/upload`;

let serverAvailable = false;
let bindingsAvailable = false;

beforeAll(async () => {
  try {
    const res = await fetch(BASE_URL, { signal: AbortSignal.timeout(3000) });
    serverAvailable = res.ok || res.status < 500;
  } catch {
    serverAvailable = false;
  }

  if (serverAvailable) {
    try {
      const form = new FormData();
      form.append("content", "<html><body><h1>Health</h1></body></html>");
      form.append("title", "Health");
      const res = await fetch(API_URL, { method: "POST", body: form, signal: AbortSignal.timeout(5000) });
      const json = (await res.json()) as any;
      bindingsAvailable = res.status === 200 || (res.status >= 400 && res.status < 500 && !json.error?.includes("database"));
    } catch {
      bindingsAvailable = false;
    }
  }
});

const t = (key: string) => key;

const baseData: PetLandingData = {
  name: "Cola",
  breed: "Corgi",
  gender: "Male",
  chipId: "981020003892819",
  reward: "$300",
  features: "Heart-shaped patch",
  lostLocation: "Wangjing SOHO",
  lostTime: "2026-09-01 08:30",
  ownerName: "Ms Zhang",
  ownerPhone: "138-0013-8888",
  avatarUrl: "https://example.com/pet.jpg",
  tagMedical: false,
  tagTimid: false,
  tagReward: false,
};

async function uploadPetLanding(
  data: PetLandingData,
  opts?: { cookie?: string },
): Promise<{ status: number; json: any }> {
  const html = generatePetLandingHTML(data, t);
  const blob = new Blob([html], { type: "text/html" });
  const form = new FormData();
  form.append("file", blob, "petsafe.html");
  form.append("title", `Pet Safe - ${data.name || "Pet"}`);
  form.append("category", "petsafe");
  form.append("tags", "petsafe,qr,lost-pet");

  const headers: Record<string, string> = {};
  if (opts?.cookie) headers["Cookie"] = opts.cookie;

  const res = await fetch(API_URL, { method: "POST", body: form, headers });
  const json = await res.json();
  return { status: res.status, json };
}

// ───────────────────────────────────────────────
// 1. 匿名上传 PetSafe QR 页面
// ───────────────────────────────────────────────
describe("PetSafe QR E2E - 匿名上传", () => {
  it("生成的 HTML 包含宠物信息", () => {
    const html = generatePetLandingHTML(baseData, t);
    expect(html).toContain("Cola");
    expect(html).toContain("Corgi");
    expect(html).toContain("981020003892819");
    expect(html).toContain("Ms Zhang");
  });

  it("匿名上传返回 isPermanent=false + expiresAt", async () => {
    if (!bindingsAvailable) return;
    const { status, json } = await uploadPetLanding(baseData);
    expect(status).toBe(200);
    expect(json).toHaveProperty("id");
    expect(json).toHaveProperty("url");
    expect(json.url).toMatch(/^\/p\//);
    expect(json.isPermanent).toBe(false);
    expect(json.expiresAt).not.toBeNull();
    expect(json.expiresAt).toBeGreaterThan(Date.now());
  });

  it("生成的 URL 可被访问", async () => {
    if (!bindingsAvailable) return;
    const { status, json } = await uploadPetLanding(baseData);
    expect(status).toBe(200);

    const pageRes = await fetch(`${BASE_URL}${json.url}`);
    expect(pageRes.status).toBe(200);
    const html = await pageRes.text();
    expect(html).toContain("Cola");
    expect(html).toContain("Corgi");
  });

  it("匿名上传带 shareToSquare 字段不报错", async () => {
    if (!bindingsAvailable) return;
    const html = generatePetLandingHTML(baseData, t);
    const blob = new Blob([html], { type: "text/html" });
    const form = new FormData();
    form.append("file", blob, "petsafe.html");
    form.append("title", "Pet Safe - Cola");
    form.append("category", "petsafe");
    form.append("tags", "petsafe,qr");
    form.append("shareToSquare", "true");

    const res = await fetch(API_URL, { method: "POST", body: form });
    expect(res.status).toBe(200);
  });
});

// ───────────────────────────────────────────────
// 2. 不同宠物数据上传
// ───────────────────────────────────────────────
describe("PetSafe QR E2E - 不同宠物数据", () => {
  it("无名字宠物使用 fallback", async () => {
    if (!bindingsAvailable) return;
    const data = { ...baseData, name: "" };
    const { status, json } = await uploadPetLanding(data);
    expect(status).toBe(200);
    expect(json).toHaveProperty("url");
  });

  it("带医疗标签的宠物", async () => {
    if (!bindingsAvailable) return;
    const data = { ...baseData, tagMedical: true };
    const html = generatePetLandingHTML(data, t);
    expect(html).toContain("petsafe.qr.urgentMed");

    const { status, json } = await uploadPetLanding(data);
    expect(status).toBe(200);
    expect(json).toHaveProperty("url");
  });

  it("不同 chipId 生成不同页面", async () => {
    if (!bindingsAvailable) return;
    const r1 = await uploadPetLanding(baseData);
    const r2 = await uploadPetLanding({ ...baseData, chipId: "1111222233334444" });
    expect(r1.status).toBe(200);
    expect(r2.status).toBe(200);
    expect(r1.json.id).not.toBe(r2.json.id);
  });
});

// ───────────────────────────────────────────────
// 3. 登录用户上传（需要 session cookie）
// ───────────────────────────────────────────────
describe("PetSafe QR E2E - 登录用户上传", () => {
  it("无 cookie 时视为匿名", async () => {
    if (!bindingsAvailable) return;
    const { status, json } = await uploadPetLanding(baseData);
    expect(status).toBe(200);
    expect(json.isPermanent).toBe(false);
  });

  it("无效 cookie 时视为匿名", async () => {
    if (!bindingsAvailable) return;
    const { status, json } = await uploadPetLanding(baseData, {
      cookie: "better-auth.session_token=invalid_token_value",
    });
    expect(status).toBe(200);
    expect(json.isPermanent).toBe(false);
  });

  it("登录用户上传返回 isPermanent=true（需有效 session）", async () => {
    if (!bindingsAvailable) return;
    // 先登录获取 session cookie
    let sessionCookie: string | undefined;
    try {
      const signInRes = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test-petsafe-e2e@example.com",
          password: "Test123456!",
        }),
      });
      const setCookie = signInRes.headers.get("set-cookie");
      if (setCookie) {
        // 提取 session token cookie
        const match = setCookie.match(/better-auth\.session_token=([^;]+)/);
        if (match) sessionCookie = `better-auth.session_token=${match[1]}`;
      }
    } catch {
      // 登录失败（用户不存在），跳过此测试
    }

    if (!sessionCookie) return; // 无法获取 session，跳过

    const { status, json } = await uploadPetLanding(baseData, { cookie: sessionCookie });
    expect(status).toBe(200);
    expect(json.isPermanent).toBe(true);
    expect(json.expiresAt).toBeNull();
  });
});

// ───────────────────────────────────────────────
// 4. 上传后的页面内容验证
// ───────────────────────────────────────────────
describe("PetSafe QR E2E - 页面内容验证", () => {
  it("上传的页面包含完整 landing page 结构", async () => {
    if (!bindingsAvailable) return;
    const { status, json } = await uploadPetLanding(baseData);
    expect(status).toBe(200);

    const pageRes = await fetch(`${BASE_URL}${json.url}`);
    const html = await pageRes.text();
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("</html>");
    expect(html).toContain("Cola");
    expect(html).toContain("981020003892819");
    expect(html).toContain("Ms Zhang");
    expect(html).toContain("tel:138-0013-8888");
  });

  it("medical=true 时页面包含医疗警告", async () => {
    if (!bindingsAvailable) return;
    const data = { ...baseData, tagMedical: true };
    const { status, json } = await uploadPetLanding(data);
    expect(status).toBe(200);

    const pageRes = await fetch(`${BASE_URL}${json.url}`);
    const html = await pageRes.text();
    expect(html).toContain("petsafe.qr.urgentMed");
  });
});
