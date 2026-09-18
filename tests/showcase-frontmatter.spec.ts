import { describe, it, expect } from "vitest";
import { parseFrontmatter } from "../shared/showcase/frontmatter";

const wrap = (fm: string, body = "## Section\n\ntext") => `---\n${fm}\n---\n\n${body}\n`;

describe("parseFrontmatter", () => {
  it("reads scalars, keeping colons inside values", () => {
    const { data } = parseFrontmatter(
      wrap('name: Photon\nsummary: free: offline-capable\nexternalUrl: https://tenzen.studio/photon/'),
    );
    expect(data.name).toBe("Photon");
    expect(data.summary).toBe("free: offline-capable");
    expect(data.externalUrl).toBe("https://tenzen.studio/photon/");
  });

  it("parses booleans and quoted strings", () => {
    const { data } = parseFrontmatter(wrap('flag: true\noff: false\nnum: 170\nquoted: "170"'));
    expect(data.flag).toBe(true);
    expect(data.off).toBe(false);
    // 数字不加引号也保持字符串，facts 里不会被转成 number
    expect(data.num).toBe("170");
    expect(data.quoted).toBe("170");
  });

  it("parses inline arrays", () => {
    const { data } = parseFrontmatter(wrap("tags: [a, b c, d]"));
    expect(data.tags).toEqual(["a", "b c", "d"]);
    const { data: empty } = parseFrontmatter(wrap("tags: []"));
    expect(empty.tags).toEqual([]);
  });

  it("parses nested mappings", () => {
    const { data } = parseFrontmatter(
      wrap("cover:\n  src: /showcase/x.jpg\n  video: https://a/b.mp4"),
    );
    expect(data.cover).toEqual({ src: "/showcase/x.jpg", video: "https://a/b.mp4" });
  });

  it("parses sequences of mappings, keeping order and later siblings", () => {
    const { data } = parseFrontmatter(
      wrap(
        [
          "facts:",
          "  - key: a",
          "    value: 1",
          "  - key: b",
          "    value: 2",
          "    highlight: true",
          "sources:",
          "  - title: t",
          "    url: https://x/y",
        ].join("\n"),
      ),
    );
    expect(data.facts).toEqual([
      { key: "a", value: "1" },
      { key: "b", value: "2", highlight: true },
    ]);
    expect(data.sources).toEqual([{ title: "t", url: "https://x/y" }]);
  });

  it("parses a sequence of plain scalars", () => {
    const { data } = parseFrontmatter(wrap("tags:\n  - one\n  - two"));
    expect(data.tags).toEqual(["one", "two"]);
  });

  it("ignores blank lines and whole-line comments", () => {
    const { data } = parseFrontmatter(wrap("# 注释\nname: Photon\n\n# 又一条注释\nlevel: tools"));
    expect(data).toEqual({ name: "Photon", level: "tools" });
  });

  it("keeps the body and drops the frontmatter", () => {
    const { body } = parseFrontmatter(wrap("name: x", "## H2\n\npara"));
    expect(body).toBe("## H2\n\npara");
    expect(body).not.toContain("name: x");
  });

  it("handles CRLF input", () => {
    const raw = "---\r\nname: Photon\r\n---\r\n\r\n## H2\r\n";
    const { data, body } = parseFrontmatter(raw);
    expect(data.name).toBe("Photon");
    expect(body).toBe("## H2");
  });

  it("throws on a missing or unclosed fence", () => {
    expect(() => parseFrontmatter("name: nogood\n")).toThrow(/必须以 --- 开头/);
    expect(() => parseFrontmatter("---\nname: x\n")).toThrow(/缺少结束的 ---/);
  });

  it("rejects tab indentation with a readable error", () => {
    expect(() => parseFrontmatter("---\n\tname: x\n---\nbody")).toThrow(/Tab/);
  });
});
