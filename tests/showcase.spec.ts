import { describe, it, expect } from "vitest";
import { SHOWCASE_CASES, findCaseBySlug } from "../shared/showcase";
import { CATEGORIES } from "../shared/types/showcase";
import {
  getCaseBySlug,
  getCases,
  getFactRows,
  getLeadFact,
  getRelatedCases,
} from "../app/features/showcase/cases";
import { renderCaseBody } from "../app/features/showcase/markdown";

const HTTPS = /^https:\/\/.+/;
const SLUG = /^[a-z0-9-]+$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

describe("showcase case data（来自 content/showcase/*/*.md）", () => {
  it("has at least one case", () => {
    expect(SHOWCASE_CASES.length).toBeGreaterThan(0);
  });

  it("uses unique, URL-safe, stable slugs", () => {
    const slugs = SHOWCASE_CASES.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) {
      expect(slug).toMatch(SLUG);
      // 改 slug 会打断所有指向它的外部引用，所以它必须是永久标识而不是工作标题
      expect(slug.length).toBeLessThanOrEqual(64);
    }
  });

  it("fills the required fields on every case", () => {
    for (const c of SHOWCASE_CASES) {
      expect(c.name.trim()).not.toBe("");
      expect(c.summary.trim()).not.toBe("");
      expect(c.body.trim()).not.toBe("");
      expect(c.facts.length).toBeGreaterThan(0);
      expect(c.sources.length).toBeGreaterThan(0);
      expect(CATEGORIES).toContain(c.category);
    }
  });

  it("keeps fact values non-empty and keys unique", () => {
    for (const c of SHOWCASE_CASES) {
      const keys = c.facts.map((f) => f.key);
      expect(new Set(keys).size).toBe(keys.length);
      for (const f of c.facts) {
        expect(f.key.trim()).not.toBe("");
        expect(f.value.trim()).not.toBe("");
      }
    }
  });

  it("has at least one `## ` section in the markdown body", () => {
    for (const c of SHOWCASE_CASES) {
      expect(c.body).toMatch(/^## /m);
    }
  });

  // Article 富结果要求 headline + image + datePublished 三者齐备；sitemap 的 lastmod
  // 也需要日期。缺任何一个，结构化数据整体不成立——所以这里硬性要求。
  it("carries the dates Article rich results need", () => {
    for (const c of SHOWCASE_CASES) {
      expect(c.publishedAt, `${c.slug} 缺 publishedAt`).toMatch(DATE);
      if (c.updatedAt) expect(c.updatedAt).toMatch(DATE);
    }
  });

  it("carries a cover image for og:image and Article.image", () => {
    for (const c of SHOWCASE_CASES) {
      expect(c.cover.src, `${c.slug} 缺 cover.src`).toMatch(/^(https:\/\/|\/)/);
    }
  });

  it("only links out over https", () => {
    for (const c of SHOWCASE_CASES) {
      for (const s of c.sources) {
        expect(s.title.trim()).not.toBe("");
        expect(s.url).toMatch(HTTPS);
      }
      if (c.externalUrl) expect(c.externalUrl).toMatch(HTTPS);
      if (c.cover.video) expect(c.cover.video).toMatch(HTTPS);
      if (c.cover.videoPoster) expect(c.cover.videoPoster).toMatch(/^(https:\/\/|\/)/);
    }
  });
});

describe("showcase case helpers", () => {
  it("returns every case and resolves by slug", () => {
    expect(getCases()).toBe(SHOWCASE_CASES);
    for (const c of SHOWCASE_CASES) {
      expect(getCaseBySlug(c.slug)).toBe(c);
      expect(findCaseBySlug(c.slug)).toBe(c);
    }
    expect(getCaseBySlug("does-not-exist")).toBeUndefined();
  });

  it("never lists the current case among its related cases", () => {
    for (const c of SHOWCASE_CASES) {
      const related = getRelatedCases(c.slug);
      expect(related.length).toBeLessThanOrEqual(3);
      expect(related.some((r) => r.slug === c.slug)).toBe(false);
    }
  });

  it("prefers a highlighted fact as the card lead", () => {
    const c = SHOWCASE_CASES[0];
    const highlighted = c.facts.find((f) => f.highlight);
    expect(getLeadFact(c)).toBe(highlighted ?? c.facts[0]);
  });

  it("derives published/updated fact rows from the frontmatter dates", () => {
    for (const c of SHOWCASE_CASES) {
      const rows = getFactRows(c);
      const byKey = new Map(rows.map((r) => [r.key, r.value]));

      expect(byKey.get("published")).toBe(c.publishedAt);
      if (c.updatedAt) expect(byKey.get("updated")).toBe(c.updatedAt);

      // 派生行不能和作者手写的行重复
      const keys = rows.map((r) => r.key);
      expect(new Set(keys).size).toBe(keys.length);
      // 作者写的 facts 一行不丢
      for (const f of c.facts) expect(byKey.get(f.key)).toBe(f.value);
    }
  });

  it("lets an author override a derived date row", () => {
    const c = SHOWCASE_CASES[0];
    const withOwnPublished = {
      ...c,
      facts: [...c.facts, { key: "published", value: "custom label" }],
    };
    const rows = getFactRows(withOwnPublished);
    expect(rows.filter((r) => r.key === "published")).toHaveLength(1);
    expect(rows.find((r) => r.key === "published")?.value).toBe("custom label");
  });
});

describe("renderCaseBody", () => {
  it("renders sections as headings and wraps tables for horizontal scroll", () => {
    const html = renderCaseBody("## Heading\n\n| A | B |\n| --- | --- |\n| 1 | 2 |");
    expect(html).toContain("<h2>Heading</h2>");
    expect(html).toContain('<div class="sc-table-wrap"><table>');
  });

  it("tones table cells that are exactly a feasibility keyword", () => {
    const html = renderCaseBody("| T | F |\n| --- | --- |\n| X | High |\n| Y | Low |");
    expect(html).toContain('class="sc-tone"');
    expect(html.match(/class="sc-tone"/g)?.length).toBe(2);
  });

  it("does not tone keywords appearing inside a longer sentence", () => {
    const html = renderCaseBody("| T | F |\n| --- | --- |\n| X | high risk of bugs |");
    expect(html).not.toContain('class="sc-tone"');
  });

  it("renders blockquotes (verdict callouts)", () => {
    const html = renderCaseBody("> **Verdict**\n>\n> body text");
    expect(html).toContain("<blockquote>");
    expect(html).toContain("<strong>Verdict</strong>");
  });
});
