import { describe, it, expect } from "vitest";
import {
  getQuestionLocales,
  getQuestionSlugs,
  loadQuestion,
  loadQuestions,
} from "../shared/questions";
import { DEFAULT_QUESTION_LOCALE, QUESTION_LOCALES } from "../shared/types/questions";
import { LANGS } from "../app/lib/lang";
import { buildQuestionToc } from "../app/features/questions/toc";
import { renderQuestionBody } from "../app/features/questions/markdown";
import { buildQuestionFaq } from "../app/features/questions/faq";
import {
  buildQuestionSearchIndex,
  searchQuestions,
} from "../app/features/questions/search";
import {
  buildQuestionArticleJsonLd,
  buildQuestionCollectionJsonLd,
} from "../app/features/questions/seo";

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const SLUGS = getQuestionSlugs();
const FIRST = "codex-100-questions";
const AI = "ai-100-questions-2026-11-01";
const VIBE = "vibe-coding-100-questions";
const WORKBUDDY = "workbuddy-100-questions";
const OBSIDIAN = "obsidian-100-questions";
const GITHUB = "github-100-questions";
const JEV = "jev-100-questions";
const CONTEXT = "context-engineering-100-questions";
const CHAPTERS: Record<string, number> = { [FIRST]: 6, [AI]: 12, [VIBE]: 7, [WORKBUDDY]: 6, [OBSIDIAN]: 7, [GITHUB]: 6, [JEV]: 6, [CONTEXT]: 6 };
const FULLY_TRANSLATED = new Set(SLUGS);

