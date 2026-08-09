import { test, expect } from "@playwright/test";

async function gotoAndWaitReady(page: import("@playwright/test").Page) {
  await page.goto("/any2md");
  // 等待 React hydration 完成（React 19 在 DOM 上挂 __reactProps$*），否则 setInputFiles 不触发合成 onChange
  await page.waitForFunction(() => {
    const input = document.querySelector('input[type="file"]');
    return !!input && Object.keys(input).some((k) => k.startsWith("__reactProps"));
  });
  // 等待 WASM 引擎真正就绪：loading 文案消失，且 ready 的 Upload 图标容器出现
  await page.waitForFunction(() => {
    const main = document.querySelector("main");
    if (!main) return false;
    const text = main.textContent ?? "";
    const loading = /正在加载转换引擎|Loading the converter/.test(text);
    const uploadIcon = main.querySelector(".size-14");
    return !loading && !!uploadIcon;
  });
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
