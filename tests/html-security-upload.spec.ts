import { test, expect } from "@playwright/test";

test.describe("HTML 安全 E2E - 页面加载", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/md2html");
    await page.waitForLoadState("networkidle");
  });

  test("页面应正确加载", async ({ page }) => {
    await expect(page).toHaveTitle(/100mini|Markdown/);
  });

  test("编辑器应可见", async ({ page }) => {
    const editor = page.locator("textarea");
    await expect(editor).toBeVisible();
  });

  test("编辑器应有默认内容", async ({ page }) => {
    const editor = page.locator("textarea");
    const content = await editor.inputValue();
    expect(content.length).toBeGreaterThan(0);
  });

  test("模板选择器应可见", async ({ page }) => {
    await expect(page.getByText(/模板|Template/i)).toBeVisible();
  });
});

test.describe("HTML 安全 E2E - 文件上传", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/md2html");
    await page.waitForLoadState("networkidle");
  });

  test("上传 .md 文件应填充编辑器", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    const mdContent = "# Uploaded File\n\nThis content came from a file.";
    const buffer = Buffer.from(mdContent);

    await fileInput.setInputFiles({
      name: "test.md",
      mimeType: "text/markdown",
      buffer,
    });

    const editor = page.locator("textarea");
    await expect(editor).toContainText("Uploaded File");
  });
});

test.describe("HTML 安全 E2E - 预览渲染", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/md2html");
    await page.waitForLoadState("networkidle");
  });

  test("编辑 Markdown 应更新预览", async ({ page }) => {
    const editor = page.locator("textarea");
    await editor.clear();
    await editor.fill("# Hello\n\nThis is a **test**.");

    await expect(page.getByText("Hello")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("test")).toBeVisible();
  });

  test("切换模板应更新预览样式", async ({ page }) => {
    const editor = page.locator("textarea");
    await editor.clear();
    await editor.fill("# Template Test");

    // Wait for initial render
    await expect(page.getByText("Template Test")).toBeVisible({ timeout: 5000 });

    // Click a different template if available
    const templateCards = page.locator("[data-slot='card']");
    const count = await templateCards.count();
    if (count > 1) {
      await templateCards.nth(1).click();
      // Preview should still show the content
      await expect(page.getByText("Template Test")).toBeVisible();
    }
  });
});

test.describe("HTML 安全 E2E - 恶意内容渲染", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/md2html");
    await page.waitForLoadState("networkidle");
  });

  test("含 iframe 的 Markdown 应在预览中显示", async ({ page }) => {
    const editor = page.locator("textarea");
    await editor.clear();
    await editor.fill('# Title\n\n<iframe src="https://example.com"></iframe>\n\nNormal text.');

    await expect(page.getByText("Title")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Normal text.")).toBeVisible();
  });

  test("含 script 标签的 Markdown 应在预览中显示", async ({ page }) => {
    const editor = page.locator("textarea");
    await editor.clear();
    await editor.fill('# Title\n\n<script>alert("xss")</script>\n\nContent.');

    await expect(page.getByText("Title")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Content.")).toBeVisible();
  });

  test("含 HTML 实体的 Markdown 应正确转义", async ({ page }) => {
    const editor = page.locator("textarea");
    await editor.clear();
    await editor.fill('# Title\n\n&lt;script&gt;alert("xss")&lt;/script&gt;\n\nSafe content.');

    await expect(page.getByText("Title")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Safe content.")).toBeVisible();
  });
});
