import { describe, it, expect, beforeAll } from "vitest";
import { getCaseLocales, getCaseSlugs, loadCase, loadCases } from "../shared/showcase";
import { CATEGORIES, type ShowcaseCase } from "../shared/types/showcase";
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

// 案例内容按语言懒加载，测试里显式加载英文基准
let CASES: ShowcaseCase[];

beforeAll(async () => {
  CASES = await loadCases("en");
});

describe("showcase case data（来自 content/showcase/*/*.md）", () => {
  it("has at least one case", () => {
    expect(CASES.length).toBeGreaterThan(0);
  });

  it("uses unique, URL-safe, stable slugs", () => {
    const slugs = CASES.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) {
      expect(slug).toMatch(SLUG);
      // 改 slug 会打断所有指向它的外部引用，所以它必须是永久标识而不是工作标题
      expect(slug.length).toBeLessThanOrEqual(64);
    }
  });

  it("fills the required fields on every case", () => {
    for (const c of CASES) {
      expect(c.name.trim()).not.toBe("");
      expect(c.summary.trim()).not.toBe("");
      expect(c.body.trim()).not.toBe("");
      expect(c.facts.length).toBeGreaterThan(0);
      // sources 可选：没有外链的案例可以为空，但存在时必须是数组
      expect(Array.isArray(c.sources ?? [])).toBe(true);
      expect(CATEGORIES).toContain(c.category);
    }
  });

  it("keeps fact values non-empty and keys unique", () => {
    for (const c of CASES) {
      const keys = c.facts.map((f) => f.key);
      expect(new Set(keys).size).toBe(keys.length);
      for (const f of c.facts) {
        expect(f.key.trim()).not.toBe("");
        expect(f.value.trim()).not.toBe("");
      }
    }
  });

  it("has at least one `## ` section in the markdown body", () => {
    for (const c of CASES) {
      expect(c.body).toMatch(/^## /m);
    }
  });

  // Article 富结果要求 headline + image + datePublished 三者齐备；sitemap 的 lastmod
  // 也需要日期。缺任何一个，结构化数据整体不成立——所以这里硬性要求。
  it("carries the dates Article rich results need", () => {
    for (const c of CASES) {
      expect(c.publishedAt, `${c.slug} 缺 publishedAt`).toMatch(DATE);
      if (c.updatedAt) expect(c.updatedAt).toMatch(DATE);
    }
  });

  it("carries a cover image for og:image and Article.image", () => {
    for (const c of CASES) {
      expect(c.cover.src, `${c.slug} 缺 cover.src`).toMatch(/^(https:\/\/|\/)/);
    }
  });

  it("only links out over https", () => {
    for (const c of CASES) {
      for (const s of c.sources ?? []) {
        expect(s.title.trim()).not.toBe("");
        expect(s.url).toMatch(HTTPS);
      }
      if (c.externalUrl) expect(c.externalUrl).toMatch(HTTPS);
      // video 允许 https 的 mp4/HLS，或本地 public 下的 .gif 动图预览
      if (c.cover.video) {
        expect(c.cover.video).toMatch(/^(https:\/\/|\/).+/);
        if (c.cover.video.startsWith("/")) {
          expect(c.cover.video, `${c.slug} 本地 video 只能是 .gif`).toMatch(/\.gif($|[?#])/i);
        }
      }
      if (c.cover.videoPoster) expect(c.cover.videoPoster).toMatch(/^(https:\/\/|\/)/);
    }
  });
});

// 校验改到「加载时」后，用这条测试在 CI 里遍历加载全部内容，等价于原来的构建期校验
describe("showcase content validation", () => {
  it("loads every case in every declared locale without throwing", async () => {
    for (const slug of getCaseSlugs()) {
      const locales = getCaseLocales(slug);
      expect(locales, `${slug} 缺英文基准`).toContain("en");
      for (const locale of locales) {
        const item = await loadCase(slug, locale);
        expect(item, `${slug}/${locale}`).toBeDefined();
        expect(item!.body.trim(), `${slug}/${locale} 正文为空`).not.toBe("");
        expect(item!.locale).toBe(locale);
      }
    }
  });
});

describe("showcase case helpers", () => {
  it("returns every case and resolves by slug", async () => {
    expect(await getCases()).toBe(CASES);
    for (const c of CASES) {
      expect(await getCaseBySlug(c.slug)).toBe(c);
      expect(await loadCase(c.slug)).toBe(c);
    }
    expect(await getCaseBySlug("does-not-exist")).toBeUndefined();
  });

  it("never lists the current case among its related cases", async () => {
    for (const c of CASES) {
      const related = await getRelatedCases(c.slug);
      expect(related.length).toBeLessThanOrEqual(3);
      expect(related.some((r) => r.slug === c.slug)).toBe(false);
    }
  });

  it("prefers a highlighted fact as the card lead", () => {
    const c = CASES[0];
    const highlighted = c.facts.find((f) => f.highlight);
    expect(getLeadFact(c)).toBe(highlighted ?? c.facts[0]);
  });

  it("derives published/updated fact rows from the frontmatter dates", () => {
    for (const c of CASES) {
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
    const c = CASES[0];
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
