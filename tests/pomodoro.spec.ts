import { test, expect } from "@playwright/test";

test.describe("Pomodoro Timer", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/pomodoro");
    await page.waitForLoadState("networkidle");
  });

  test("should render the timer display", async ({ page }) => {
    await expect(page.getByText("25:00")).toBeVisible();
    await expect(page.getByRole("heading", { name: /专注中|Focus/ })).toBeVisible();
  });

  test("should show login CTA for anonymous users", async ({ page }) => {
    const cta = page.getByText(/登录积累番茄|Log in to track tomatoes/);
    await expect(cta).toBeVisible();
  });

  test("should open auth dialog when clicking login CTA", async ({ page }) => {
    await page.getByText(/登录积累番茄|Log in to track tomatoes/).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText(/登录 100mini|Login to 100mini/)).toBeVisible();
  });

  test("should start and pause the timer", async ({ page }) => {
    const button = page.locator(".p-btn").filter({ hasText: /开始计时|Start/ });
    await expect(button).toBeVisible();

    await button.click();
    await expect(page.locator(".p-btn").filter({ hasText: /暂停|Pause/ })).toBeVisible();

    await page.locator(".p-btn").filter({ hasText: /暂停|Pause/ }).click();
    await expect(page.locator(".p-btn").filter({ hasText: /开始计时|Start/ })).toBeVisible();
  });

  test("should open settings drawer", async ({ page }) => {
    await page.getByLabel(/菜单|Menu/).click();
    await expect(page.getByText(/番茄时钟 设置|Pomodoro Settings/)).toBeVisible();
    await expect(page.locator(".p-drawer").getByText(/专注|Focus/, { exact: true })).toBeVisible();
    await expect(page.locator(".p-drawer").getByText(/短休|Short Break/)).toBeVisible();
    await expect(page.locator(".p-drawer").getByText(/长休|Long Break/)).toBeVisible();
  });

  test("should toggle sound on/off", async ({ page }) => {
    await page.getByLabel(/声音|Sound/).click();
  });

  test("should allow switching alarm sound", async ({ page }) => {
    await page.getByLabel(/菜单|Menu/).click();
    const select = page.locator(".p-alarm-select");
    await select.selectOption("2");
    await expect(select).toHaveValue("2");
  });
});
