/// <reference types="vite/client" />
import {
  CATEGORIES,
  DEFAULT_SHOWCASE_LOCALE,
  SHOWCASE_LOCALES,
  type ShowcaseCase,
  type ShowcaseCategory,
  type ShowcaseFact,
  type ShowcaseLocale,
  type ShowcaseSource,
} from "../types/showcase";
import { parseFrontmatter, type FrontmatterValue } from "./frontmatter";

/**
 * 案例库数据装配：`content/showcase/*.md` → ShowcaseCase
 *
 * 文件命名（新增案例只需丢文件，不改代码）：
 *   {key}.md          → 英文基准，必须存在；也是所有缺失翻译的回退源
 *   {key}.{locale}.md → 该语言的覆盖文件（zh / es / pt / fr）
 *
 * 覆盖文件可以只写**任意子集**：只翻正文、只改 summary、只补 tags 都行，
 * 缺的字段逐级回退到英文基准。所以先出英文、再逐步补翻译是可行的。
 * 注意：数组字段（tags / facts / sources）一旦在覆盖文件里出现就**整体替换**，
 * 不做逐项合并——这样没有意外合并，行为可预测。
 *
 * Vite 的 `import.meta.glob` 在构建期展开成静态 import，运行时不存在 glob。
 * 本模块**不引入 marked**：正文以字符串随数据带上，渲染交给
 * app/features/showcase/markdown.ts，这样只为 sitemap 取 slug/日期的
 * server 侧不必打包 Markdown 解析器。
 */

const RAW_FILES = import.meta.glob("../../content/showcase/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

type Dict = { [key: string]: FrontmatterValue };

interface RawCase {
  /** 文件名去掉语言后缀后的 key，用来把各语言版本归到一组 */
  key: string;
  locale: ShowcaseLocale;
  file: string;
  data: Dict;
  body: string;
}

/* ---------------- 基础工具 ---------------- */

function fileName(path: string): string {
  return path.split("/").pop() ?? path;
}

/** `photon.md` → { key: photon, locale: en }；`photon.zh.md` → { key: photon, locale: zh } */
function parseFileName(file: string): { key: string; locale: ShowcaseLocale } {
  const base = file.replace(/\.md$/, "");
  const dot = base.lastIndexOf(".");
  if (dot > 0) {
    const suffix = base.slice(dot + 1).toLowerCase();
    if ((SHOWCASE_LOCALES as readonly string[]).includes(suffix)) {
      return { key: base.slice(0, dot), locale: suffix as ShowcaseLocale };
    }
  }
  return { key: base, locale: DEFAULT_SHOWCASE_LOCALE };
}

function asDict(value: FrontmatterValue | undefined, field: string, file: string): Dict {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${file}: \`${field}\` 必须是映射（缩进子项）`);
  }
  return value as Dict;
}

function asList(value: FrontmatterValue | undefined, field: string, file: string): FrontmatterValue[] {
  if (!Array.isArray(value)) {
    throw new Error(`${file}: \`${field}\` 必须是列表（- 开头）`);
  }
  return value;
}

/** 字段是否「提供了有效值」：空字符串视为没提供，好让占位行回退到基准语言 */
function has(dict: Dict, field: string): boolean {
  const v = dict[field];
  if (typeof v === "string") return v.trim() !== "";
  return v !== undefined;
}

function str(dict: Dict, field: string, file: string, required: boolean): string | undefined {
  const v = dict[field];
  if (!has(dict, field)) {
    if (required) throw new Error(`${file}: 缺少必填字段 \`${field}\``);
    return undefined;
  }
  if (typeof v !== "string") throw new Error(`${file}: \`${field}\` 必须是字符串`);
  return v;
}

/* ---------------- 单文件解析 ---------------- */

function parseFile(path: string, raw: string): RawCase {
  const file = fileName(path);
  const { key, locale } = parseFileName(file);
  const { data, body } = parseFrontmatter(raw);
  return { key, locale, file, data, body };
}

