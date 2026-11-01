/**
 * 「100 个问题」栏目共享类型与常量
 *
 * 内容写在 content/questions/{slug}/*.md（frontmatter + Markdown 正文），
 * 由 shared/questions/index.ts 解析成 QuestionArticle[]。
 * 与 showcase 一样按语言懒加载，未翻译时回退到默认语言（zh）。
 */

/** 必须与 app/lib/lang.ts 的 LANGS 一致 */
export const QUESTION_LOCALES = ["en", "zh", "es", "pt", "fr"] as const;
export type QuestionLocale = (typeof QUESTION_LOCALES)[number];

/** 与站点默认语言一致；缺失翻译时回退英文 */
export const DEFAULT_QUESTION_LOCALE: QuestionLocale = "en";

export interface QuestionFact {
  key: string;
  value: string;
  highlight?: boolean;
}

export interface QuestionArticle {
  /** URL-safe、稳定不变的引用标识（^[a-z0-9-]+$） */
  slug: string;
  /** 实际使用的语言（可能是回退后的默认语言） */
  locale: QuestionLocale;
  title: string;
  summary: string;
  tags: string[];
  facts: QuestionFact[];
  /** 正文 Markdown（不含 frontmatter） */
  body: string;
  author?: string;
  publishedAt: string;
  updatedAt?: string;
  /** 这套文档计划覆盖的问题数（通常 100） */
  questionCount: number;
  /** 章节数 */
  chapterCount: number;
  /** 是否输出 FAQPage；纯问题清单（没有答案）应设为 false */
  faq?: boolean;
}
