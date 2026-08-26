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

test("裁剪后切排版 tab 可生成排版且预览往返不丢", async ({ page }) => {
  await page.goto("/idphoto");
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64",
  );
  const cropBtn = page.getByRole("button", { name: /仅裁剪排版|Crop Only|Recadrer seulement|Solo recortar|Somente recortar/i });
  // 开发环境 change 事件可能早于 React hydration 被丢弃，重试上传直至按钮可用
  await expect(async () => {
    await page.setInputFiles('input[type="file"]', { name: "t.png", mimeType: "image/png", buffer: png });
    await expect(cropBtn).toBeEnabled({ timeout: 2000 });
  }).toPass();
  await cropBtn.click();
  // 切到排版 tab 并生成排版
  await page.getByRole("tab", { name: /相纸排版|Print Layout|impression|impresión|impressão/i }).click();
  await expect(async () => {
    await page
      .getByRole("button", { name: /生成排版|Build layout|Créer la planche|Crear hoja|Criar folha/i })
      .click();
    await expect(page.getByTestId("idphoto-print-info")).toContainText(/300DPI/);
  }).toPass({ timeout: 10_000 });
  // 切回照片 tab，预览画布仍在且可见
  await page.getByRole("tab", { name: /证件照预览|Photo Preview|Aperçu photo|Vista previa|Prévia da foto/i }).click();
  await expect(page.locator("canvas").first()).toBeVisible();
});

test("freetool 列表包含证件照入口", async ({ page }) => {
  await page.goto("/freetool");
  await expect(
    page.getByRole("link").filter({ hasText: /AI 证件照工具|AI ID Photo Tool|identité|identificación|identificação/ }).first(),
  ).toBeVisible();
});
