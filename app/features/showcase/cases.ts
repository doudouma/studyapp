import type { CSSProperties } from "react";
import { SHOWCASE_CASES } from "@shared/showcase/cases";
import {
  CATEGORIES,
  CATEGORY_ACCENTS,
  CATEGORY_ACCENTS_DARK,
  TONE_COLORS,
  type ShowcaseCase,
  type ShowcaseCategory,
  type ShowcaseTone,
} from "@shared/types/showcase";

/**
 * 案例库的读取辅助（纯静态数据，无 HTTP 边界，故无 api.ts）
 * 页面/组件只依赖此模块，不直接 import @shared/showcase/cases
 */

/** 全部案例，按数据文件顺序 */
export function getCases(): ShowcaseCase[] {
  return SHOWCASE_CASES;
}

export function getCaseBySlug(slug: string): ShowcaseCase | undefined {
  return SHOWCASE_CASES.find((c) => c.slug === slug);
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

/** 案例封面色调：cover.accent 优先，缺省按分类取 */
export function getCaseAccent(item: ShowcaseCase): string {
  return item.cover?.accent ?? CATEGORY_ACCENTS[item.category];
}

/** 暗色模式下用于文字的强调色（浅色强调色在深底上对比度不足） */
export function getCaseAccentDark(item: ShowcaseCase): string {
  if (item.cover?.accent) return item.cover.accent;
  return CATEGORY_ACCENTS_DARK[item.category];
}

/** 终端组件通过内联 CSS 变量取强调色，dark: 变体才能覆盖内联样式 */
export function accentVars(item: ShowcaseCase): CSSProperties {
  return {
    "--sc-accent": getCaseAccent(item),
    "--sc-accent-dark": getCaseAccentDark(item),
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
