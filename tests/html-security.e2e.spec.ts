import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { writeFile, unlink, mkdir } from "node:fs/promises";
import { join } from "node:path";

const BASE_URL = "http://localhost:5173";
const API_URL = `${BASE_URL}/api/upload`;
const TMP = join(import.meta.dirname, "../.tmp-e2e-html");

let serverAvailable = false;
let bindingsAvailable = false;

beforeAll(async () => {
  await mkdir(TMP, { recursive: true });

  // Check if server is running
  try {
    const res = await fetch(BASE_URL, { signal: AbortSignal.timeout(3000) });
    serverAvailable = res.ok || res.status < 500;
  } catch {
    serverAvailable = false;
  }

  // Check if D1 bindings are available by testing the upload endpoint
  if (serverAvailable) {
    try {
      const form = new FormData();
      form.append("content", "<html><body><h1>Health Check</h1></body></html>");
      form.append("title", "Health Check");
      const res = await fetch(API_URL, { method: "POST", body: form, signal: AbortSignal.timeout(5000) });
      const json = (await res.json()) as any;
      // If we get 200 or a business error (400/413), bindings are available
      // If we get 500 with database error, bindings are not available
      bindingsAvailable = res.status === 200 || (res.status >= 400 && res.status < 500 && !json.error?.includes("database"));
    } catch {
      bindingsAvailable = false;
    }
  }
});

afterAll(async () => {
  const { readdir, rm } = await import("node:fs/promises");
  try {
    const files = await readdir(TMP);
    for (const f of files) await unlink(join(TMP, f));
    await rm(TMP);
  } catch {}
});

async function uploadFile(
  filePath: string,
  filename: string,
  opts?: { title?: string; category?: string; tags?: string },
): Promise<{ status: number; json: any }> {
  const fileBytes = await import("node:fs/promises").then((fs) =>
    fs.readFile(filePath),
  );
  const blob = new Blob([fileBytes], { type: "text/html" });
  const form = new FormData();
  form.append("file", blob, filename);
  if (opts?.title) form.append("title", opts.title);
  if (opts?.category) form.append("category", opts.category);
  if (opts?.tags) form.append("tags", opts.tags);

  const res = await fetch(API_URL, { method: "POST", body: form });
  const json = await res.json();
  return { status: res.status, json };
}

async function uploadContent(
  content: string,
  opts?: { title?: string },
): Promise<{ status: number; json: any }> {
  const form = new FormData();
  form.append("content", content);
  if (opts?.title) form.append("title", opts.title);

  const res = await fetch(API_URL, { method: "POST", body: form });
  const json = await res.json();
  return { status: res.status, json };
}

// ───────────────────────────────────────────────
// 1. 文件扩展名验证
// ───────────────────────────────────────────────
describe("HTML 安全 E2E - 文件扩展名验证", () => {
  it("不支持 .txt 文件 → 400", async () => {
    if (!serverAvailable) return;
    const txtFile = join(TMP, "test.txt");
    await writeFile(txtFile, "hello world");
    const { status, json } = await uploadFile(txtFile, "test.txt");
    expect(status).toBe(400);
    expect(json.error).toContain("仅支持");
  });

  it("不支持 .js 文件 → 400", async () => {
    if (!serverAvailable) return;
    const jsFile = join(TMP, "test.js");
    await writeFile(jsFile, "alert(1)");
    const { status, json } = await uploadFile(jsFile, "test.js");
    expect(status).toBe(400);
  });

  it(".html 文件应被接受", async () => {
    if (!bindingsAvailable) return;
    const htmlFile = join(TMP, "safe.html");
    await writeFile(htmlFile, "<html><body><h1>Safe</h1></body></html>");
    const { status, json } = await uploadFile(htmlFile, "safe.html");
    expect(status).toBe(200);
    expect(json).toHaveProperty("id");
    expect(json).toHaveProperty("url");
  });

  it(".htm 文件应被接受", async () => {
    if (!bindingsAvailable) return;
    const htmFile = join(TMP, "safe.htm");
    await writeFile(htmFile, "<html><body><h1>Safe HTM</h1></body></html>");
    const { status, json } = await uploadFile(htmFile, "safe.htm");
    expect(status).toBe(200);
    expect(json).toHaveProperty("id");
  });
});

// ───────────────────────────────────────────────
// 2. 文件大小限制
// ───────────────────────────────────────────────
describe("HTML 安全 E2E - 文件大小限制", () => {
  it("超过 5MB 的文件 → 413", async () => {
    if (!serverAvailable) return;
    const bigFile = join(TMP, "big.html");
    const content = "<h1>" + "x".repeat(6 * 1024 * 1024) + "</h1>";
    await writeFile(bigFile, content);
    const { status, json } = await uploadFile(bigFile, "big.html");
    expect(status).toBe(413);
    expect(json.error).toContain("5MB");
  });

  it("超过 5MB 的内容字符串 → 413", async () => {
    if (!serverAvailable) return;
    const bigContent = "<h1>" + "x".repeat(6 * 1024 * 1024) + "</h1>";
    const { status, json } = await uploadContent(bigContent);
    expect(status).toBe(413);
  });
});

