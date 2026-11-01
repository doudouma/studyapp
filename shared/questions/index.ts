/// <reference types="vite/client" />
import {
  DEFAULT_QUESTION_LOCALE,
  QUESTION_LOCALES,
  type QuestionArticle,
  type QuestionFact,
  type QuestionLocale,
} from "../types/questions";
import { parseFrontmatter, type FrontmatterValue } from "../showcase/frontmatter";

/**
 * 「100 个问题」内容装配：content/questions/{key}/*.md → QuestionArticle
 *
 * 目录结构：
 *   {key}/en.md       → 英文基准，必须存在（默认语言与回退源）
 *   {key}/{locale}.md → 其它语言覆盖文件，可只写任意子集
 *
 * 与 showcase 一样使用非 eager glob：列表/索引只依赖路径，正文按语言懒加载。
 */

type Dict = { [key: string]: FrontmatterValue };

interface RawArticle {
  key: string;
  locale: QuestionLocale;
  file: string;
  data: Dict;
  body: string;
}

function filePath(path: string): string {
  return path.split("/").slice(-2).join("/");
}

function parsePath(path: string): { key: string; locale: QuestionLocale } {
  const parts = path.split("/");
  const locale = (parts[parts.length - 1] ?? "").replace(/\.md$/i, "").toLowerCase();
  const key = parts[parts.length - 2] ?? "";
  if (!(QUESTION_LOCALES as readonly string[]).includes(locale)) {
    throw new Error(
      `content/questions/${filePath(path)}: 文件名必须是语言代码之一（${QUESTION_LOCALES.join(" / ")}）`,
    );
  }
  return { key, locale: locale as QuestionLocale };
}

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

function asList(value: FrontmatterValue | undefined, field: string, file: string): FrontmatterValue[] {
  if (!Array.isArray(value)) throw new Error(`${file}: \`${field}\` 必须是列表（- 开头）`);
  return value;
}

function asDict(value: FrontmatterValue | undefined, field: string, file: string): Dict {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${file}: \`${field}\` 必须是映射（缩进子项）`);
  }
  return value as Dict;
}

interface Entry {
  key: string;
  files: Partial<Record<QuestionLocale, { file: string; load: () => Promise<string> }>>;
}

const RAW_FILES = import.meta.glob<string>("../../content/questions/*/*.md", {
  query: "?raw",
  import: "default",
}) as Record<string, () => Promise<string>>;

const ENTRIES = new Map<string, Entry>();
for (const [path, load] of Object.entries(RAW_FILES)) {
  const { key, locale } = parsePath(path);
  const entry = ENTRIES.get(key) ?? { key, files: {} };
  if (entry.files[locale]) {
    throw new Error(`content/questions: ${key} 有多个 ${locale} 版本`);
  }
  entry.files[locale] = { file: filePath(path), load };
  ENTRIES.set(key, entry);
}
for (const entry of ENTRIES.values()) {
  if (!entry.files[DEFAULT_QUESTION_LOCALE]) {
    throw new Error(
      `content/questions: ${entry.key} 缺少默认语言文件 ${entry.key}/${DEFAULT_QUESTION_LOCALE}.md`,
    );
  }
}

export function getQuestionSlugs(): string[] {
  return Array.from(ENTRIES.keys());
}

export function getQuestionLocales(slug: string): QuestionLocale[] {
  const entry = ENTRIES.get(slug);
  if (!entry) return [];
  return QUESTION_LOCALES.filter((l) => entry.files[l]);
}

async function readRaw(entry: Entry, locale: QuestionLocale): Promise<RawArticle> {
  const f = entry.files[locale];
  if (!f) throw new Error(`content/questions: ${entry.key} 缺少 ${locale} 文件`);
  const { data, body } = parseFrontmatter(await f.load());
  return { key: entry.key, locale, file: f.file, data, body };
}