/** 校验并读出各字段（required=false 时不强制存在） */
function readFields(
  rc: RawCase,
  required: boolean,
): {
  slug?: string;
  name?: string;
  summary?: string;
  category?: ShowcaseCategory;
  tags?: string[];
  facts?: ShowcaseFact[];
  sources?: ShowcaseSource[];
  externalUrl?: string;
  author?: string;
  publishedAt?: string;
  updatedAt?: string;
  cover?: { src: string; video?: string; videoPoster?: string };
} {
  const { data, file } = rc;

  let category: ShowcaseCategory | undefined;
  if (has(data, "category")) {
    const raw = str(data, "category", file, true)!;
    if (!(CATEGORIES as readonly string[]).includes(raw)) {
      throw new Error(`${file}: category 必须是 ${CATEGORIES.join(" / ")} 之一，收到 ${raw}`);
    }
    category = raw as ShowcaseCategory;
  } else if (required) {
    throw new Error(`${file}: 缺少必填字段 \`category\``);
  }

  let tags: string[] | undefined;
  if (has(data, "tags")) {
    tags = asList(data.tags, "tags", file).map((t) => String(t));
    if (tags.length === 0) throw new Error(`${file}: tags 不能为空`);
  } else if (required) {
    throw new Error(`${file}: 缺少必填字段 \`tags\``);
  }

  let facts: ShowcaseFact[] | undefined;
  if (has(data, "facts")) {
    facts = asList(data.facts, "facts", file).map((entry, i) => {
      const dict = asDict(entry, `facts[${i}]`, file);
      return {
        key: str(dict, "key", file, true)!,
        value: str(dict, "value", file, true)!,
        highlight: dict.highlight === true ? true : undefined,
      };
    });
    if (facts.length === 0) throw new Error(`${file}: facts 不能为空`);
    if (new Set(facts.map((f) => f.key)).size !== facts.length) {
      throw new Error(`${file}: facts 的 key 不能重复`);
    }
  } else if (required) {
    throw new Error(`${file}: 缺少必填字段 \`facts\``);
  }

  let sources: ShowcaseSource[] | undefined;
  if (has(data, "sources")) {
    sources = asList(data.sources, "sources", file).map((entry, i) => {
      const dict = asDict(entry, `sources[${i}]`, file);
      const url = str(dict, "url", file, true)!;
      if (!url.startsWith("https://")) {
        throw new Error(`${file}: sources[${i}].url 必须是 https，收到 ${url}`);
      }
      return {
        title: str(dict, "title", file, true)!,
        url,
        publisher: str(dict, "publisher", file, false),
        date: str(dict, "date", file, false),
      };
    });
    if (sources.length === 0) throw new Error(`${file}: sources 至少 1 条`);
  } else if (required) {
    throw new Error(`${file}: 缺少必填字段 \`sources\``);
  }

  let publishedAt: string | undefined;
  if (has(data, "publishedAt")) {
    publishedAt = str(data, "publishedAt", file, true)!;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(publishedAt)) {
      throw new Error(`${file}: publishedAt 必须是 yyyy-mm-dd，收到 ${publishedAt}`);
    }
  } else if (required) {
    throw new Error(`${file}: 缺少必填字段 \`publishedAt\``);
  }
  const updatedAt = str(data, "updatedAt", file, false);
  if (updatedAt && !/^\d{4}-\d{2}-\d{2}$/.test(updatedAt)) {
    throw new Error(`${file}: updatedAt 必须是 yyyy-mm-dd，收到 ${updatedAt}`);
  }

  let cover: { src: string; video?: string; videoPoster?: string } | undefined;
  if (has(data, "cover")) {
    const rawCover = asDict(data.cover, "cover", file);
    cover = {
      src: str(rawCover, "src", file, true)!,
      video: str(rawCover, "video", file, false),
      videoPoster: str(rawCover, "videoPoster", file, false),
    };
  } else if (required) {
    throw new Error(`${file}: 缺少必填字段 \`cover.src\``);
  }

  return {
    slug: str(data, "slug", file, false),
    name: str(data, "name", file, required),
    summary: str(data, "summary", file, required),
    category,
    tags,
    facts,
    sources,
    externalUrl: str(data, "externalUrl", file, false),
    author: str(data, "author", file, false),
    publishedAt,
    updatedAt,
    cover,
  };
}

/* ---------------- 按 slug 归组 + 合并 ---------------- */

interface Group {
  key: string;
  files: Partial<Record<ShowcaseLocale, RawCase>>;
}

const groups = new Map<string, Group>();
for (const [path, raw] of Object.entries(RAW_FILES)) {
  const rc = parseFile(path, raw);
  const group = groups.get(rc.key) ?? { key: rc.key, files: {} };
  if (group.files[rc.locale]) {
    throw new Error(
      `content/showcase: ${rc.key} 有多个 ${rc.locale} 版本（${fileName(path)} 与 ${group.files[rc.locale]!.file}）`,
    );
  }
  group.files[rc.locale] = rc;
  groups.set(rc.key, group);
}

