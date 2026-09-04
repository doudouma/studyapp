import { describe, it, expect } from "vitest";
import { detectAndSanitizeHtml, extractDomains } from "../server/features/pages/html-guard";

describe("detectAndSanitizeHtml - 边界与安全场景", () => {
  it("applet 标签应被检测并剥离", () => {
    const html = `<applet code="evil.class" archive="evil.jar"></applet>`;
    const result = detectAndSanitizeHtml(html);
    expect(result.safe).toBe(false);
    expect(result.threats[0].label).toBe("applet");
    expect(result.sanitizedHtml).not.toContain("<applet");
  });

  it("混合大小写 IFRAME 应被检测", () => {
    const html = `<IFRAME SRC="evil.com"></IFRAME>`;
    const result = detectAndSanitizeHtml(html);
    expect(result.safe).toBe(false);
    expect(result.threats[0].label).toBe("iframe");
    expect(result.sanitizedHtml).not.toContain("IFRAME");
  });

  it("混合大小写 Iframe 应被检测", () => {
    const html = `<Iframe src="evil.com"></Iframe>`;
    const result = detectAndSanitizeHtml(html);
    expect(result.safe).toBe(false);
    expect(result.threats[0].label).toBe("iframe");
  });

  it("自闭合 iframe 应被检测", () => {
    const html = `<iframe src="evil.com" />`;
    const result = detectAndSanitizeHtml(html);
    expect(result.safe).toBe(false);
    expect(result.threats[0].label).toBe("iframe");
    expect(result.sanitizedHtml).not.toContain("iframe");
  });

  it("多种危险标签混合出现应全部计数", () => {
    const html = `
      <iframe src="a.html"></iframe>
      <object data="b.swf"></object>
      <embed src="c.swf">
      <applet code="d.class"></applet>
    `;
    const result = detectAndSanitizeHtml(html);
    expect(result.safe).toBe(false);
    expect(result.threats).toHaveLength(4);
    const labels = result.threats.map((t) => t.label);
    expect(labels).toContain("iframe");
    expect(labels).toContain("object");
    expect(labels).toContain("embed");
    expect(labels).toContain("applet");
  });

  it("script 标签不在拦截列表中，应放行", () => {
    const html = `<script>alert('xss')</script>`;
    const result = detectAndSanitizeHtml(html);
    expect(result.safe).toBe(true);
    expect(result.sanitizedHtml).toContain("<script>");
  });

  it("事件处理器属性不应被正则拦截", () => {
    const html = `<div onclick="steal()">click</div>`;
    const result = detectAndSanitizeHtml(html);
    expect(result.safe).toBe(true);
  });

  it("iframe 带有大量属性应被完整剥离", () => {
    const html = `<iframe src="evil.com" width="100" height="100" frameborder="0" allowfullscreen></iframe>`;
    const result = detectAndSanitizeHtml(html);
    expect(result.safe).toBe(false);
    expect(result.sanitizedHtml).not.toContain("iframe");
    expect(result.sanitizedHtml).not.toContain("evil.com");
  });

  it("危险标签嵌套在正常 HTML 结构中应被剥离", () => {
    const html = `
      <html><body>
        <div class="container">
          <h1>标题</h1>
          <iframe src="evil.com"></iframe>
          <p>段落内容</p>
        </div>
      </body></html>
    `;
    const result = detectAndSanitizeHtml(html);
    expect(result.safe).toBe(false);
    expect(result.sanitizedHtml).toContain("<h1>");
    expect(result.sanitizedHtml).toContain("<p>");
    expect(result.sanitizedHtml).not.toContain("iframe");
  });

  it("object 标签带 param 子标签应被剥离", () => {
    const html = `<object data="evil.swf"><param name="movie" value="evil.swf"></object>`;
    const result = detectAndSanitizeHtml(html);
    expect(result.safe).toBe(false);
    expect(result.sanitizedHtml).not.toContain("<object");
    expect(result.sanitizedHtml).not.toContain("evil.swf");
  });

  it("连续多个同类型威胁应正确计数", () => {
    const html = `
      <iframe src="a.html"></iframe>
      <iframe src="b.html"></iframe>
      <iframe src="c.html"></iframe>
    `;
    const result = detectAndSanitizeHtml(html);
    expect(result.safe).toBe(false);
    expect(result.threats[0].label).toBe("iframe");
    expect(result.threats[0].count).toBe(3);
  });

  it("空白 HTML 应放行", () => {
    expect(detectAndSanitizeHtml("   ").safe).toBe(true);
    expect(detectAndSanitizeHtml("\n\t").safe).toBe(true);
  });

  it("HTML 注释中的危险标签仍会被正则剥离（安全优先）", () => {
    const html = `<!-- <iframe src="evil.com"></iframe> -->`;
    const result = detectAndSanitizeHtml(html);
    expect(result.safe).toBe(false);
    expect(result.sanitizedHtml).not.toContain("iframe");
  });
});

