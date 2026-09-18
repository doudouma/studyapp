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
 * 案例库数据装配：`content/showcase/{key}/*.md` → ShowcaseCase
 *
 * 目录结构（一个案例一个文件夹，新增案例只需建目录丢文件，不改代码）：
 *   {key}/en.md       → 英文基准，必须存在；也是所有缺失翻译的回退源
 *   {key}/{locale}.md → 该语言的覆盖文件（zh / es / pt / fr）
 *
 * 文件夹名即案例 slug（也是 URL 的 {slug}）。各语言覆盖文件可以只写**任意
 * 子集**：只翻正文、只改 summary、只补 tags 都行，缺的字段逐级回退到 en。
 * 数组字段（tags / facts / sources）一旦在覆盖文件里出现就整体替换。
 *
 * **按语言懒加载**：案例正文与各语言字段**不预置进主包**。`import.meta.glob`
 * 用非 eager 形式——路径（key / locale）在构建期静态可知，用来同步回答
 * 「有哪些案例」「某案例有哪些语言」（canonical / hreflang / 列表遍历需要）；
 * 具体内容在该语言被访问时由 `loadCase` / `loadCases` 动态拉取并缓存，所以
 * 一个页面只会加载当前语言的案例内容。
 *
 * 校验（缺少 en 基准 / 重复语言 / 字段非法等）在模块加载或 `loadCase` 时抛出，
 * 由 `tests/showcase.spec.ts` 遍历全部案例保证构建期就发现问题。
 */

type Dict = { [key: string]: FrontmatterValue };

interface RawCase {
  key: string;
  locale: ShowcaseLocale;
  /** 报错用的可读路径，如 `photon/zh.md` */
  file: string;
  data: Dict;
  body: string;
}

/* ---------------- 基础工具 ---------------- */

/** `.../showcase/photon/en.md` → `photon/en.md` */
function caseFilePath(path: string): string {
  return path.split("/").slice(-2).join("/");
}

