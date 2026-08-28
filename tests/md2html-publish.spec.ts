import { test, expect } from "@playwright/test";

test.describe("MD to HTML publish dialog", () => {
  test.skip("logged-in user sees publish dialog", async ({ page }) => {
    // TODO: @base-ui/react InputPrimitive 不响应 Playwright fill()，title state 无法更新
    // 等 base-ui 修复或改用原生 input 后恢复
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

    await page.goto("/md2html");
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: /生成链接|Generate Link/ }).click();
    await expect(page.getByText(/发布页面|Publish Page/)).toBeVisible();

    await expect(
      page.getByText("Share to Square", { exact: true }).or(page.getByText("分享到广场", { exact: true }))
    ).toBeVisible();
  });
});
