import { test, expect } from "@playwright/test";

// 语言由 URL 前缀决定：/ 无前缀 → 英文，故断言用英文文案。
// 本机常在开发期并行跑构建，dev server 首屏偶发 >30s，放宽到 60s。
test.setTimeout(60_000);

test("ai-tierlist 页面渲染预设工具池与等级", async ({ page }) => {
  await page.goto("/ai-tierlist");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    /AI Tools Tier List Maker/,
  );
  await expect(
    page.locator(".tl-tier-label .tname").first(),
  ).toHaveText("S God tier");
  await expect(page.locator(".tl-pool h3")).toContainText("Tool pool");
  await expect(page.locator(".tl-chip", { hasText: "ChatGPT" }).first()).toBeVisible();
});

test("点选 + 底部工具条把工具移进等级", async ({ page }) => {
  await page.goto("/ai-tierlist");
  // 开发环境点击可能早于 React hydration，重试点击直至选择态生效
  await expect(async () => {
    await page.locator(".tl-chip", { hasText: "ChatGPT" }).first().click();
    await expect(page.locator(".tl-movebar.show")).toBeVisible({ timeout: 2000 });
  }).toPass({ timeout: 30000 });
  await page
    .locator(".tl-movebar .tl-mbtn", { hasText: "S God tier" })
    .click();
  await expect(page.locator(".tl-tier").first()).toContainText("ChatGPT");
});

test("分享链接可还原整份榜单", async ({ page }) => {
  await page.goto("/ai-tierlist");
  await expect(async () => {
    await page.locator(".tl-chip", { hasText: "ChatGPT" }).first().click();
    await expect(page.locator(".tl-movebar.show")).toBeVisible({ timeout: 2000 });
  }).toPass({ timeout: 30000 });
  await page
    .locator(".tl-movebar .tl-mbtn", { hasText: "S God tier" })
    .click();
  await page.getByRole("button", { name: /Share link/ }).click();
  await expect(page).toHaveURL(/#s=/);

  await page.goto(page.url());
  await expect(page.locator(".tl-tier").first()).toContainText("ChatGPT");
});

test("freetool 列表挂上了 AI Tier List 入口", async ({ page }) => {
  await page.goto("/freetool");
  await expect(page.getByRole("link", { name: /AI Tools Tier List Maker/ })).toBeVisible();
});

test("社区投票榜渲染固定工具与票数", async ({ page }) => {
  await page.goto("/ai-tierlist");
  await expect(
    page.getByRole("heading", { level: 2, name: /Community tier list/ }),
  ).toBeVisible();
  // 默认主题为图像榜：16 个固定工具全部上榜（含 0 票）
  await expect(page.locator('[data-testid="vote-row"]')).toHaveCount(16);
  await expect(page.locator('[data-testid="vote-S"]').first()).toBeVisible();
});

test("未登录点投票会打开登录框", async ({ page }) => {
  await page.goto("/ai-tierlist");
  await page.locator('[data-testid="vote-S"]').first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
});
