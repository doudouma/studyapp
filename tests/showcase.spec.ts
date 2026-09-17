import { describe, it, expect } from "vitest";
import { SHOWCASE_CASES } from "../shared/showcase/cases";
import { CATEGORIES, type ShowcaseBlock } from "../shared/types/showcase";
import { getCaseBySlug, getCases, getLeadFact, getRelatedCases } from "../app/features/showcase/cases";

const HTTPS = /^https:\/\/.+/;
const SLUG = /^[a-z0-9-]+$/;
const TONES = ["good", "warn", "neutral", "bad"];

/** 校验一个正文内容块的结构完整性 */
function assertBlock(b: ShowcaseBlock) {
  switch (b.type) {
    case "text":
      expect(b.text.trim()).not.toBe("");
      break;
    case "list":
      expect(b.items.length).toBeGreaterThan(0);
      for (const item of b.items) expect(item.trim()).not.toBe("");
      break;
    case "table":
      expect(b.columns.length).toBeGreaterThan(0);
      expect(b.rows.length).toBeGreaterThan(0);
      for (const row of b.rows) {
        // 每行的单元格数必须与表头一致，否则表格会塌
        expect(row.length).toBe(b.columns.length);
        for (const raw of row) {
          const cell = typeof raw === "string" ? { text: raw } : raw;
          expect(cell.text.trim()).not.toBe("");
          if (cell.tone) expect(TONES).toContain(cell.tone);
        }
      }
      break;
    case "note":
      expect(b.text.trim()).not.toBe("");
      if (b.tone) expect(TONES).toContain(b.tone);
      break;
  }
}

describe("showcase case data", () => {
  it("has at least one case", () => {
    expect(SHOWCASE_CASES.length).toBeGreaterThan(0);
  });

  it("uses unique, URL-safe, stable slugs", () => {
    const slugs = SHOWCASE_CASES.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) {
      expect(slug).toMatch(SLUG);
      // Renaming a slug breaks every external citation pointing at it, so the
      // slug must read as a permanent identifier rather than a working title.
      expect(slug.length).toBeLessThanOrEqual(64);
    }
  });

  it("fills the required fields on every case", () => {
    for (const c of SHOWCASE_CASES) {
      expect(c.name.trim()).not.toBe("");
      expect(c.summary.trim()).not.toBe("");
      expect(c.sections.length).toBeGreaterThan(0);
      expect(c.facts.length).toBeGreaterThan(0);
      expect(c.sources.length).toBeGreaterThan(0);
      expect(CATEGORIES).toContain(c.category);
    }
  });

  it("keeps every section non-empty and fact keys unique", () => {
    for (const c of SHOWCASE_CASES) {
      for (const s of c.sections) {
        expect(s.heading.trim()).not.toBe("");
        // 一节至少要有段落或结构化块之一
        const hasContent = (s.paragraphs?.length ?? 0) > 0 || (s.blocks?.length ?? 0) > 0;
        expect(hasContent).toBe(true);
        for (const p of s.paragraphs ?? []) expect(p.trim()).not.toBe("");
        for (const b of s.blocks ?? []) assertBlock(b);
      }
      const keys = c.facts.map((f) => f.key);
      expect(new Set(keys).size).toBe(keys.length);
      for (const f of c.facts) {
        expect(f.key.trim()).not.toBe("");
        expect(f.value.trim()).not.toBe("");
      }
    }
  });

  it("only links out over https", () => {
    for (const c of SHOWCASE_CASES) {
      for (const s of c.sources) {
        expect(s.title.trim()).not.toBe("");
        expect(s.url).toMatch(HTTPS);
      }
      if (c.externalUrl) expect(c.externalUrl).toMatch(HTTPS);
      if (c.publishedAt) expect(c.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      if (c.updatedAt) expect(c.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("keeps optional cover media well-formed", () => {
    for (const c of SHOWCASE_CASES) {
      const cover = c.cover;
      if (!cover) continue;
      // Videos are always remote (https); local assets live under public/ and
      // are referenced with a root-relative path.
      if (cover.video) expect(cover.video).toMatch(HTTPS);
      if (cover.videoPoster) expect(cover.videoPoster).toMatch(/^(https:\/\/|\/)/);
      if (cover.src) expect(cover.src).toMatch(/^(https:\/\/|\/)/);
      if (cover.accent) expect(cover.accent).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });
});

describe("showcase case helpers", () => {
  it("returns every case and resolves by slug", () => {
    expect(getCases()).toBe(SHOWCASE_CASES);
    for (const c of SHOWCASE_CASES) {
      expect(getCaseBySlug(c.slug)).toBe(c);
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
});
