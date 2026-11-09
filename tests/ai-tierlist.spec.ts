import { test, expect, type Page } from "@playwright/test";

// 语言由 URL 前缀决定：/ 无前缀 → 英文，故断言用英文文案。
// 本机常在开发期并行跑构建，dev server 首屏偶发 >30s，放宽到 60s。
test.setTimeout(60_000);

/** 等 React hydration 完成：池子卡片点击后能进入选中态 */
async function selectPoolChip(page: Page) {
  await expect(async () => {
    await page.locator(".tl-chip", { hasText: "ChatGPT" }).first().click();
    await expect(page.locator(".tl-movebar.show")).toBeVisible({ timeout: 2000 });
  }).toPass({ timeout: 30000 });
}

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

test("点击等级打开编辑弹窗，改名后刷新仍保留", async ({ page }) => {
  await page.goto("/ai-tierlist");
  // 原生 prompt 换成了站内弹窗，同时覆盖 hydration 前的点击
  await expect(async () => {
    await page.locator(".tl-tier-label").first().click();
    await expect(page.locator(".tl-modal.show")).toBeVisible({ timeout: 2000 });
  }).toPass({ timeout: 30000 });

  const card = page.locator(".tl-modal.show");
  await card.locator('input[name="tier-name"]').fill("SS God tier");
  await card.locator('input[name="tier-en"]').fill("SS Tier");
  await card.locator('input[name="tier-color"]').fill("#123456");
  await card.getByRole("button", { name: "Save" }).click();

  await expect(page.locator(".tl-tier-label .tname").first()).toHaveText("SS God tier");
  await expect(page.locator(".tl-tier-label .ten").first()).toHaveText("SS Tier");
  await expect(page.locator(".tl-tier-label").first()).toHaveCSS(
    "background-color",
    "rgb(18, 52, 86)",
  );

  await page.reload();
  await expect(page.locator(".tl-tier-label .tname").first()).toHaveText("SS God tier");
});

test("分享后再编辑，刷新不会回退到旧分享快照", async ({ page }) => {
  await page.goto("/ai-tierlist");
  await selectPoolChip(page);
  await page.getByRole("button", { name: /Share link/ }).click();
  await expect(page).toHaveURL(/#s=/);

  await page.locator(".tl-tier-label").first().click();
  const card = page.locator(".tl-modal.show");
  await expect(card).toBeVisible();
  await card.locator('input[name="tier-name"]').fill("Fresh tier");
  await card.getByRole("button", { name: "Save" }).click();

  // 改动后旧的 #s= 快照必须失效，否则刷新会被它覆盖
  await expect(page).not.toHaveURL(/#s=/);
  await page.reload();
  await expect(page.locator(".tl-tier-label .tname").first()).toHaveText("Fresh tier");
});

test("点击工具池卡片只进入选中态，不弹出点评框", async ({ page }) => {
  await page.goto("/ai-tierlist");
  await selectPoolChip(page);
  await expect(page.locator(".tl-modal.show")).toHaveCount(0);
});

test("切换工具池与重置都走站内确认框（不依赖原生 confirm）", async ({ page }) => {
  await page.goto("/ai-tierlist");
  await selectPoolChip(page);

  await page.locator(".tl-theme").selectOption("image");
  const card = page.locator(".tl-modal.show");
  await expect(card).toBeVisible();
  await expect(card).toContainText("Switching themes replaces the current tool pool");
  await card.getByRole("button", { name: "Confirm" }).click();
  await expect(page.locator(".tl-doc-title")).toHaveValue(/AI Image Tools Tier List/);
  await expect(page.locator(".tl-tools .tl-chip")).toHaveCount(16);

  await page.locator(".tl-header .tl-btn", { hasText: "Reset" }).click();
  const reset = page.locator(".tl-modal.show");
  await expect(reset).toContainText("Resetting clears your board");
  await reset.getByRole("button", { name: "Confirm" }).click();
  await expect(page.locator(".tl-tools .tl-chip")).toHaveCount(35);
});

test("freetool 列表挂上了 AI Tier List 入口", async ({ page }) => {
  await page.goto("/freetool");
  await expect(page.getByRole("link", { name: /AI Tools Tier List Maker/ })).toBeVisible();
});