describe("100 questions content", () => {
  it("keeps locales in sync with the site languages", () => {
    expect([...QUESTION_LOCALES]).toEqual([...LANGS]);
    expect(DEFAULT_QUESTION_LOCALE).toBe("en");
  });

  it("loads the default-language article", async () => {
    expect(SLUGS.length).toBeGreaterThan(0);
    const article = await loadQuestion(FIRST, "en");
    expect(article).toBeDefined();
    expect(article!.locale).toBe("en");
    expect(article!.slug).toBe(FIRST);
    expect(article!.title.trim()).not.toBe("");
    expect(article!.summary.trim()).not.toBe("");
    expect(article!.body.trim()).not.toBe("");
    expect(article!.publishedAt).toMatch(DATE);
    expect(article!.questionCount).toBeGreaterThan(0);
  });

  it("ships every supported language for every article", () => {
    for (const slug of SLUGS) {
      const locales = getQuestionLocales(slug);
      expect([...locales].sort(), `${slug} 翻译语言不全`).toEqual([...QUESTION_LOCALES].sort());
    }
  });

  it("has 100 questions in every language", async () => {
    for (const slug of SLUGS) {
      const locales = getQuestionLocales(slug);
      for (const locale of QUESTION_LOCALES) {
        const article = (await loadQuestion(slug, locale))!;
        expect(article.locale).toBe(locales.includes(locale) ? locale : "en");
        expect(article.title.trim()).not.toBe("");
        expect(article.summary.trim()).not.toBe("");
        expect(article.body.trim()).not.toBe("");
        const toc = buildQuestionToc(article.body);
        expect(toc.length, `${slug}.${locale} 章节数量不对`).toBe(CHAPTERS[slug]);
        const questions = toc.flatMap((c) => c.questions);
        expect(questions.length, `${slug}.${locale} 问题数量不对`).toBe(100);
      }
    }
  });

  it("translates the title and body away from Chinese", async () => {
    for (const slug of SLUGS) {
      const zh = (await loadQuestion(slug, "zh"))!;
      for (const locale of QUESTION_LOCALES) {
        if (locale === "zh") continue;
        const article = (await loadQuestion(slug, locale))!;
        expect(article.title, `${slug}.${locale} title 未翻译`).not.toBe(zh.title);
        expect(article.body, `${slug}.${locale} body 未翻译`).not.toBe(zh.body);
      }
    }
  });

  it("falls back to English for untranslated locales", async () => {
    const en = await loadQuestion(FIRST, "en");
    for (const locale of QUESTION_LOCALES) {
      if (getQuestionLocales(FIRST).includes(locale)) continue;
      expect(await loadQuestion(FIRST, locale)).toStrictEqual(en);
      expect((await loadQuestion(FIRST, locale))!.locale).toBe("en");
    }
  });

  it("lists every article", async () => {
    const list = await loadQuestions("en");
    expect(list.map((a) => a.slug).sort()).toEqual([...SLUGS].sort());
  });

  it("extracts FAQ structured data for every language", async () => {
    for (const locale of QUESTION_LOCALES) {
      const article = (await loadQuestion(FIRST, locale))!;
      const faq = buildQuestionFaq(article.body);
      expect(faq.length, `${locale} FAQ 数量不对`).toBe(100);
      expect(faq[0].question).not.toMatch(/^\d+\./);
      expect(faq[0].answer.length).toBeGreaterThan(40);
      expect(faq[0].answer.length).toBeLessThanOrEqual(500);
    }
  });

  it("builds Article + FAQPage + BreadcrumbList structured data", async () => {
    const article = (await loadQuestion(FIRST, "en"))!;
    const blocks = buildQuestionArticleJsonLd(article, "100 Questions") as any[];
    expect(blocks.map((b) => b["@type"])).toEqual(["Article", "FAQPage", "BreadcrumbList"]);
    expect(blocks[0].articleSection).toHaveLength(6);
    expect(blocks[0].image).toBeTruthy();
    expect(blocks[1].mainEntity).toHaveLength(100);
  });

  it("omits FAQPage for a question bank without answers", async () => {
    const article = (await loadQuestion(AI, "en"))!;
    expect(article.faq).toBe(false);
    const blocks = buildQuestionArticleJsonLd(article, "100 Questions") as any[];
    expect(blocks.map((b) => b["@type"])).toEqual(["Article", "BreadcrumbList"]);
    expect(blocks[0].articleSection).toHaveLength(12);
  });

  it("localizes the collection schema", async () => {
    const articles = await loadQuestions("es");
    const block = buildQuestionCollectionJsonLd(
      articles,
      "es",
      "100 preguntas",
      "Un tema, 100 preguntas.",
    ) as any;
    expect(block.name).toBe("100 preguntas");
    expect(block.description).toBe("Un tema, 100 preguntas.");
  });

  it("adds copy-link anchors to question headings", async () => {
    const article = (await loadQuestion(FIRST, "en"))!;
    const html = renderQuestionBody(article.body);
    expect(html).toContain('class="qs-anchor"');
    expect(html).toContain('href="#q-1"');
  });

  it("builds a searchable index of all 100 questions", async () => {
    const article = (await loadQuestion(FIRST, "en"))!;
    const toc = buildQuestionToc(article.body);
    const items = buildQuestionSearchIndex(toc, article.body);
    expect(items).toHaveLength(100);
    expect(items[0].chapter).not.toBe("");
    expect(items[0].text.length).toBeGreaterThan(20);
    expect(searchQuestions(items, "Codex").length).toBeGreaterThan(0);
    expect(searchQuestions(items, "zzzz-not-found")).toHaveLength(0);
  });

  it("builds a chapter/question TOC with stable anchors", async () => {
    const article = (await loadQuestion(FIRST, "en"))!;
    const toc = buildQuestionToc(article.body);
    expect(toc.length).toBe(6);
    const questions = toc.flatMap((c) => c.questions);
    expect(questions.length).toBeGreaterThan(0);
    expect(questions[0].id).toMatch(/^q-\d+$/);
    expect(toc[0].id).toBe("chapter-1");

    const html = renderQuestionBody(article.body);
    expect(html).toContain('id="chapter-1"');
    expect(html).toContain(`id="${questions[0].id}"`);
  });
});
