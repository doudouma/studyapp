/**
 * 案例库 (Showcase) 功能的共享类型与常量
 *
 * 前后端唯一数据契约来源：
 * - app 侧由 app/features/showcase/cases.ts 消费
 * - server 侧由 server/api.ts 生成 sitemap 时消费
 */

export const CATEGORIES = [
  "tools",
  "learning",
  "ai",
  "experiment",
  "resource",
] as const;

export type ShowcaseCategory = (typeof CATEGORIES)[number];

/** 终端风格封面色块 / 眉标用色，按分类取 */
export const CATEGORY_ACCENTS: Record<ShowcaseCategory, string> = {
  tools: "#0e7a4f",
  learning: "#1e40af",
  ai: "#6d28d9",
  experiment: "#92400e",
  resource: "#0f766e",
};

/**
 * 暗色模式下用于「文字」的分类强调色
 * 上面的浅色强调色在深底上对比度不足，这里换成同色相的亮色变体
 */
export const CATEGORY_ACCENTS_DARK: Record<ShowcaseCategory, string> = {
  tools: "#4edea3",
  learning: "#93b4ff",
  ai: "#c4b5fd",
  experiment: "#fbbf24",
  resource: "#5eead4",
};

/** 详情页 facts 键值表的一行 */
export interface ShowcaseFact {
  /** 展示用英文 key（author / platforms / users / cost / price ...） */
  key: string;
  value: string;
  /** 数值型亮点，用强调色 */
  highlight?: boolean;
}

/** 结论/档位的语义色调（替代能力、风险提示等） */
export type ShowcaseTone = "good" | "warn" | "neutral" | "bad";

/** 浅色 / 暗色两套色值，渲染时写成 CSS 变量（内联样式无法被 dark: 覆盖） */
export const TONE_COLORS: Record<ShowcaseTone, { light: string; dark: string }> = {
  good: { light: "#0e7a4f", dark: "#4edea3" },
  warn: { light: "#92400e", dark: "#fbbf24" },
  neutral: { light: "#4b5563", dark: "#9fb0c3" },
  bad: { light: "#b91c1c", dark: "#fca5a5" },
};

/** 表格单元格：可带档位色与次要说明 */
export interface ShowcaseCell {
  text: string;
  sub?: string;
  tone?: ShowcaseTone;
}

/**
 * 详情页正文的内容块。
 * 案例内容形态差异大（段落 / 清单 / 对照表 / 结论块），段落用 paragraphs 简写，
 * 其余用 blocks 表达。
 */
export type ShowcaseBlock =
  | { type: "text"; text: string }
  | { type: "list"; items: string[] }
  | { type: "table"; columns: string[]; rows: (string | ShowcaseCell)[][] }
  | { type: "note"; label?: string; text: string; tone?: ShowcaseTone };

/** 详情页正文的一节 */
export interface ShowcaseSection {
  heading: string;
  /** 纯段落简写，先于 blocks 渲染 */
  paragraphs?: string[];
  /** 清单 / 对照表 / 结论块等结构化内容 */
  blocks?: ShowcaseBlock[];
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
  /** 可选封面图：public/showcase/{slug}.webp 或 https 外链 */
  src?: string;
  /**
   * 可选首屏视频（https mp4）。**只在详情页加载**，列表卡片不加载，
   * 避免案例网格里出现 N 个视频请求。
   */
  video?: string;
  /** 视频海报图（https 或 public 路径）；缺省回退到 src */
  videoPoster?: string;
  /** 可选强调色，缺省按 category 取 CATEGORY_ACCENTS */
  accent?: string;
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
  sections: ShowcaseSection[];
  /** 至少 1 条 */
  sources: ShowcaseSource[];
  /** 案例原始网址（https） */
  externalUrl?: string;
  author?: string;
  /** ISO yyyy-mm-dd */
  publishedAt?: string;
  updatedAt?: string;
  cover?: ShowcaseCover;
}
