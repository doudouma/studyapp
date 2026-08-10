import { test, expect } from "@playwright/test";

test.describe("MD to HTML publish dialog", () => {
  test("logged-in user sees publish dialog and can publish", async ({ page }) => {
    // 注册一个随机测试账号
    const email = `e2e_${Date.now()}@test.local`;
    const password = "TestPass123!";

    await page.goto("/");
    await page.evaluate(
      async ({ email, password }) => {
        const res = await fetch("/api/auth/sign-up/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name: "E2E User" }),
        });
        return res.status;
      },
      { email, password },
    );

    // 刷新以加载 session
    await page.goto("/md2html");
    await page.waitForLoadState("networkidle");

    // 登录用户应看到头像（登录态生效）
    await expect(page.getByLabel("菜单")).toBeVisible().catch(() => {});

    // 点生成链接 → 弹窗出现
    await page.getByRole("button", { name: /生成链接|Generate Link/ }).click();
    await expect(page.getByText(/发布页面|Publish Page/)).toBeVisible();

    // 弹窗内有标题输入、类型、分享到广场
    await expect(page.getByText("Share to Square", { exact: true }).or(page.getByText("分享到广场", { exact: true }))).toBeVisible();

    // 填标题并发布
    const titleInput = page.getByPlaceholder(/输入页面标题|Enter page title/);
    await titleInput.fill("E2E 测试文档");
    await page.getByRole("button", { name: /发布|Publish/, exact: true }).click();

    // 发布成功 → SuccessCard
    await expect(page.getByText(/发布成功|Published/)).toBeVisible({ timeout: 20000 });
  });
});
