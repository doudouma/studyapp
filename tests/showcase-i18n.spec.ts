import { describe, it, expect } from "vitest";
import { getCaseLocales, getCaseSlugs, loadCase, loadCases } from "../shared/showcase";
import {
  DEFAULT_SHOWCASE_LOCALE,
  SHOWCASE_LOCALES,
} from "../shared/types/showcase";
import { LANGS } from "../app/lib/lang";
import { getCaseBySlug, getCases, getRelatedCases } from "../app/features/showcase/cases";
import { renderCaseBody } from "../app/features/showcase/markdown";

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const SLUGS = getCaseSlugs();

describe("showcase i18n contract", () => {
  it("keeps content locales in sync with the site languages", () => {
    expect([...SHOWCASE_LOCALES]).toEqual([...LANGS]);
    expect(DEFAULT_SHOWCASE_LOCALE).toBe("en");
  });

  it("requires an English base for every case", async () => {
    expect(SLUGS.length).toBeGreaterThan(0);
    for (const slug of SLUGS) {
      expect(getCaseLocales(slug)).toContain("en");
      const en = await loadCase(slug, "en");
      expect(en?.locale).toBe("en");
    }
  });

  it("falls back to English (and reports the real locale) when untranslated", async () => {
    for (const slug of SLUGS) {
      const locales = getCaseLocales(slug);
      for (const loc of SHOWCASE_LOCALES) {
        if (locales.includes(loc)) continue;
        const item = await loadCase(slug, loc);
        expect(item).toBe(await loadCase(slug, "en"));
        expect(item!.locale).toBe("en");
      }
    }
  });

  it("ships a translation for every supported language, per case", () => {
    for (const slug of SLUGS) {
      expect([...getCaseLocales(slug)].sort(), `${slug} 翻译语言不全`).toEqual(
        [...SHOWCASE_LOCALES].sort(),
      );
    }
  });

  it("actually translates the summary and body away from English", async () => {
    for (const slug of SLUGS) {
      const en = (await loadCase(slug, "en"))!;
      for (const loc of getCaseLocales(slug)) {
        if (loc === "en") continue;
        const item = (await loadCase(slug, loc))!;
        expect(item.summary, `${slug}.${loc} summary 未翻译`).not.toBe(en.summary);
        expect(item.body, `${slug}.${loc} body 未翻译`).not.toBe(en.body);
      }
    }
  });

  it("returns one well-formed case per available locale", async () => {
    for (const slug of SLUGS) {
      const en = (await loadCase(slug, "en"))!;
      for (const loc of getCaseLocales(slug)) {
        const item = await loadCase(slug, loc);
        expect(item).toBe(await loadCase(slug, loc));
        expect(item!.locale).toBe(loc);
        expect(item!.slug).toBe(slug);
        expect(item!.name.trim()).not.toBe("");
        expect(item!.summary.trim()).not.toBe("");
        expect(item!.body.trim()).not.toBe("");
        expect(item!.publishedAt).toMatch(DATE);
        // 各语言共用同一份封面/来源等非文本资产
        expect(item!.cover.src).toBe(en.cover.src);
      }
    }
  });

  it("lists every case in every language, ordered identically", async () => {
    const baseline = (await loadCases("en")).map((c) => c.slug);
    for (const loc of SHOWCASE_LOCALES) {
      const list = await loadCases(loc);
      expect(list.map((c) => c.slug)).toEqual(baseline);
      for (const item of list) {
        expect(SHOWCASE_LOCALES).toContain(item.locale);
      }
    }
  });

  it("localizes content through the app feature helpers", async () => {
    expect(await getCases()).toBe(await loadCases("en"));
    for (const slug of SLUGS) {
      for (const loc of getCaseLocales(slug)) {
        expect(await getCaseBySlug(slug, loc)).toBe(await loadCase(slug, loc));
      }
      // 相关案例永远不含自己，且按目标语言取内容
      const related = await getRelatedCases(slug, "zh");
      expect(related.some((r) => r.slug === slug)).toBe(false);
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
