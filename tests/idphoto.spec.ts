import { test, expect } from "@playwright/test";

test("idphoto 工作台渲染", async ({ page }) => {
  await page.goto("/idphoto");
  await expect(page.getByTestId("idphoto-heading")).toBeVisible();
  await expect(page.getByTestId("idphoto-dropzone")).toBeVisible();
  await expect(page.getByTestId("idphoto-status")).toContainText(
    /打开照片|Open a Photo|Ouvrir|Abre|Abra/i,
  );
});

test("规格选择联动", async ({ page }) => {
  await page.goto("/idphoto");
  await expect(page.getByText("295×413px").first()).toBeVisible();
});

test("排版 tab 可切换", async ({ page }) => {
  await page.goto("/idphoto");
  const printTab = page.getByRole("tab", { name: /相纸排版|Print Layout|impression|impresión|impressão/i });
  // 开发环境点击可能早于 React hydration 完成，重试点击直至面板出现
  await expect(async () => {
    await printTab.click();
    await expect(page.getByTestId("idphoto-print-info")).toBeVisible();
  }).toPass();
});
