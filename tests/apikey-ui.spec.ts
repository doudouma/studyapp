import { test, expect } from "@playwright/test";

test.describe("API Key 管理", () => {
  test("/links 未登录显示登录提示", async ({ page }) => {
    await page.goto("/links");
    // Should show login prompt (not the API key section)
    await expect(page.getByText(/登录|Log in|Sign in/i).first()).toBeVisible();
  });

  test("/links 未登录不显示 API 密钥区块", async ({ page }) => {
    await page.goto("/links");
    // API key section should NOT be visible when not logged in
    await expect(page.getByText("API 密钥")).not.toBeVisible();
  });
});

test.describe("上传页面 API", () => {
  test("匿名上传返回正确结构", async ({ request }) => {
    const response = await request.post("/api/upload", {
      form: {
        content: "<html><body><h1>E2E Playwright</h1></body></html>",
        title: "",
        category: "general",
        tags: "",
        shareToSquare: "false",
      },
    });
    expect(response.ok()).toBeTruthy();
    const json = await response.json();
    expect(json).toHaveProperty("id");
    expect(json).toHaveProperty("url");
    expect(json.url).toMatch(/^\/p\//);
    expect(json.isPermanent).toBe(false);
    expect(json.expiresAt).not.toBeNull();
  });

  test("未登录访问 /api/me/api-keys 返回 401", async ({ request }) => {
    const response = await request.get("/api/me/api-keys");
    expect(response.status()).toBe(401);
    const json = await response.json();
    expect(json.error).toBeTruthy();
  });

  test("未登录创建 API key 返回 401", async ({ request }) => {
    const response = await request.post("/api/me/api-keys", {
      data: { name: "test" },
    });
    expect(response.status()).toBe(401);
  });
});
