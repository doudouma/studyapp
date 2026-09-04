import { describe, it, expect } from "vitest";
import { escapeHtml, injectBanner, detectLangFromHeader } from "../server/features/pages/pages.render";

describe("escapeHtml", () => {
  it("转义 & 字符", () => {
    expect(escapeHtml("a&b")).toBe("a&amp;b");
  });

  it("转义 < 字符", () => {
    expect(escapeHtml("a<b")).toBe("a&lt;b");
  });

  it("转义 > 字符", () => {
    expect(escapeHtml("a>b")).toBe("a&gt;b");
  });

  it("转义双引号", () => {
    expect(escapeHtml('a"b')).toBe("a&quot;b");
  });

  it("转义单引号", () => {
    expect(escapeHtml("a'b")).toBe("a&#39;b");
  });

  it("同时转义所有特殊字符", () => {
    const result = escapeHtml(`<&>"'`);
    expect(result).toContain("&amp;");
    expect(result).toContain("&lt;");
    expect(result).toContain("&gt;");
    expect(result).toContain("&quot;");
    expect(result).toContain("&#39;");
  });

  it("空字符串返回空字符串", () => {
    expect(escapeHtml("")).toBe("");
  });

  it("无特殊字符时原样返回", () => {
    expect(escapeHtml("hello world 123")).toBe("hello world 123");
  });

  it("已转义的字符串不应被二次转义", () => {
    const input = "&amp;";
    expect(escapeHtml(input)).toBe("&amp;amp;");
  });

  it("转义后可安全注入 HTML 属性", () => {
    const userInput = '"><script>alert(1)</script>';
    const escaped = escapeHtml(userInput);
    expect(escaped).not.toContain(">");
    expect(escaped).not.toContain("<");
    expect(escaped).toContain("&quot;");
  });
});

describe("injectBanner", () => {
  it("注入 base href 并转义", () => {
    const html = `<html><head></head><body></body></html>`;
    const result = injectBanner(html, undefined, 'https://example.com" onload="alert(1)');
    expect(result).toContain("&quot;");
    expect(result).not.toContain('onload="alert(1)');
  });

  it("注入 SEO 标签并转义 title", () => {
    const html = `<html><head></head><body></body></html>`;
    const result = injectBanner(html, { title: '<script>alert("xss")</script>' });
    expect(result).toContain("&lt;script&gt;");
    expect(result).not.toContain("<script>");
  });

  it("注入 SEO 标签并转义 description", () => {
    const html = `<html><head></head><body></body></html>`;
    const result = injectBanner(html, { description: '"><img src=x onerror=alert(1)>' });
    expect(result).toContain("&quot;&gt;&lt;img");
    expect(result).toContain("&lt;img");
    expect(result).toContain("&gt;");
  });

  it("注入 SEO 标签并转义 URL", () => {
    const html = `<html><head></head><body></body></html>`;
    const result = injectBanner(html, { url: 'https://example.com" onclick="alert(1)' });
    expect(result).toContain("&quot;");
    expect(result).toContain("example.com&quot; onclick=&quot;alert(1)");
  });

  it("无 meta 参数时不注入 SEO 标签", () => {
    const html = `<html><head></head><body></body></html>`;
    const result = injectBanner(html);
    expect(result).toBe(html);
  });

  it("无 baseHref 时不注入 base 标签", () => {
    const html = `<html><head></head><body></body></html>`;
    const result = injectBanner(html, { title: "test" });
    expect(result).not.toContain("<base");
  });

  it("title 为空时使用默认值", () => {
    const html = `<html><head></head><body></body></html>`;
    const result = injectBanner(html, { title: "" });
    expect(result).toContain("学习页面");
  });

  it("description 为空时使用默认值", () => {
    const html = `<html><head></head><body></body></html>`;
    const result = injectBanner(html, { description: "" });
    expect(result).toContain("来自 100mini 的学习页面");
  });

  it("title 含特殊字符应全部转义", () => {
    const html = `<html><head></head><body></body></html>`;
    const malicious = `Test & "Title" <evil>`;
    const result = injectBanner(html, { title: malicious });
    expect(result).toContain("&amp;");
    expect(result).toContain("&quot;");
    expect(result).toContain("&lt;");
    expect(result).toContain("&gt;");
  });
});

describe("detectLangFromHeader", () => {
  it("无 Accept-Language 头返回默认语言", () => {
    expect(detectLangFromHeader(undefined)).toBe("en");
  });

  it("空字符串返回默认语言", () => {
    expect(detectLangFromHeader("")).toBe("en");
  });

  it("单语言直接返回", () => {
    expect(detectLangFromHeader("en")).toBe("en");
  });

  it("带权重取最高", () => {
    expect(detectLangFromHeader("fr;q=0.9,en;q=0.8")).toBe("fr");
  });

  it("中文变体识别", () => {
    expect(detectLangFromHeader("zh-CN,zh;q=0.9")).toBe("zh");
  });

  it("不支持的语言跳过", () => {
    expect(detectLangFromHeader("ja,ko,en")).toBe("en");
  });
});
