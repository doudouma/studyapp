import i18n from "~/lib/i18n";
import {
  BASE_URL,
  currentLang,
  getBcp47,
  withLangPrefix,
  type Lang,
} from "~/lib/seo";
import type { ShowcaseCase, ShowcaseLocale } from "@shared/types/showcase";

/**
 * 案例详情页的 SEO 装配（纯函数，便于单测）。
 *
 * 与列表页不同，详情页在 `__root` 里会跳过通用 WebPage/BreadcrumbList
 * graph（见 app/routes/__root.tsx），所以这里的 Article / BreadcrumbList
 * 必须自带全部上下文，不能引用不存在的 `@id` 节点。
 */

/** `public/` 下的根路径补成绝对 URL，https 外链原样返回 */
function absolute(asset: string): string {
  return asset.startsWith("/") ? BASE_URL + asset : asset;
}

/** 案例 canonical URL：按内容实际语言加前缀（未翻译的案例指回英文原版） */
export function caseUrl(slug: string, locale: ShowcaseLocale): string {
  return BASE_URL + withLangPrefix(locale as Lang, `/showcase/${slug}`);
}

export interface HeadMeta {
  title?: string;
  name?: string;
  property?: string;
  content?: string;
}

const SITE_NAME = "100mini";
/** 站点图标，作为 Article.publisher.logo 的最小声明 */
const SITE_LOGO = `${BASE_URL}/icon.svg`;
/** 正文封面由内容 prompt 约定为 1200×630（社交分享标准尺寸） */
const COVER_WIDTH = 1200;
const COVER_HEIGHT = 630;

/** Article 结构化数据（含可选 VideoObject）。url 为该页 canonical URL */
export function buildArticleJsonLd(item: ShowcaseCase, url: string): Record<string, unknown> {
  const image = item.cover?.src ? absolute(item.cover.src) : undefined;
  const videoPoster = item.cover?.videoPoster
    ? absolute(item.cover.videoPoster)
    : undefined;

  const author = item.author
    ? { "@type": "Person", name: item.author }
    : // 作者缺失时回退站点，保证 Article 富结果要求的 author 始终存在
      { "@type": "Organization", name: SITE_NAME, url: BASE_URL };

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: item.name,
    description: item.summary,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    inLanguage: getBcp47(item.locale),
    keywords: item.tags.join(", "),
    articleSection: item.category,
    isAccessibleForFree: true,
    author,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: BASE_URL,
      logo: { "@type": "ImageObject", url: SITE_LOGO },
    },
    datePublished: item.publishedAt,
    dateModified: item.updatedAt ?? item.publishedAt,
    // Article 富结果要求 headline + image + datePublished 三者齐备
    image: image
      ? { "@type": "ImageObject", url: image, width: COVER_WIDTH, height: COVER_HEIGHT }
      : undefined,
    isBasedOn: item.externalUrl,
    citation: item.sources.map((s) => ({
      "@type": "CreativeWork",
      name: s.title,
      url: s.url,
      ...(s.publisher ? { publisher: { "@type": "Organization", name: s.publisher } } : {}),
      ...(s.date ? { datePublished: s.date } : {}),
    })),
    breadcrumb: { "@id": `${url}#breadcrumb` },
    video: item.cover?.video
      ? {
          "@type": "VideoObject",
          name: item.name,
          description: item.summary,
          contentUrl: item.cover.video,
          thumbnailUrl: videoPoster ?? image,
          // uploadDate 是 VideoObject 富结果的必填项
          uploadDate: item.publishedAt,
        }
      : undefined,
  };
}

/** 面包屑结构化数据：首页 / 案例库 / 当前案例 */
export function buildBreadcrumbJsonLd(
  item: ShowcaseCase,
  url: string,
  lang: Lang,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumb`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: i18n.t("nav.home", { lng: lang }),
        item: BASE_URL + "/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: i18n.t("showcase.heading", { lng: lang }),
        item: BASE_URL + withLangPrefix(lang, "/showcase"),
      },
      { "@type": "ListItem", position: 3, name: item.name, item: url },
    ],
  };
}

/** 详情页 meta + JSON-LD，供 route head() 直接返回 */
export function buildCaseHead(item: ShowcaseCase, lang: Lang = currentLang()) {
  const title = i18n.t("showcase.caseTitle", { name: item.name, lng: lang });
  const url = caseUrl(item.slug, item.locale);
  const image = item.cover?.src ? absolute(item.cover.src) : undefined;

  const meta: HeadMeta[] = [
    { title },
    { name: "description", content: item.summary },
    { name: "keywords", content: item.tags.join(", ") },
    ...(item.author ? [{ name: "author", content: item.author }] : []),
    { name: "robots", content: "index, follow" },
    { property: "og:type", content: "article" },
    { property: "og:title", content: title },
    { property: "og:description", content: item.summary },
    { property: "og:url", content: url },
    { property: "og:site_name", content: SITE_NAME },
    ...(image
      ? [
          { property: "og:image", content: image },
          { property: "og:image:alt", content: item.name },
        ]
      : []),
    // Open Graph article 命名空间：发布时间 / 修改时间 / 分类 / 标签
    { property: "article:published_time", content: item.publishedAt },
    { property: "article:modified_time", content: item.updatedAt ?? item.publishedAt },
    { property: "article:section", content: item.category },
    ...item.tags.map((tag) => ({ property: "article:tag", content: tag })),
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: item.summary },
    ...(image
      ? [
          { name: "twitter:image", content: image },
          { name: "twitter:image:alt", content: item.name },
        ]
      : []),
  ];

  return {
    meta,
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(buildArticleJsonLd(item, url)),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(buildBreadcrumbJsonLd(item, url, lang)),
      },
    ],
  };
}
