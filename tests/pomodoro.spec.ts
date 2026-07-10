import { test, expect } from "@playwright/test";

test.describe("Pomodoro Timer", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/pomodoro");
    await page.waitForLoadState("networkidle");
  });

  test("should render the timer display", async ({ page }) => {
    await expect(page.getByText("25:00")).toBeVisible();
    await expect(page.getByText("专注中")).toBeVisible();
  });

  test("should show login CTA for anonymous users", async ({ page }) => {
    const cta = page.getByText("登录积累番茄");
    await expect(cta).toBeVisible();
  });

  test("should open auth dialog when clicking login CTA", async ({ page }) => {
    await page.getByText("登录积累番茄").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText("登录 100mini")).toBeVisible();
  });

  test("should start and pause the timer", async ({ page }) => {
    const button = page.locator(".p-btn").filter({ hasText: "开始计时" });
    await expect(button).toBeVisible();

    await button.click();
    await expect(page.getByText("暂停")).toBeVisible();

    await page.locator(".p-btn").filter({ hasText: "暂停" }).click();
    await expect(page.getByText("开始计时")).toBeVisible();
  });

  test("should open settings drawer", async ({ page }) => {
    await page.getByLabel("菜单").click();
    await expect(page.getByText("番茄时钟 设置")).toBeVisible();
    await expect(page.locator(".p-drawer").getByText("专注", { exact: true })).toBeVisible();
    await expect(page.locator(".p-drawer").getByText("短休", { exact: true })).toBeVisible();
    await expect(page.locator(".p-drawer").getByText("长休", { exact: true })).toBeVisible();
  });

  test("should toggle sound on/off", async ({ page }) => {
    await page.getByLabel("声音").click();
  });

  test("should allow switching alarm sound", async ({ page }) => {
    await page.getByLabel("菜单").click();
    const select = page.locator(".p-alarm-select");
    await select.selectOption("2");
    await expect(select).toHaveValue("2");
  });
});