// ───────────────────────────────────────────────
// 3. 恶意 HTML 上传（后台扫描）
// ───────────────────────────────────────────────
describe("HTML 安全 E2E - 恶意 HTML 上传", () => {
  it("含 iframe 的 HTML 应成功上传（后台扫描异步处理）", async () => {
    if (!bindingsAvailable) return;
    const htmlFile = join(TMP, "iframe.html");
    await writeFile(
      htmlFile,
      `<html><body><iframe src="https://evil.com/phish.html"></iframe></body></html>`,
    );
    const { status, json } = await uploadFile(htmlFile, "iframe.html");
    // 上传本身应成功，安全扫描在后台异步执行
    expect(status).toBe(200);
    expect(json).toHaveProperty("id");
    expect(json).toHaveProperty("url");
    expect(json.url).toMatch(/^\/p\//);
  });

  it("含 object 标签的 HTML 应成功上传", async () => {
    if (!bindingsAvailable) return;
    const htmlFile = join(TMP, "object.html");
    await writeFile(
      htmlFile,
      `<html><body><object data="evil.swf"></object></body></html>`,
    );
    const { status, json } = await uploadFile(htmlFile, "object.html");
    expect(status).toBe(200);
    expect(json).toHaveProperty("id");
  });

  it("含 embed 标签的 HTML 应成功上传", async () => {
    if (!bindingsAvailable) return;
    const htmlFile = join(TMP, "embed.html");
    await writeFile(
      htmlFile,
      `<html><body><embed src="evil.swf"></body></html>`,
    );
    const { status, json } = await uploadFile(htmlFile, "embed.html");
    expect(status).toBe(200);
  });

  it("含 applet 标签的 HTML 应成功上传", async () => {
    if (!bindingsAvailable) return;
    const htmlFile = join(TMP, "applet.html");
    await writeFile(
      htmlFile,
      `<html><body><applet code="evil.class"></applet></body></html>`,
    );
    const { status, json } = await uploadFile(htmlFile, "applet.html");
    expect(status).toBe(200);
  });

  it("含多种危险标签的 HTML 应成功上传", async () => {
    if (!bindingsAvailable) return;
    const htmlFile = join(TMP, "multi-threat.html");
    await writeFile(
      htmlFile,
      `<html><body>
        <iframe src="a.html"></iframe>
        <object data="b.swf"></object>
        <embed src="c.swf">
        <applet code="d.class"></applet>
      </body></html>`,
    );
    const { status, json } = await uploadFile(htmlFile, "multi-threat.html");
    expect(status).toBe(200);
  });
});

// ───────────────────────────────────────────────
// 4. 安全 HTML 上传
// ───────────────────────────────────────────────
describe("HTML 安全 E2E - 安全 HTML 上传", () => {
  it("正常 HTML 应成功上传", async () => {
    if (!bindingsAvailable) return;
    const htmlFile = join(TMP, "safe-normal.html");
    await writeFile(
      htmlFile,
      `<html><body>
        <h1>正常页面</h1>
        <p>这是一段正常的内容</p>
        <a href="https://example.com">链接</a>
        <img src="https://example.com/image.png">
      </body></html>`,
    );
    const { status, json } = await uploadFile(htmlFile, "safe-normal.html");
    expect(status).toBe(200);
    expect(json).toHaveProperty("id");
    expect(json).toHaveProperty("url");
  });

  it("含 JavaScript 的 HTML 应成功上传（非拦截标签）", async () => {
    if (!bindingsAvailable) return;
    const htmlFile = join(TMP, "with-script.html");
    await writeFile(
      htmlFile,
      `<html><body>
        <script>console.log("test")</script>
        <button onclick="alert('ok')">点击</button>
      </body></html>`,
    );
    const { status, json } = await uploadFile(htmlFile, "with-script.html");
    expect(status).toBe(200);
  });

  it("空内容不应允许上传", async () => {
    if (!serverAvailable) return;
    const { status } = await uploadContent("");
    expect(status).toBe(400);
  });

  it("纯文本内容应成功上传", async () => {
    if (!bindingsAvailable) return;
    const { status, json } = await uploadContent("<p>这是一段普通文本</p>");
    expect(status).toBe(200);
  });

  it("含 CSS 样式的 HTML 应成功上传", async () => {
    if (!bindingsAvailable) return;
    const htmlFile = join(TMP, "with-css.html");
    await writeFile(
      htmlFile,
      `<html><head><style>body{color:red}</style></head><body><p>Styled</p></body></html>`,
    );
    const { status, json } = await uploadFile(htmlFile, "with-css.html");
    expect(status).toBe(200);
  });
});

// ───────────────────────────────────────────────
// 5. 匿名上传限制
// ───────────────────────────────────────────────
describe("HTML 安全 E2E - 匿名上传限制", () => {
  it("匿名上传返回 expiresAt（非 null）", async () => {
    if (!bindingsAvailable) return;
    const htmlFile = join(TMP, "anon-expiry.html");
    await writeFile(htmlFile, "<html><body><h1>Expiry Test</h1></body></html>");
    const { status, json } = await uploadFile(htmlFile, "anon-expiry.html");
    expect(status).toBe(200);
    expect(json.isPermanent).toBe(false);
    expect(json.expiresAt).not.toBeNull();
    expect(json.expiresAt).toBeGreaterThan(Date.now());
  });

  it("匿名上传页面 URL 以 /p/ 开头", async () => {
    if (!bindingsAvailable) return;
    const htmlFile = join(TMP, "anon-url.html");
    await writeFile(htmlFile, "<html><body><h1>URL Test</h1></body></html>");
    const { status, json } = await uploadFile(htmlFile, "anon-url.html");
    expect(status).toBe(200);
    expect(json.url).toMatch(/^\/p\//);
  });
});

// ───────────────────────────────────────────────
// 6. 页面访问
// ───────────────────────────────────────────────
describe("HTML 安全 E2E - 页面访问", () => {
  it("不存在的页面返回 404", async () => {
    if (!serverAvailable) return;
    const res = await fetch(`${BASE_URL}/p/nonexistent12345`);
    expect(res.status).toBe(404);
  });

  it("已上传的页面可被访问", async () => {
    if (!bindingsAvailable) return;
    const htmlFile = join(TMP, "access-test.html");
    await writeFile(
      htmlFile,
      `<html><head><title>Access Test</title></head><body><h1>Access Test</h1></body></html>`,
    );
    const { status, json } = await uploadFile(htmlFile, "access-test.html", {
      title: "Access Test",
    });
    expect(status).toBe(200);

    const pageRes = await fetch(`${BASE_URL}${json.url}`);
    expect(pageRes.status).toBe(200);
    const html = await pageRes.text();
    expect(html).toContain("Access Test");
  });
});

// ───────────────────────────────────────────────
// 7. ZIP 上传
// ───────────────────────────────────────────────
describe("HTML 安全 E2E - ZIP 上传", () => {
  it("含 index.html 的 ZIP 应成功上传", async () => {
    if (!bindingsAvailable) return;
    const { zipSync } = await import("fflate");
    const htmlContent = new TextEncoder().encode(
      "<html><body><h1>ZIP Test</h1></body></html>",
    );
    const zipData = zipSync({ "index.html": htmlContent });
    const blob = new Blob([zipData], { type: "application/zip" });
    const form = new FormData();
    form.append("file", blob, "test.zip");

    const res = await fetch(API_URL, { method: "POST", body: form });
    const json = (await res.json()) as any;
    expect(res.status).toBe(200);
    expect(json).toHaveProperty("id");
  });

  it("不含 HTML 的 ZIP → 400", async () => {
    if (!serverAvailable) return;
    const { zipSync } = await import("fflate");
    const txtContent = new TextEncoder().encode("hello");
    const zipData = zipSync({ "readme.txt": txtContent });
    const blob = new Blob([zipData], { type: "application/zip" });
    const form = new FormData();
    form.append("file", blob, "no-html.zip");

    const res = await fetch(API_URL, { method: "POST", body: form });
    const json = (await res.json()) as any;
    expect(res.status).toBe(400);
    expect(json.error).toContain("HTML");
  });
});

// ───────────────────────────────────────────────
// 8. 标签和分类
// ───────────────────────────────────────────────
describe("HTML 安全 E2E - 标签和分类", () => {
  it("带标签的上传应成功", async () => {
    if (!bindingsAvailable) return;
    const htmlFile = join(TMP, "tags-test.html");
    await writeFile(htmlFile, "<html><body><h1>Tags</h1></body></html>");
    const { status, json } = await uploadFile(htmlFile, "tags-test.html", {
      title: "Tags Test",
      tags: "test,security,html",
    });
    expect(status).toBe(200);
    expect(json).toHaveProperty("id");
  });

  it("带分类的上传应成功", async () => {
    if (!bindingsAvailable) return;
    const htmlFile = join(TMP, "category-test.html");
    await writeFile(htmlFile, "<html><body><h1>Category</h1></body></html>");
    const { status, json } = await uploadFile(htmlFile, "category-test.html", {
      title: "Category Test",
      category: "education",
    });
    expect(status).toBe(200);
  });
});