function readFields(rc: RawArticle, required: boolean) {
  const { data, file } = rc;
  let tags: string[] | undefined;
  if (has(data, "tags")) {
    tags = asList(data.tags, "tags", file).map(String);
  } else if (required) {
    throw new Error(`${file}: 缺少必填字段 \`tags\``);
  }

  let facts: QuestionFact[] | undefined;
  if (has(data, "facts")) {
    facts = asList(data.facts, "facts", file).map((entry, i) => {
      const dict = asDict(entry, `facts[${i}]`, file);
      return {
        key: str(dict, "key", file, true)!,
        value: str(dict, "value", file, true)!,
        highlight: dict.highlight === true ? true : undefined,
      };
    });
  }

  const num = (field: string, fallback: number): number => {
    const raw = str(data, field, file, false);
    if (!raw) return fallback;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };

  return {
    slug: str(data, "slug", file, false),
    title: str(data, "title", file, required),
    summary: str(data, "summary", file, required),
    tags,
    facts,
    author: str(data, "author", file, false),
    publishedAt: str(data, "publishedAt", file, required),
    updatedAt: str(data, "updatedAt", file, false),
    questionCount: num("questionCount", 0),
    chapterCount: num("chapterCount", 0),
    faq: data.faq === false ? false : undefined,
  };
}

const cache = new Map<string, QuestionArticle>();
const listCache = new Map<QuestionLocale, QuestionArticle[]>();

function merge(entry: Entry, base: RawArticle, localized: RawArticle | undefined): QuestionArticle {
  const b = readFields(base, true);
  if (b.slug && b.slug.trim() !== entry.key) {
    throw new Error(`${base.file}: slug 必须与文件夹名一致（${b.slug} vs ${entry.key}）`);
  }
  const slug = entry.key;
  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new Error(`content/questions/${slug}: slug 只能是小写字母/数字/连字符`);
  }
  const f = localized ? readFields(localized, false) : b;
  const body = localized?.body?.trim() ? localized.body : base.body;
  if (!body) throw new Error(`${base.file}: frontmatter 之后没有正文`);
  return {
    slug,
    locale: localized ? localized.locale : DEFAULT_QUESTION_LOCALE,
    title: f.title ?? b.title!,
    summary: f.summary ?? b.summary!,
    tags: f.tags ?? b.tags!,
    facts: f.facts ?? b.facts ?? [],
    body,
    author: f.author ?? b.author,
    publishedAt: f.publishedAt ?? b.publishedAt!,
    updatedAt: f.updatedAt ?? b.updatedAt,
    questionCount: f.questionCount || b.questionCount || 0,
    chapterCount: f.chapterCount || b.chapterCount || 0,
    faq: f.faq ?? b.faq,
  };
}

export async function loadQuestion(
  slug: string,
  locale?: QuestionLocale,
): Promise<QuestionArticle | undefined> {
  const entry = ENTRIES.get(slug);
  if (!entry) return undefined;
  const requested = locale ?? DEFAULT_QUESTION_LOCALE;
  const cacheKey = `${slug}:${requested}`;
  const hit = cache.get(cacheKey);
  if (hit) return hit;
  const base = await readRaw(entry, DEFAULT_QUESTION_LOCALE);
  const localized =
    requested !== DEFAULT_QUESTION_LOCALE && entry.files[requested]
      ? await readRaw(entry, requested)
      : undefined;
  const item = merge(entry, base, localized);
  cache.set(cacheKey, item);
  return item;
}

export async function loadQuestions(locale?: QuestionLocale): Promise<QuestionArticle[]> {
  const loc = locale ?? DEFAULT_QUESTION_LOCALE;
  const hit = listCache.get(loc);
  if (hit) return hit;
  const items = (await Promise.all(getQuestionSlugs().map((s) => loadQuestion(s, loc)))).filter(
    (a): a is QuestionArticle => Boolean(a),
  );
  items.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.title.localeCompare(b.title));
  listCache.set(loc, items);
  return items;
}
