/**
 * Pure language / URL helpers with no runtime dependencies.
 *
 * Centralizes the URL-based i18n strategy so that server code (api.ts),
 * the i18n module, and the SEO module all share one source of truth.
 *
 * Language URL strategy:
 *   - en (default)  → root, NO prefix   (https://100mini.com/square)
 *   - zh/es/pt/fr   → /{lang} prefix    (https://100mini.com/zh/square)
 *
 * The "base path" is the path TanStack Router matches (lang prefix stripped).
 */

export const LANGS = ["en", "zh", "es", "pt", "fr"] as const;
export type Lang = (typeof LANGS)[number];

export const DEFAULT_LANG: Lang = "en";
export const BASE_URL = "https://100mini.com";

/** Languages that carry a URL prefix (everyone except the default en). */
export const PREFIXED_LANGS: readonly Lang[] = LANGS.filter(
  (l) => l !== DEFAULT_LANG
);

/**
 * Regex matching a non-default language prefix at the start of a pathname.
 * Built from PREFIXED_LANGS so it stays in sync if DEFAULT_LANG changes.
 *   matches "/zh/square", "/zh" — does NOT match "/square" (default en)
 */
const LANG_PREFIX_RE = new RegExp(`^\\/(${PREFIXED_LANGS.join("|")})(?=\\/|$)`);

/** BCP-47 language-region codes used for hreflang / <html lang>. */
const BCP47: Record<Lang, string> = {
  en: "en-US",
  zh: "zh-CN",
  es: "es-ES",
  pt: "pt-BR",
  fr: "fr-FR",
};

export function getBcp47(lng: string | undefined): string {
  const base = lng?.toLowerCase().split("-")[0] as Lang;
  return BCP47[base] ?? "en-US";
}

export function isLang(x: string): x is Lang {
  return (LANGS as readonly string[]).includes(x);
}

/**
 * Extract the language from a full pathname (the one in the browser URL bar).
 *   "/zh/square" → "zh"   "/zh" → "zh"   "/square" → "en"   "/" → "en"
 */
export function parseLangFromPath(pathname: string): Lang {
  const m = pathname.match(LANG_PREFIX_RE);
  return m && isLang(m[1]) ? m[1] : DEFAULT_LANG;
}

/**
 * Strip the language prefix, returning the "base path" TanStack matches.
 *   "/zh/square" → "/square"   "/zh" → "/"   "/square" → "/square"
 */
export function stripLangPrefix(pathname: string): string {
  const m = pathname.match(LANG_PREFIX_RE);
  if (!m) return pathname || "/";
  const rest = pathname.slice(m[0].length);
  return rest === "" ? "/" : rest;
}

/** Router basepath for a language. en → "/", others → "/zh", "/es", ... */
export function langBasepath(lang: Lang): string {
  if (lang === DEFAULT_LANG) return "/";
  return `/${lang}`;
}

/**
 * Prefix a base path with the language segment for public URLs.
 *   ("en", "/square") → "/square"   ("zh", "/square") → "/zh/square"
 *   ("zh", "/")       → "/zh"
 */
export function withLangPrefix(lang: Lang, basePath: string): string {
  const normalized = basePath === "" || basePath === "/" ? "/" : basePath;
  if (lang === DEFAULT_LANG) return normalized;
  return normalized === "/" ? `/${lang}` : `/${lang}${normalized}`;
}

export interface HeadLink {
  rel: string;
  href: string;
  // React's DOM property for the hreflang attribute is camelCase `hrefLang`
  // (TanStack renders head links through React on the client, which would warn
  // on a lowercase `hreflang` prop). React maps this to the lowercase `hreflang`
  // DOM attribute; HTML attribute names are case-insensitive so Google parses
  // the server-rendered `hrefLang=` identically.
  hrefLang?: string;
}

/** hreflang alternate <link> entries for every language + x-default. */
export function buildHreflangLinks(basePath: string): HeadLink[] {
  const links: HeadLink[] = LANGS.map((lang) => ({
    rel: "alternate",
    hrefLang: BCP47[lang],
    href: BASE_URL + withLangPrefix(lang, basePath),
  }));
  links.push({
    rel: "alternate",
    hrefLang: "x-default",
    href: BASE_URL + withLangPrefix(DEFAULT_LANG, basePath),
  });
  return links;
}

/** Canonical <link> for the current language version of a base path. */
export function buildCanonicalLink(basePath: string, lang: Lang): HeadLink {
  return {
    rel: "canonical",
    href: BASE_URL + withLangPrefix(lang, basePath),
  };
}