describe("extractDomains - 边界与安全场景", () => {
  it("排除 127.x 本地地址", () => {
    const html = `<a href="http://127.0.0.1:8080/admin">link</a>`;
    const domains = extractDomains(html);
    expect(domains).toHaveLength(0);
  });

  it("排除 192.168.x 内网地址", () => {
    const html = `<img src="http://192.168.1.100/image.png">`;
    const domains = extractDomains(html);
    expect(domains).toHaveLength(0);
  });

  it("排除 10.x 内网地址", () => {
    const html = `<a href="http://10.0.0.1/api">link</a>`;
    const domains = extractDomains(html);
    expect(domains).toHaveLength(0);
  });

  it("排除 172.16-31.x 内网地址", () => {
    const html = `<a href="http://172.16.0.1/api">link</a>`;
    const domains = extractDomains(html);
    expect(domains).toHaveLength(0);
  });

  it("提取带端口的域名", () => {
    const html = `<a href="https://example.com:8443/page">link</a>`;
    const domains = extractDomains(html);
    expect(domains).toContain("example.com");
  });

  it("data URI 不应被提取", () => {
    const html = `<img src="data:image/png;base64,iVBOR...">`;
    const domains = extractDomains(html);
    expect(domains).toHaveLength(0);
  });

  it("相对路径不应被提取", () => {
    const html = `<a href="/about">link</a><img src="./image.png">`;
    const domains = extractDomains(html);
    expect(domains).toHaveLength(0);
  });

  it("多个不同域名应全部提取", () => {
    const html = `
      <a href="https://a.com">link1</a>
      <img src="https://b.com/image.png">
      <form action="https://c.com/submit">
    `;
    const domains = extractDomains(html);
    expect(domains).toContain("a.com");
    expect(domains).toContain("b.com");
    expect(domains).toContain("c.com");
    expect(domains).toHaveLength(3);
  });

  it("HTTP 和 HTTPS 同域名应去重", () => {
    const html = `
      <a href="http://example.com/a">link1</a>
      <a href="https://example.com/b">link2</a>
    `;
    const domains = extractDomains(html);
    expect(domains).toHaveLength(1);
    expect(domains).toContain("example.com");
  });

  it("无属性的标签不提取", () => {
    const html = `<div><span>text</span></div>`;
    const domains = extractDomains(html);
    expect(domains).toHaveLength(0);
  });

  it("javascript: URI 不应被提取", () => {
    const html = `<a href="javascript:alert(1)">click</a>`;
    const domains = extractDomains(html);
    expect(domains).toHaveLength(0);
  });

  it("mailto: URI 不应被提取", () => {
    const html = `<a href="mailto:user@example.com">email</a>`;
    const domains = extractDomains(html);
    expect(domains).toHaveLength(0);
  });

  it("子域名应与父域名区分", () => {
    const html = `
      <a href="https://sub.example.com">link1</a>
      <a href="https://example.com">link2</a>
    `;
    const domains = extractDomains(html);
    expect(domains).toContain("sub.example.com");
    expect(domains).toContain("example.com");
    expect(domains).toHaveLength(2);
  });
});

describe("detectAndSanitizeHtml 与 extractDomains 组合场景", () => {
  it("含危险标签 + 外部域名的 HTML 应同时报告", () => {
    const html = `
      <iframe src="https://evil.com/phish.html"></iframe>
      <a href="https://suspicious.com">link</a>
    `;
    const guardResult = detectAndSanitizeHtml(html);
    const domains = extractDomains(html);

    expect(guardResult.safe).toBe(false);
    expect(guardResult.threats[0].label).toBe("iframe");
    expect(domains).toContain("suspicious.com");
    expect(domains).toContain("evil.com");
  });

  it("净化后不应包含危险标签中的 URL", () => {
    const html = `<iframe src="https://evil.com/phish.html"></iframe>`;
    const result = detectAndSanitizeHtml(html);
    expect(result.sanitizedHtml).not.toContain("evil.com");
  });
});
