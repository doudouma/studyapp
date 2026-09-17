/// <reference types="vite/client" />
import {
  CATEGORIES,
  type ShowcaseCase,
  type ShowcaseCategory,
  type ShowcaseFact,
  type ShowcaseSource,
} from "../types/showcase";
import { parseFrontmatter, type FrontmatterValue } from "./frontmatter";

/**
 * 案例库数据装配：`content/showcase/*.md` → `ShowcaseCase[]`
 *
 * 新增一个案例 = 丢一个 .md 进 content/showcase/，无需改代码。
 * Vite 的 `import.meta.glob` 在构建期展开成静态 import，客户端与 Worker 里
 * 都不存在运行时 glob。
 *
 * 本模块**不引入 marked**：正文以字符串形式随数据带上，渲染交给
 * app/features/showcase/markdown.ts，这样只为 sitemap 取 slug/日期的
 * server 侧不必打包 Markdown 解析器。
 */

const RAW_CASES = import.meta.glob("../../content/showcase/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

type Dict = { [key: string]: FrontmatterValue };

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

function reqStr(dict: Dict, field: string, file: string): string {
  const v = dict[field];
  if (typeof v !== "string" || !v.trim()) {
    throw new Error(`${file}: 缺少必填字段 \`${field}\``);
  }
  return v;
}

function optStr(dict: Dict, field: string, file: string): string | undefined {
  const v = dict[field];
  if (v === undefined || v === "") return undefined;
  if (typeof v !== "string") throw new Error(`${file}: \`${field}\` 必须是字符串`);
  return v;
}

function fileName(path: string): string {
  return path.split("/").pop() ?? path;
}

function buildCase(path: string, raw: string): ShowcaseCase {
  const file = fileName(path);
  const { data, body } = parseFrontmatter(raw);

  const slug = (optStr(data, "slug", file) ?? file.replace(/\.md$/, "")).trim();
  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new Error(`${file}: slug 只能是小写字母/数字/连字符，收到 ${JSON.stringify(slug)}`);
  }

  const category = reqStr(data, "category", file) as ShowcaseCategory;
  if (!(CATEGORIES as readonly string[]).includes(category)) {
    throw new Error(`${file}: category 必须是 ${CATEGORIES.join(" / ")} 之一，收到 ${category}`);
  }

  const tags = asList(data.tags, "tags", file).map((t) => String(t));
  if (tags.length === 0) throw new Error(`${file}: tags 不能为空`);

  const coverRaw = asDict(data.cover, "cover", file);
  const cover = {
    src: reqStr(coverRaw, "src", file),
    video: optStr(coverRaw, "video", file),
    videoPoster: optStr(coverRaw, "videoPoster", file),
    accent: optStr(coverRaw, "accent", file),
  };

  const facts: ShowcaseFact[] = asList(data.facts, "facts", file).map((entry, i) => {
    const dict = asDict(entry, `facts[${i}]`, file);
    return {
      key: reqStr(dict, "key", file),
      value: reqStr(dict, "value", file),
      highlight: dict.highlight === true ? true : undefined,
    };
  });
  if (facts.length === 0) throw new Error(`${file}: facts 不能为空`);
  if (new Set(facts.map((f) => f.key)).size !== facts.length) {
    throw new Error(`${file}: facts 的 key 不能重复`);
  }

  const sources: ShowcaseSource[] = asList(data.sources, "sources", file).map((entry, i) => {
    const dict = asDict(entry, `sources[${i}]`, file);
    const url = reqStr(dict, "url", file);
    if (!url.startsWith("https://")) {
      throw new Error(`${file}: sources[${i}].url 必须是 https，收到 ${url}`);
    }
    return {
      title: reqStr(dict, "title", file),
      url,
      publisher: optStr(dict, "publisher", file),
      date: optStr(dict, "date", file),
    };
  });
  if (sources.length === 0) throw new Error(`${file}: sources 至少 1 条`);

  const publishedAt = reqStr(data, "publishedAt", file);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(publishedAt)) {
    throw new Error(`${file}: publishedAt 必须是 yyyy-mm-dd，收到 ${publishedAt}`);
  }
  const updatedAt = optStr(data, "updatedAt", file);
  if (updatedAt && !/^\d{4}-\d{2}-\d{2}$/.test(updatedAt)) {
    throw new Error(`${file}: updatedAt 必须是 yyyy-mm-dd，收到 ${updatedAt}`);
  }

  if (!body) throw new Error(`${file}: frontmatter 之后没有正文`);

  return {
    slug,
    name: reqStr(data, "name", file),
    summary: reqStr(data, "summary", file),
    category,
    tags,
    facts,
    sources,
    body,
    externalUrl: optStr(data, "externalUrl", file),
    author: optStr(data, "author", file),
    publishedAt,
    updatedAt,
    cover,
  };
}

/** 全部案例：按发布日期倒序，同日按 name 排序 */
export const SHOWCASE_CASES: ShowcaseCase[] = Object.entries(RAW_CASES)
  .map(([path, raw]) => buildCase(path, raw))
  .sort(
    (a, b) =>
      b.publishedAt.localeCompare(a.publishedAt) || a.name.localeCompare(b.name),
  );

const bySlug = new Map(SHOWCASE_CASES.map((c) => [c.slug, c]));

export function findCaseBySlug(slug: string): ShowcaseCase | undefined {
  return bySlug.get(slug);
}