export interface ShowcaseCaseSet {
  slug: string;
  /** 实际提供翻译的语言（一定含 en） */
  locales: ShowcaseLocale[];
  /** 已存在的语言版本；未翻译的语言不在这里 */
  cases: Partial<Record<ShowcaseLocale, ShowcaseCase>>;
}

function buildSet(group: Group): ShowcaseCaseSet {
  const base = group.files[DEFAULT_SHOWCASE_LOCALE];
  if (!base) {
    throw new Error(
      `content/showcase: ${group.key} 缺少英文基准文件 ${group.key}.md（en 是所有语言的回退源）`,
    );
  }

  const baseFields = readFields(base, true);
  const slug = (baseFields.slug ?? group.key).trim();
  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new Error(`${base.file}: slug 只能是小写字母/数字/连字符，收到 ${JSON.stringify(slug)}`);
  }

  const cases: Partial<Record<ShowcaseLocale, ShowcaseCase>> = {};
  const locales: ShowcaseLocale[] = [];

  for (const locale of SHOWCASE_LOCALES) {
    const rc = group.files[locale];
    if (locale !== DEFAULT_SHOWCASE_LOCALE && !rc) continue;

    const f = locale === DEFAULT_SHOWCASE_LOCALE ? baseFields : readFields(rc!, false);
    if (rc && f.slug && f.slug.trim() !== slug) {
      throw new Error(`${rc.file}: slug 与基准文件不一致（${f.slug} vs ${slug}）`);
    }
    const body = rc?.body?.trim() ? rc.body : base.body;
    if (!body) throw new Error(`${base.file}: frontmatter 之后没有正文`);

    cases[locale] = {
      slug,
      locale,
      name: f.name ?? baseFields.name!,
      summary: f.summary ?? baseFields.summary!,
      category: f.category ?? baseFields.category!,
      tags: f.tags ?? baseFields.tags!,
      facts: f.facts ?? baseFields.facts!,
      sources: f.sources ?? baseFields.sources!,
      body,
      externalUrl: f.externalUrl ?? baseFields.externalUrl,
      author: f.author ?? baseFields.author,
      publishedAt: f.publishedAt ?? baseFields.publishedAt!,
      updatedAt: f.updatedAt ?? baseFields.updatedAt,
      cover: { ...baseFields.cover!, ...f.cover },
    };
    locales.push(locale);
  }

  return { slug, locales, cases };
}

/** 全部案例（含各语言版本），按发布日期倒序、同日按 name 排序 */
export const SHOWCASE_CASE_SETS: ShowcaseCaseSet[] = Array.from(groups.values())
  .map(buildSet)
  .sort((a, b) => {
    const ac = a.cases[DEFAULT_SHOWCASE_LOCALE]!;
    const bc = b.cases[DEFAULT_SHOWCASE_LOCALE]!;
    return bc.publishedAt.localeCompare(ac.publishedAt) || ac.name.localeCompare(bc.name);
  });

/**
 * 某语言的案例列表，顺序与基准一致。该语言没有翻译的案例回退到英文，
 * 每个返回值的 `locale` 字段标明实际拿到的是哪种语言。
 */
export function listCases(locale?: ShowcaseLocale): ShowcaseCase[] {
  return SHOWCASE_CASE_SETS.map(
    (s) => (locale && s.cases[locale]) || s.cases[DEFAULT_SHOWCASE_LOCALE]!,
  );
}

/** 英文版本列表（sitemap 基准、兼容旧调用） */
export const SHOWCASE_CASES: ShowcaseCase[] = listCases(DEFAULT_SHOWCASE_LOCALE);

const setBySlug = new Map(SHOWCASE_CASE_SETS.map((s) => [s.slug, s]));

/** 该案例实际存在的语言版本（含 en）。未知 slug 返回 [] */
export function getCaseLocales(slug: string): ShowcaseLocale[] {
  return setBySlug.get(slug)?.locales ?? [];
}

/**
 * 取案例内容。指定语言没有翻译时**回退到英文**，
 * 返回值的 `locale` 字段告诉你实际拿到的是哪种语言。
 */
export function findCaseBySlug(slug: string, locale?: ShowcaseLocale): ShowcaseCase | undefined {
  const set = setBySlug.get(slug);
  if (!set) return undefined;
  if (locale && set.cases[locale]) return set.cases[locale];
  return set.cases[DEFAULT_SHOWCASE_LOCALE];
}
