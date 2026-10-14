/**
 * 竞品对比页注册表（/alternatives/:competitor）。
 *
 * 单一事实来源是 `content/competitors/*.yaml`（供人维护与复核）；
 * 这里只保留渲染所需的稳定字段 + i18n key 前缀。新增竞品：
 *   1. 加一个 `content/competitors/{slug}.yaml`
 *   2. 在此登记（slug / 展示名 / i18nKey）
 *   3. 在 5 个 locale 补 `{i18nKey}.*` 文案
 */
export interface AlternativeCompetitor {
  slug: string;
  /** 品牌名（不翻译） */
  name: string;
  domain: string;
  /** i18n key 前缀，如 "altNetlifyDrop" */
  i18nKey: string;
  /** 事实核查日期 */
  asOf: string;
}

export const COMPETITORS: Record<string, AlternativeCompetitor> = {
  "netlify-drop": {
    slug: "netlify-drop",
    name: "Netlify Drop",
    domain: "netlify.com",
    i18nKey: "altNetlifyDrop",
    asOf: "2026-10",
  },
};

export function getCompetitor(slug: string): AlternativeCompetitor | undefined {
  return COMPETITORS[slug];
}

export function listCompetitors(): AlternativeCompetitor[] {
  return Object.values(COMPETITORS);
}
