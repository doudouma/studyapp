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
