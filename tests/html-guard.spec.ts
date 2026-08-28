import { describe, it, expect } from "vitest";
import { detectAndSanitizeHtml, extractDomains } from "../server/features/pages/html-guard";

describe("detectAndSanitizeHtml", () => {
  it("安全 HTML 应通过", () => {
    const html = `
      <html><body>
        <h1>Hello World</h1>
        <p>正常内容</p>
        <script>console.log("hi")</script>
        <button onclick="alert('ok')">点击</button>
      </body></html>
    `;
    const result = detectAndSanitizeHtml(html);
    expect(result.safe).toBe(true);
    expect(result.threats).toHaveLength(0);
  });

  it("含 iframe 应被检测并净化", () => {
    const html = `
      <html><body>
        <iframe src="https://evil.com/phish.html"></iframe>
      </body></html>
    `;
    const result = detectAndSanitizeHtml(html);
    expect(result.safe).toBe(false);
    expect(result.threats).toHaveLength(1);
    expect(result.threats[0].label).toBe("iframe");
    expect(result.sanitizedHtml).not.toContain("<iframe");
  });

  it("含 object 标签应被检测并净化", () => {
    const html = `<object data="evil.swf"></object>`;
    const result = detectAndSanitizeHtml(html);
    expect(result.safe).toBe(false);
    expect(result.threats[0].label).toBe("object");
    expect(result.sanitizedHtml).not.toContain("<object");
  });

  it("含 embed 标签应被检测并净化", () => {
    const html = `<embed src="evil.swf">`;
    const result = detectAndSanitizeHtml(html);
    expect(result.safe).toBe(false);
    expect(result.threats[0].label).toBe("embed");
    expect(result.sanitizedHtml).not.toContain("<embed");
  });

  it("多个 iframe 应计数", () => {
    const html = `
      <iframe src="a.html"></iframe>
      <iframe src="b.html"></iframe>
    `;
    const result = detectAndSanitizeHtml(html);
    expect(result.safe).toBe(false);
    expect(result.threats[0].count).toBe(2);
  });

  it("净化后保留正常标签", () => {
    const html = `
      <h1>标题</h1>
      <p>段落</p>
      <a href="https://example.com">链接</a>
    `;
    const result = detectAndSanitizeHtml(html);
    expect(result.safe).toBe(true);
    expect(result.sanitizedHtml).toContain("<h1>");
    expect(result.sanitizedHtml).toContain("<p>");
    expect(result.sanitizedHtml).toContain("<a");
  });

  it("空内容应放行", () => {
    const result = detectAndSanitizeHtml("");
    expect(result.safe).toBe(true);
  });

  it("纯文本应放行", () => {
    const result = detectAndSanitizeHtml("这是一段普通文本，没有 HTML 标签");
    expect(result.safe).toBe(true);
  });
});

describe("extractDomains", () => {
  it("提取 href 中的域名", () => {
    const html = `<a href="https://example.com/page">link</a>`;
    const domains = extractDomains(html);
    expect(domains).toContain("example.com");
  });

  it("提取 src 中的域名", () => {
    const html = `<img src="https://cdn.example.com/image.png">`;
    const domains = extractDomains(html);
    expect(domains).toContain("cdn.example.com");
  });

  it("提取 form action 中的域名", () => {
    const html = `<form action="https://evil.com/steal">`;
    const domains = extractDomains(html);
    expect(domains).toContain("evil.com");
  });

  it("排除 localhost", () => {
    const html = `<a href="http://localhost:3000/page">link</a>`;
    const domains = extractDomains(html);
    expect(domains).not.toContain("localhost");
  });

  it("去重", () => {
    const html = `
      <a href="https://example.com/a">link1</a>
      <a href="https://example.com/b">link2</a>
    `;
    const domains = extractDomains(html);
    expect(domains).toHaveLength(1);
  });

  it("无 URL 返回空数组", () => {
    const html = `<p>纯文本</p>`;
    const domains = extractDomains(html);
    expect(domains).toHaveLength(0);
  });
});
