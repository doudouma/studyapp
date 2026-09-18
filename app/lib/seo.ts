import i18n from "./i18n";
import { getCaseLocales } from "@shared/showcase";
import type { ShowcaseLocale } from "@shared/types/showcase";
import {
  LANGS,
  DEFAULT_LANG,
  BASE_URL,
  buildHreflangLinksFor,
  getBcp47,
  isLang,
  withLangPrefix,
  type HeadLink,
  type Lang,
} from "./lang";

// Re-export the pure helpers so callers can import everything from "~/lib/seo".
export {
  LANGS,
  DEFAULT_LANG,
  BASE_URL,
  PREFIXED_LANGS,
  getBcp47,
  isLang,
  parseLangFromPath,
  stripLangPrefix,
  langBasepath,
  withLangPrefix,
  buildHreflangLinks,
  buildCanonicalLink,
  type Lang,
  type HeadLink,
} from "./lang";

/**
 * The active language, normalized to a 2-letter code, read from the i18n
 * instance (which server.tsx sets from the URL prefix before SSR, and the
 * client sets from window.location). Falls back to the default lang.
 */
export function currentLang(): Lang {
  const raw = i18n.language?.split("-")[0];
  return isLang(raw) ? raw : DEFAULT_LANG;
}

const CASE_PATH_RE = /^\/showcase\/([a-z0-9-]+)$/;

/** 案例详情页路径 → slug；非案例页返回 null */
export function caseSlugFromPath(basePath: string): string | null {
  const m = CASE_PATH_RE.exec(basePath);
  return m ? m[1] : null;
}

/**
 * 页面的 canonical 路径（语言前缀之后的部分）。
 *
 * 案例详情页各语言内容并不等价：某语言没有翻译时会回退渲染英文，
 * 这时 canonical 指回 en，避免把英文内容当成该语言页面收录。
 * 只依赖「该案例有哪些语言」（同步索引），不需要加载正文。
 */
export function canonicalPathFor(basePath: string, lang: Lang): string {
  const slug = caseSlugFromPath(basePath);
  if (!slug) return withLangPrefix(lang, basePath);
  const hasTranslation = getCaseLocales(slug).includes(lang as ShowcaseLocale);
  return withLangPrefix((hasTranslation ? lang : DEFAULT_LANG) as Lang, basePath);
}

/**
 * 页面的 hreflang alternates。
 *
 * 案例详情页只声明**真的存在翻译**的语言——把未翻译语言的 URL 写进 hreflang
 * 等于告诉搜索引擎那些页面是独立语言版本，而它们内容其实是英文。
 */
export function hreflangLinksForPath(basePath: string): HeadLink[] {
  const slug = caseSlugFromPath(basePath);
  if (!slug) return buildHreflangLinksFor(basePath, LANGS);
  const langs = getCaseLocales(slug);
  if (langs.length === 0) return [];
  return buildHreflangLinksFor(basePath, langs as Lang[]);
}

/**
 * 站点级默认社交分享图（1200×630，`public/og-default.jpg`）。
 * 页面没有自己的分享图时用它——先前各页用的是 177×177 的 spritesheet 帧，
 * 低于 twitter `summary_large_image` 的最小宽度（300px）。
 */
export const DEFAULT_OG_IMAGE = `${BASE_URL}/og-default.jpg`;

/**
 * Map a base path to the i18n keys for that page's name/description.
 * Used to produce localized JSON-LD per language.
 */
function pageKeys(basePath: string): { name: string; desc: string } {
  switch (basePath) {
    case "/":
      return { name: "app.title", desc: "app.desc" };
    case "/square":
      return { name: "square.heading", desc: "square.desc" };
    case "/showcase":
      return { name: "showcase.h1", desc: "showcase.desc" };
    case "/md2html":
      return { name: "md2html.seoTitle", desc: "md2html.seoDesc" };
    case "/any2md":
      return { name: "any2md.heading", desc: "any2md.subtitle" };
    case "/freetool":
      return { name: "freetool.heading", desc: "freetool.desc" };
    case "/idphoto":
      return { name: "idphoto.heading", desc: "idphoto.desc" };
    case "/pomodoro":
      return { name: "nav.pomodoro", desc: "pomodoro.desc" };
    case "/rhythm":
      return { name: "rhythm.brand", desc: "rhythm.desc" };
    case "/papercut":
      return { name: "papercut.seo.heading", desc: "papercut.desc" };
    case "/links":
      return { name: "profile.heading", desc: "profile.desc" };
    case "/contact":
      return { name: "contact.heading", desc: "contact.desc" };
    case "/privacy":
      return { name: "privacy.heading", desc: "privacy.desc" };
    case "/terms":
      return { name: "terms.heading", desc: "terms.desc" };
    case "/cookie":
      return { name: "cookie.heading", desc: "cookie.desc" };
    default:
      return { name: "app.title", desc: "app.desc" };
  }
}

/** Breadcrumb trail for a base path (localized labels via i18n). */
function breadcrumbs(basePath: string): { name: string; path: string }[] {
  const home = { name: i18n.t("nav.home"), path: "/" };
  const keys = pageKeys(basePath);
  if (basePath === "/") return [home];
  return [home, { name: i18n.t(keys.name), path: basePath }];
}

/**
 * Build the localized JSON-LD blocks for a page.
 * Each language version gets its own set (inLanguage + language-specific URLs).
 *
 * Returns meta entries in the TanStack `{ "script:ld+json": object }` shape.
 */
export function buildJsonLd(basePath: string, lang: Lang): object[] {
  const bcp = getBcp47(lang);
  const langRoot = BASE_URL + withLangPrefix(lang, "/");
  const pageUrl = BASE_URL + withLangPrefix(lang, basePath);
  const keys = pageKeys(basePath);
  const siteName = i18n.t("app.title");
  const siteDesc = i18n.t("app.desc");
  const pageName = i18n.t(keys.name);
  const pageDesc = i18n.t(keys.desc);

  const organization = {
    "@type": "Organization",
    name: "100mini",
    url: BASE_URL,
    logo: `${BASE_URL}/icon.svg`,
    contactPoint: {
      "@type": "ContactPoint",
      email: "hello@100mini.com",
      contactType: "customer support",
    },
  };

  const webSite = {
    "@type": "WebSite",
    "@id": `${langRoot}#website`,
    url: langRoot,
    name: siteName,
    description: siteDesc,
    inLanguage: bcp,
    publisher: { "@id": `${BASE_URL}/#organization` },
  };

  const webPage = {
    "@type": "WebPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name: pageName,
    description: pageDesc,
    inLanguage: bcp,
    isPartOf: { "@id": `${langRoot}#website` },
    breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
  };

  const crumbs = breadcrumbs(basePath).map((c, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: c.name,
    item: BASE_URL + withLangPrefix(lang, c.path),
  }));
  const breadcrumbList = {
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    itemListElement: crumbs,
  };

  // On the home page, also describe the product (free HTML hosting tool).
  const blocks: object[] = [
    {
      "@context": "https://schema.org",
      "@graph": [organization, webSite, webPage, breadcrumbList],
    },
  ];
  if (basePath === "/") {
    blocks.push({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: siteName,
      url: langRoot,
      description: siteDesc,
      inLanguage: bcp,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Any",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      publisher: { "@id": `${BASE_URL}/#organization` },
    });
  }
  return blocks;
}
