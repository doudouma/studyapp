import type { CSSProperties } from "react";
import { SHOWCASE_CASES, findCaseBySlug } from "@shared/showcase";
import {
  CATEGORIES,
  SHOWCASE_ACCENT,
  SHOWCASE_ACCENT_DARK,
  TONE_COLORS,
  type ShowcaseCase,
  type ShowcaseCategory,
  type ShowcaseFact,
  type ShowcaseTone,
} from "@shared/types/showcase";

/**
 * 案例库的读取辅助（数据来自 content/showcase/*.md，见 shared/showcase）
 * 页面/组件只依赖此模块，不直接 import @shared/showcase
 */

export function getCases(): ShowcaseCase[] {
  return SHOWCASE_CASES;
}

export function getCaseBySlug(slug: string): ShowcaseCase | undefined {
  return findCaseBySlug(slug);
}

/** 相关案例：同分类优先，不足用其它分类补齐 */
export function getRelatedCases(slug: string, limit = 3): ShowcaseCase[] {
  const current = getCaseBySlug(slug);
  const others = SHOWCASE_CASES.filter((c) => c.slug !== slug);
  if (!current) return others.slice(0, limit);
  const sameCategory = others.filter((c) => c.category === current.category);
  const rest = others.filter((c) => c.category !== current.category);
  return [...sameCategory, ...rest].slice(0, limit);
}

/**
 * 案例强调色：固定用站点主绿，不随分类变化。
 * 写成内联 CSS 变量，子组件才能用 dark: 覆盖（内联 style 优先级高于 class）。
 */
export function accentVars(): CSSProperties {
  return {
    "--sc-accent": SHOWCASE_ACCENT,
    "--sc-accent-dark": SHOWCASE_ACCENT_DARK,
  } as CSSProperties;
}

/** 结论/档位色调的内联变量 */
export function toneVars(tone: ShowcaseTone): CSSProperties {
  const c = TONE_COLORS[tone];
  return { "--sc-tone": c.light, "--sc-tone-dark": c.dark } as CSSProperties;
}

/** 出现过的分类（按 CATEGORIES 顺序），用于列表页过滤栏 */
export function getUsedCategories(): ShowcaseCategory[] {
  const used = new Set(SHOWCASE_CASES.map((c) => c.category));
  return CATEGORIES.filter((c) => used.has(c));
}

/** 首个 highlight fact，兜底首个 fact —— 卡片底部的一行数据 */
export function getLeadFact(item: ShowcaseCase) {
  return item.facts.find((f) => f.highlight) ?? item.facts[0];
}

/**
 * facts 表实际渲染的行 = 作者在 MD 里写的 facts + 由 frontmatter 派生的日期行。
 * 日期来自 `publishedAt` / `updatedAt`（同时喂给 sitemap 与 Article JSON-LD），
 * 不要求作者在 facts 里再抄一遍；作者若自己写了同 key 的行，以作者的为准。
 */
export function getFactRows(item: ShowcaseCase): ShowcaseFact[] {
  const rows = [...item.facts];
  const has = (key: string) => rows.some((f) => f.key === key);
  if (!has("published")) rows.push({ key: "published", value: item.publishedAt });
  if (item.updatedAt && !has("updated")) {
    rows.push({ key: "updated", value: item.updatedAt });
  }
  return rows;
}
