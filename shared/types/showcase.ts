/**
 * 案例库 (Showcase) 功能的共享类型与常量
 *
 * 前后端唯一数据契约来源：
 * - app 侧由 app/features/showcase/* 消费
 * - server 侧由 server/api.ts 生成 sitemap 时消费
 *
 * 案例内容本身写在 content/showcase/*.md（frontmatter + Markdown 正文），
 * 由 shared/showcase/index.ts 解析成 ShowcaseCase[]。
 */

export const CATEGORIES = [
  "tools",
  "learning",
  "ai",
  "experiment",
  "resource",
] as const;

export type ShowcaseCategory = (typeof CATEGORIES)[number];

/**
 * 案例强调色：固定站点主绿，**不随分类变化**。
 * 分类色只在列表页的过滤 pill 文本上体现，详情页与卡片统一用这一组。
 */
export const SHOWCASE_ACCENT = "#006c49";
export const SHOWCASE_ACCENT_DARK = "#4edea3";

/** 结论/档位的语义色调（替代能力、风险提示等） */
export type ShowcaseTone = "good" | "warn" | "neutral" | "bad";

/** 浅色 / 暗色两套色值，渲染时写成 CSS 变量（内联样式无法被 dark: 覆盖） */
export const TONE_COLORS: Record<ShowcaseTone, { light: string; dark: string }> = {
  good: { light: "#0e7a4f", dark: "#4edea3" },
  warn: { light: "#92400e", dark: "#fbbf24" },
  neutral: { light: "#4b5563", dark: "#9fb0c3" },
  bad: { light: "#b91c1c", dark: "#fca5a5" },
};

/** 详情页 facts 键值表的一行 */
export interface ShowcaseFact {
  /** 展示用英文 key（author / platforms / users / cost / price ...） */
  key: string;
  value: string;
  /** 数值型亮点，用强调色 */
  highlight?: boolean;
}

/** 详情页来源清单的一条（编号外链，便于正文 [n] 引用） */
export interface ShowcaseSource {
  title: string;
  /** 必须为 https */
  url: string;
  publisher?: string;
  date?: string;
}

export interface ShowcaseCover {
  /** 必填封面图：public/showcase/{slug}.jpg 或 https 外链。og:image + Article.image 都用它 */
  src: string;
  /**
   * 可选首屏视频（https mp4）。**只在详情页加载**，列表卡片不加载，
   * 避免案例网格里出现 N 个视频请求。
   */
  video?: string;
  /** 视频海报图（https 或 public 路径）；缺省回退到 src */
  videoPoster?: string;
}

export interface ShowcaseCase {
  /** URL-safe、永久稳定的引用标识（^[a-z0-9-]+$），一经发布不可更改 */
  slug: string;
  name: string;
  /** 一句话英文摘要，用于卡片与 meta description */
  summary: string;
  category: ShowcaseCategory;
  tags: string[];
  facts: ShowcaseFact[];
  /** 至少 1 条 */
  sources: ShowcaseSource[];
  /**
   * 正文 Markdown（frontmatter 之后的内容，**不含** frontmatter）。
   * 渲染时按 `## ` 分节，由 app/features/showcase/markdown.ts 转成 HTML。
   */
  body: string;
  /** 案例原始网址（https） */
  externalUrl?: string;
  author?: string;
  /** ISO yyyy-mm-dd。Article.datePublished 与 sitemap 都依赖它 */
  publishedAt: string;
  updatedAt?: string;
  cover: ShowcaseCover;
}
