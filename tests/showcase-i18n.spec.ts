import { describe, it, expect } from "vitest";
import {
  SHOWCASE_CASE_SETS,
  SHOWCASE_CASES,
  findCaseBySlug,
  getCaseLocales,
  listCases,
} from "../shared/showcase";
import { DEFAULT_SHOWCASE_LOCALE, SHOWCASE_LOCALES } from "../shared/types/showcase";
import { LANGS } from "../app/lib/lang";
import { getCaseBySlug, getCases, getRelatedCases } from "../app/features/showcase/cases";
import { renderCaseBody } from "../app/features/showcase/markdown";

const DATE = /^\d{4}-\d{2}-\d{2}$/;

describe("showcase i18n contract", () => {
  it("keeps content locales in sync with the site languages", () => {
    expect([...SHOWCASE_LOCALES]).toEqual([...LANGS]);
    expect(DEFAULT_SHOWCASE_LOCALE).toBe("en");
  });

  it("requires an English base for every case", () => {
    expect(SHOWCASE_CASE_SETS.length).toBeGreaterThan(0);
    for (const set of SHOWCASE_CASE_SETS) {
      expect(set.cases.en).toBeDefined();
      expect(set.locales).toContain("en");
      expect(getCaseLocales(set.slug)).toBe(set.locales);
    }
  });

  it("falls back to English (and reports the real locale) when untranslated", () => {
    for (const set of SHOWCASE_CASE_SETS) {
      for (const loc of SHOWCASE_LOCALES) {
        if (set.cases[loc]) continue;
        const item = findCaseBySlug(set.slug, loc);
        expect(item).toBe(set.cases.en);
        expect(item!.locale).toBe("en");
      }
    }
  });

  it("ships a translation for every supported language, per case", () => {
    for (const set of SHOWCASE_CASE_SETS) {
      expect([...set.locales].sort(), `${set.slug} 翻译语言不全`).toEqual(
        [...SHOWCASE_LOCALES].sort(),
      );
    }
  });

  it("actually translates the summary and body away from English", () => {
    for (const set of SHOWCASE_CASE_SETS) {
      for (const loc of SHOWCASE_LOCALES) {
        if (loc === "en") continue;
        const item = set.cases[loc]!;
        expect(item.summary, `${set.slug}.${loc} summary 未翻译`).not.toBe(
          set.cases.en!.summary,
        );
        expect(item.body, `${set.slug}.${loc} body 未翻译`).not.toBe(set.cases.en!.body);
      }
    }
  });

  it("returns one well-formed case per available locale", () => {
    for (const set of SHOWCASE_CASE_SETS) {
      for (const loc of set.locales) {
        const item = set.cases[loc]!;
        expect(item).toBe(findCaseBySlug(set.slug, loc));
        expect(item.locale).toBe(loc);
        expect(item.slug).toBe(set.slug);
        expect(item.name.trim()).not.toBe("");
        expect(item.summary.trim()).not.toBe("");
        expect(item.body.trim()).not.toBe("");
        expect(item.publishedAt).toMatch(DATE);
        // 各语言共用同一份封面/来源等非文本资产
        expect(item.cover.src).toBe(set.cases.en!.cover.src);
      }
    }
  });

  it("lists every case in every language, ordered identically", () => {
    const baseline = SHOWCASE_CASES.map((c) => c.slug);
    for (const loc of SHOWCASE_LOCALES) {
      const list = listCases(loc);
      expect(list.map((c) => c.slug)).toEqual(baseline);
      for (const item of list) {
        expect(SHOWCASE_LOCALES).toContain(item.locale);
      }
    }
  });

  it("localizes content through the app feature helpers", () => {
    expect(getCases()).toBe(SHOWCASE_CASES);
    for (const set of SHOWCASE_CASE_SETS) {
      for (const loc of set.locales) {
        expect(getCaseBySlug(set.slug, loc)).toBe(set.cases[loc]);
      }
      // 相关案例永远不含自己，且按目标语言取内容
      const related = getRelatedCases(set.slug, "zh");
      expect(related.some((r) => r.slug === set.slug)).toBe(false);
      expect(related.length).toBeLessThanOrEqual(3);
    }
  });

  it("tones localized feasibility words in every language", () => {
    const words: Record<string, string> = {
      zh: "高",
      es: "alta",
      pt: "baixa",
      fr: "faible",
    };
    for (const [loc, word] of Object.entries(words)) {
      const md = `| A | B |\n| --- | --- |\n| X | ${word} |`;
      expect(renderCaseBody(md), `${loc} 档位词未上色`).toContain('class="sc-tone"');
    }
  });
});