/** `.../showcase/photon/en.md` → { key: photon, locale: en } */
function parsePath(path: string): { key: string; locale: ShowcaseLocale } {
  const parts = path.split("/");
  const locale = (parts[parts.length - 1] ?? "").replace(/\.md$/i, "").toLowerCase();
  const key = parts[parts.length - 2] ?? "";
  if (!(SHOWCASE_LOCALES as readonly string[]).includes(locale)) {
    throw new Error(
      `content/showcase/${caseFilePath(path)}: 文件名必须是语言代码之一（${SHOWCASE_LOCALES.join(" / ")}）`,
    );
  }
  return { key, locale: locale as ShowcaseLocale };
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

/* ---------------- 同步索引（仅来自 glob 路径，不含内容） ---------------- */

interface CaseEntry {
  key: string;
  files: Partial<Record<ShowcaseLocale, { file: string; load: () => Promise<string> }>>;
}

/**
 * 非 eager glob：`RAW_FILES` 的 value 是动态 import 函数，key 是文件路径。
 * Rollup 会在构建期为每个 .md 生成一个独立 chunk，主包只保留路径字符串。
 */
const RAW_FILES = import.meta.glob<string>("../../content/showcase/*/*.md", {
  query: "?raw",
  import: "default",
}) as Record<string, () => Promise<string>>;

const ENTRIES = new Map<string, CaseEntry>();
for (const [path, load] of Object.entries(RAW_FILES)) {
  const { key, locale } = parsePath(path);
  const entry = ENTRIES.get(key) ?? { key, files: {} };
  if (entry.files[locale]) {
    throw new Error(
      `content/showcase: ${key} 有多个 ${locale} 版本（${caseFilePath(path)} 与 ${entry.files[locale]!.file}）`,
    );
  }
  entry.files[locale] = { file: caseFilePath(path), load };
  ENTRIES.set(key, entry);
}
for (const entry of ENTRIES.values()) {
  if (!entry.files[DEFAULT_SHOWCASE_LOCALE]) {
    throw new Error(
      `content/showcase: ${entry.key} 缺少英文基准文件 ${entry.key}/en.md（en 是所有语言的回退源）`,
    );
  }
}

/** 全部案例的 slug（= 文件夹名），供 sitemap 等遍历 */
export function getCaseSlugs(): string[] {
  return Array.from(ENTRIES.keys());
}

/** 该案例实际存在的语言版本（含 en，按 SHOWCASE_LOCALES 顺序）。未知 slug 返回 [] */
export function getCaseLocales(slug: string): ShowcaseLocale[] {
  const entry = ENTRIES.get(slug);
  if (!entry) return [];
  return SHOWCASE_LOCALES.filter((l) => entry.files[l]);
}

/* ---------------- 单文件解析 ---------------- */

async function readRawCase(entry: CaseEntry, locale: ShowcaseLocale): Promise<RawCase> {
  const f = entry.files[locale];
  if (!f) throw new Error(`content/showcase: ${entry.key} 缺少 ${locale} 文件`);
  const { data, body } = parseFrontmatter(await f.load());
  return { key: entry.key, locale, file: f.file, data, body };
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

/* ---------------- 合并 + 缓存 ---------------- */

function mergeCase(entry: CaseEntry, base: RawCase, localized: RawCase | undefined): ShowcaseCase {
  const baseFields = readFields(base, true);

  // URL slug = 文件夹名。frontmatter 若写了 slug，必须与文件夹一致，
  // 否则 getCaseLocales/loadCase 会与 URL 对不上。
  if (baseFields.slug && baseFields.slug.trim() !== entry.key) {
    throw new Error(
      `${base.file}: slug 必须与文件夹名一致（${JSON.stringify(baseFields.slug.trim())} vs ${entry.key}）`,
    );
  }
  const slug = entry.key;
  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new Error(`content/showcase/${slug}: slug 只能是小写字母/数字/连字符`);
  }

  const f = localized ? readFields(localized, false) : baseFields;
  if (localized && f.slug && f.slug.trim() !== slug) {
    throw new Error(`${localized.file}: slug 与基准文件不一致（${f.slug} vs ${slug}）`);
  }

  const body = localized?.body?.trim() ? localized.body : base.body;
  if (!body) throw new Error(`${base.file}: frontmatter 之后没有正文`);

  return {
    slug,
    locale: localized ? localized.locale : DEFAULT_SHOWCASE_LOCALE,
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
}

/** key = `${slug}:${requestedLocale}`。未翻译时缓存的是回退后的英文版本 */
const caseCache = new Map<string, ShowcaseCase>();
const listCache = new Map<ShowcaseLocale, ShowcaseCase[]>();

/**
 * 加载单个案例。指定语言没有翻译时回退英文，返回值的 `locale` 标明实际语言。
 * 未知 slug 返回 undefined。结果缓存，同语言重复调用只加载一次。
 */
export async function loadCase(
  slug: string,
  locale?: ShowcaseLocale,
): Promise<ShowcaseCase | undefined> {
  const entry = ENTRIES.get(slug);
  if (!entry) return undefined;

  const requested = locale ?? DEFAULT_SHOWCASE_LOCALE;
  const cacheKey = `${slug}:${requested}`;
  const hit = caseCache.get(cacheKey);
  if (hit) return hit;

  const base = await readRawCase(entry, DEFAULT_SHOWCASE_LOCALE);
  const localized =
    requested !== DEFAULT_SHOWCASE_LOCALE && entry.files[requested]
      ? await readRawCase(entry, requested)
      : undefined;

  const item = mergeCase(entry, base, localized);
  caseCache.set(cacheKey, item);
  return item;
}

/**
 * 某语言的案例列表（含回退英文的项），按发布日期倒序、同日按 name 排序。
 * 每个返回值的 `locale` 标明实际拿到的语言。
 */
export async function loadCases(locale?: ShowcaseLocale): Promise<ShowcaseCase[]> {
  const loc = locale ?? DEFAULT_SHOWCASE_LOCALE;
  const hit = listCache.get(loc);
  if (hit) return hit;

  const items = (await Promise.all(getCaseSlugs().map((s) => loadCase(s, loc)))).filter(
    (c): c is ShowcaseCase => Boolean(c),
  );
  items.sort(
    (a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.name.localeCompare(b.name),
  );
  listCache.set(loc, items);
  return items;
}
