import { test, expect } from "@playwright/test";

async function gotoAndWaitReady(page: import("@playwright/test").Page) {
  await page.goto("/any2md");
  await page
    .getByText(/拖入或点击选择文档|Drop a document|正在加载转换引擎|Loading the converter/)
    .waitFor({ timeout: 20000 });
  // 等待 React hydration 完成，否则 setInputFiles 不触发合成 onChange
  await page.waitForFunction(() => {
    const input = document.querySelector('input[type="file"]');
    return !!input && typeof window !== "undefined";
  });
  await page.waitForTimeout(1200);
}

test.describe("Any to MD", () => {
  test("should render the page and load the engine", async ({ page }) => {
    await gotoAndWaitReady(page);
    await expect(page.getByText("Any 转 MD")).toBeVisible();
  });

  test("should reject unsupported file type", async ({ page }) => {
    await gotoAndWaitReady(page);
    await page
      .setInputFiles('input[type="file"]', {
        name: "notes.txt",
        mimeType: "text/plain",
        buffer: Buffer.from("hello"),
      });
    await expect(page.getByText(/不支持的文件格式|Unsupported file format/)).toBeVisible();
  });

  test("should convert a CSV file to markdown", async ({ page }) => {
    await gotoAndWaitReady(page);
    await page
      .setInputFiles('input[type="file"]', {
        name: "report.csv",
        mimeType: "text/csv",
        buffer: Buffer.from("name,age\nalice,30\nbob,25\n"),
      });
    await expect(page.getByText(/字符|chars/)).toBeVisible({ timeout: 15000 });
    await expect(page.locator(".md-view table")).toBeVisible();
  });
});
