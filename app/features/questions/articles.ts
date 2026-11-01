import type { CSSProperties } from "react";
import { getQuestionLocales, getQuestionSlugs, loadQuestion, loadQuestions } from "@shared/questions";
import {
  SHOWCASE_ACCENT,
  SHOWCASE_ACCENT_DARK,
} from "@shared/types/showcase";
import type { QuestionArticle, QuestionLocale } from "@shared/types/questions";

/**
 * 「100 个问题」读取辅助。页面只依赖此模块，不直接 import @shared/questions。
 */

export { getQuestionLocales, getQuestionSlugs };

export async function getArticles(locale?: QuestionLocale): Promise<QuestionArticle[]> {
  return loadQuestions(locale);
}

export async function getArticleBySlug(
  slug: string,
  locale?: QuestionLocale,
): Promise<QuestionArticle | undefined> {
  return loadQuestion(slug, locale);
}

/** 强调色与案例库统一用站点主绿 */
export function accentVars(): CSSProperties {
  return {
    "--sc-accent": SHOWCASE_ACCENT,
    "--sc-accent-dark": SHOWCASE_ACCENT_DARK,
  } as CSSProperties;
}
