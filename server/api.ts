/// <reference types="@cloudflare/workers-types" />
import { Hono } from "hono";
import {
  LANGS,
  DEFAULT_LANG,
  withLangPrefix,
  BASE_URL,
  getBcp47,
  type Lang,
} from "../app/lib/lang";
import { getCaseLocales, getCaseSlugs, loadCase } from "../shared/showcase";
import { AI_BOOK_PAGES } from "../shared/books/programmatic";
import { type ShowcaseLocale } from "../shared/types/showcase";
import { getQuestionLocales, getQuestionSlugs, loadQuestion } from "../shared/questions";
import {
  DEFAULT_QUESTION_LOCALE,
  QUESTION_LOCALES,
  type QuestionLocale,
} from "../shared/types/questions";
import { squareRoutes } from "./features/square/square.routes";
import { pagesRoutes } from "./features/pages/pages.routes";
import { adminRoutes } from "./features/admin/admin.routes";
import { pomodoroRoutes } from "./features/pomodoro/pomodoro.routes";
import { wardrobeRoutes } from "./features/wardrobe/wardrobe.routes";
import { rankRoutes } from "./features/rank/rank.routes";
import { ensoRoutes } from "./features/enso/enso.routes";
import { outbreakRoutes } from "./features/outbreak/outbreak.routes";
import { tierlistRoutes } from "./features/tierlist/tierlist.routes";
import { log } from "./lib/log";
import llmsTxt from "./content/llms.txt?raw";
import llmsFullTxt from "./content/llms-full.txt?raw";
import aiBooksMd from "./content/ai-books.md?raw";
import pricingMd from "./content/pricing.md?raw";

type Variables = {
  user: { id: string; name: string; email: string; image?: string; role?: string } | null;
  session: any;
};

const api = new Hono<{
  Bindings: { BUCKET?: R2Bucket; D1?: D1Database; AI?: Ai };
  Variables: Variables;
}>();

api.onError((err, c) => {
  log.error("API异常", { path: c.req.path, status: "error", error: String(err) });
  return c.json({ error: err.message || "Internal Server Error" }, 500);
});

// --- SEO: multilingual sitemaps & robots ---
//
// Language URL strategy: en (default) at root (no prefix); zh/es/pt/fr at
// /{lang}/... . Each language has its own sitemap for individual Google Search
// Console submission, plus a sitemap index at /sitemap.xml listing them all.
// Every URL advertises its hreflang alternates via <xhtml:link> so search
// engines know the language-region correspondence.

const STATIC_PAGES: { loc: string; changefreq: string; priority: string; lastmod?: string }[] = [
  { loc: "/", changefreq: "daily", priority: "1.0" },
  { loc: "/square", changefreq: "hourly", priority: "0.9" },
  { loc: "/showcase", changefreq: "weekly", priority: "0.8" },
  { loc: "/ai-books", changefreq: "weekly", priority: "0.8", lastmod: "2026-11-03" },
  { loc: "/ai-books/free", changefreq: "weekly", priority: "0.8", lastmod: "2026-11-03" },
  { loc: "/ai-books/learning-path", changefreq: "monthly", priority: "0.7", lastmod: "2026-11-03" },
  { loc: "/md2html", changefreq: "weekly", priority: "0.8" },
  { loc: "/any2md", changefreq: "weekly", priority: "0.8" },
  { loc: "/claude-artifact-to-link", changefreq: "weekly", priority: "0.8" },
  { loc: "/host-single-html", changefreq: "weekly", priority: "0.8" },
  { loc: "/make-html-file-into-website", changefreq: "monthly", priority: "0.7" },
  { loc: "/alternatives", changefreq: "weekly", priority: "0.7" },
  { loc: "/alternatives/netlify-drop", changefreq: "monthly", priority: "0.7" },
  { loc: "/alternatives/tiiny-host", changefreq: "monthly", priority: "0.7" },
  { loc: "/alternatives/codepen", changefreq: "monthly", priority: "0.7" },
  { loc: "/alternatives/vercel", changefreq: "monthly", priority: "0.7" },
  { loc: "/alternatives/github-pages", changefreq: "monthly", priority: "0.7" },
  { loc: "/alternatives/ai-native-share", changefreq: "monthly", priority: "0.7" },
  { loc: "/freetool", changefreq: "weekly", priority: "0.7", lastmod: "2026-11-03" },
  { loc: "/ai-skills-assessment", changefreq: "monthly", priority: "0.7", lastmod: "2026-11-03" },
  { loc: "/games", changefreq: "weekly", priority: "0.8" },
  { loc: "/idphoto", changefreq: "weekly", priority: "0.7" },
  { loc: "/ai-tierlist", changefreq: "weekly", priority: "0.7" },
  { loc: "/ai-tierlist-stats", changefreq: "weekly", priority: "0.7" },
  // /links (My Pages) is a login-gated dashboard — intentionally excluded from
  // the sitemap and marked noindex (see app/routes/links.tsx).
  { loc: "/burn-after-reading-link", changefreq: "weekly", priority: "0.8" },
  { loc: "/temporary-link", changefreq: "weekly", priority: "0.8" },
  { loc: "/pomodoro", changefreq: "weekly", priority: "0.6" },
  { loc: "/rhythm", changefreq: "weekly", priority: "0.6" },
  { loc: "/petsafe", changefreq: "weekly", priority: "0.7" },
  { loc: "/petbadge", changefreq: "weekly", priority: "0.7" },
  { loc: "/papercut", changefreq: "weekly", priority: "0.7" },
  { loc: "/deliveryrush", changefreq: "weekly", priority: "0.7" },
  { loc: "/enso", changefreq: "weekly", priority: "0.7" },
  { loc: "/outbreak", changefreq: "weekly", priority: "0.7" },
  { loc: "/contact", changefreq: "yearly", priority: "0.3" },
  { loc: "/privacy", changefreq: "yearly", priority: "0.3" },
  { loc: "/terms", changefreq: "yearly", priority: "0.3" },
  { loc: "/cookie", changefreq: "yearly", priority: "0.3" },
];

const XML_HDR = '<?xml version="1.0" encoding="UTF-8"?>';

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (ch) =>
    ch === "<" ? "&lt;" : ch === ">" ? "&gt;" : ch === "&" ? "&amp;" : ch === "'" ? "&apos;" : "&quot;"
  );
}

// AI crawlers, grouped by documented purpose:
//  - Retrieval bots drive citations (ChatGPT / Perplexity / Claude / Copilot)
//  - Training bots are a deliberate policy choice, not an oversight
// Each group repeats the private-path Disallows because a specific
// User-agent group overrides the "*" group entirely.
const AI_RETRIEVAL_BOTS = [
  "OAI-SearchBot", // ChatGPT search index
  "ChatGPT-User", // user-triggered fetch in ChatGPT
  "PerplexityBot", // Perplexity index
  "Perplexity-User", // user-triggered fetch in Perplexity
  "Claude-SearchBot", // Claude search index
  "Claude-User", // user-triggered fetch in Claude
];
const AI_TRAINING_BOTS = [
  "GPTBot", // OpenAI model training
  "ClaudeBot", // Anthropic model training
  "Google-Extended", // controls Gemini training/grounding of crawled content
];

// Link-preview fetchers (iMessage, Slack, X, Telegram, Discord, LinkedIn,
// WhatsApp, Pinterest, Facebook). These are the ONLY agents allowed to reach
// /p/* — blocking them would kill the OG card for every shared link, which is
// the core of the product.
const SOCIAL_PREVIEW_BOTS = [
  "facebookexternalhit", // Facebook, iMessage, Signal, Mastodon
  "Twitterbot", // X / Twitter
  "Slackbot", // Slack unfurls (Slackbot-LinkExpanding)
  "TelegramBot",
  "Discordbot",
  "LinkedInBot",
  "WhatsApp",
  "Pinterestbot",
  "redditbot",
];

/**
 * 生成一个 User-agent 组。搜索/AI 爬虫统一 Disallow `/p/`：
 * `/p/*` 是用户上传的任意 HTML（主题、语言、质量都不可控），收录它只会
 * 稀释站点级质量信号。预览类爬虫是唯一例外，见 SOCIAL_PREVIEW_BOTS。
 */
function botGroup(agents: string[], allowUserPages: boolean): string {
  return agents
    .map(
      (a) => `User-agent: ${a}
Allow: /
${allowUserPages ? "Allow: /p/" : "Disallow: /p/"}
Disallow: /api/
Disallow: /admin`
    )
    .join("\n\n");
}

api.get("/robots.txt", (c) => {
  const sitemapLines = LANGS.map((l) => `Sitemap: ${BASE_URL}/sitemap-${l}.xml`).join("\n");
  return c.text(`# /p/* is user-uploaded HTML: arbitrary topic, language and
# quality. It is deliberately kept out of the search index — blocking the
# crawl also stops Google from re-reviewing thousands of thin UGC pages.
# Link-preview fetchers are exempt at the bottom of this file, otherwise every
# shared link would lose its OG card.
User-agent: *
Allow: /
Disallow: /p/
Disallow: /api/
Disallow: /admin

# AI search & retrieval crawlers — allowed so pages can be cited by
# ChatGPT, Perplexity, Claude, and Copilot.
${botGroup(AI_RETRIEVAL_BOTS, false)}

# AI training crawlers — allowed by policy to maximize brand presence.
# Change "Allow: /" to "Disallow: /" on any agent to opt out of training.
${botGroup(AI_TRAINING_BOTS, false)}

# Link-preview fetchers — the only agents allowed on /p/* so previews work.
${botGroup(SOCIAL_PREVIEW_BOTS, true)}

${sitemapLines}
`);
});

// --- Machine-readable files for AI agents (ChatGPT/Claude/Perplexity) ---
// Not required by Google, but they help non-Google AI engines and autonomous
// buying agents read the product, its limits, and its pricing without scraping.
const MD_HEADERS = { "Content-Type": "text/markdown; charset=utf-8" };
api.get("/llms.txt", (c) => c.text(llmsTxt, 200, MD_HEADERS));
api.get("/llms-full.txt", (c) => c.text(llmsFullTxt, 200, MD_HEADERS));
api.get("/pricing.md", (c) => c.text(pricingMd, 200, MD_HEADERS));
api.get("/ai-books.md", (c) =>
  c.text(aiBooksMd, 200, {
    ...MD_HEADERS,
    Link: `<${BASE_URL}/ai-books>; rel="canonical"`,
    "X-Robots-Tag": "noindex",
  }),
);

// Markdown versions of the 100 Questions guides, for AI agents and
// content-negotiation clients. The HTML page stays canonical; these files are
// noindex to avoid duplicate search results.
function serveArticleMarkdown(
  c: any,
  article: { slug: string; title: string; summary: string; body: string; locale: string },
) {
  const htmlUrl =
    BASE_URL + withLangPrefix(article.locale as Lang, `/100-questions/${article.slug}`);
  const md = `# ${article.title}\n\n> ${article.summary}\n\n${article.body}\n`;
  return c.text(md, 200, {
    ...MD_HEADERS,
    "Content-Language": getBcp47(article.locale),
    Link: `<${htmlUrl}>; rel=\"canonical\"`,
    "X-Robots-Tag": "noindex",
  });
}

api.get("/100-questions/:file{[a-z0-9-]+\\.md}", async (c) => {
  const slug = (c.req.param("file") ?? "").replace(/\.md$/, "");
  const article = await loadQuestion(slug, "en");
  if (!article) return c.notFound();
  return serveArticleMarkdown(c, article);
});

api.get("/:lang/100-questions/:file{[a-z0-9-]+\\.md}", async (c) => {
  const lang = c.req.param("lang") ?? "";
  if (!(LANGS as readonly string[]).includes(lang)) return c.notFound();
  const slug = (c.req.param("file") ?? "").replace(/\.md$/, "");
  const article = await loadQuestion(slug, lang as Lang);
  if (!article) return c.notFound();
  return serveArticleMarkdown(c, article);
});

// Sitemap index — lists each per-language sitemap.
api.get("/sitemap.xml", (c) => {
  const entries = LANGS.map(
    (l) => `\n  <sitemap>\n    <loc>${BASE_URL}/sitemap-${l}.xml</loc>\n  </sitemap>`
  ).join("");
  return c.text(
    `${XML_HDR}\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}\n</sitemapindex>`,
    200,
    { "Content-Type": "application/xml" }
  );
});

// hreflang alternates for a static page (one <xhtml:link> per language + x-default)
function alternateLinksXml(basePath: string): string {
  const lines = LANGS.map(
    (l) =>
      `\n    <xhtml:link rel="alternate" hreflang="${getBcp47(l)}" href="${BASE_URL}${withLangPrefix(l, basePath)}"/>`
  );
  lines.push(
    `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}${withLangPrefix(DEFAULT_LANG, basePath)}"/>`
  );
  return lines.join("");
}

// hreflang alternates for a case detail page — only the languages that actually
// have a translation (plus x-default → en). Case URLs are language-prefixed like
// every other page; untranslated cases are absent from the non-en sitemaps so the
// English fallback version isn't indexed under a misleading language URL.
function questionAlternateLinksXml(basePath: string, locales: QuestionLocale[]): string {
  const lines = locales.map(
    (l) =>
      `\n    <xhtml:link rel="alternate" hreflang="${getBcp47(l)}" href="${BASE_URL}${withLangPrefix(l, basePath)}"/>`
  );
  lines.push(
    `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}${withLangPrefix(DEFAULT_QUESTION_LOCALE, basePath)}"/>`
  );
  return lines.join("");
}

function caseAlternateLinksXml(slug: string, locales: ShowcaseLocale[]): string {
  const lines = locales.map(
    (l) =>
      `\n    <xhtml:link rel="alternate" hreflang="${getBcp47(l)}" href="${BASE_URL}${withLangPrefix(l, `/showcase/${slug}`)}"/>`
  );
  lines.push(
    `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}${withLangPrefix(DEFAULT_LANG, `/showcase/${slug}`)}"/>`
  );
  return lines.join("");
}

async function buildLangSitemap(lang: Lang): Promise<string> {
  const urls: string[] = STATIC_PAGES.map((p) => {
    const loc = `${BASE_URL}${withLangPrefix(lang, p.loc)}`;
    const lastmod = p.lastmod ? `\n    <lastmod>${p.lastmod}</lastmod>` : "";
    return `
  <url>
    <loc>${loc}</loc>${lastmod}
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>${alternateLinksXml(p.loc)}
  </url>`;
  });

  // AI Books programmatic pages: category and audience lists.
  for (const page of AI_BOOK_PAGES) {
    const basePath = `/ai-books/${page.slug}`;
    urls.push(`
  <url>
    <loc>${escapeXml(`${BASE_URL}${withLangPrefix(lang, basePath)}`)}</loc>
    <lastmod>2026-11-03</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>${alternateLinksXml(basePath)}
  </url>`);
  }

  // 「100 个问题」栏目：列表页只在实际有内容的语言里收录，详情页按翻译收录。
  const questionListLocales = new Set<QuestionLocale>();
  for (const slug of getQuestionSlugs()) {
    for (const locale of getQuestionLocales(slug)) questionListLocales.add(locale);
  }
  const questionListLang = lang as QuestionLocale;
  if (questionListLocales.has(questionListLang)) {
    const available = QUESTION_LOCALES.filter((l) => questionListLocales.has(l));
    let listLastmod = "";
    for (const slug of getQuestionSlugs()) {
      const item = await loadQuestion(slug, questionListLang);
      if (!item) continue;
      const date = item.updatedAt ?? item.publishedAt;
      if (date > listLastmod) listLastmod = date;
    }
    urls.push(`
  <url>
    <loc>${escapeXml(`${BASE_URL}${withLangPrefix(lang, "/100-questions")}`)}</loc>${listLastmod ? `\n    <lastmod>${listLastmod}</lastmod>` : ""}
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>${questionAlternateLinksXml("/100-questions", available)}
  </url>`);
  }

  for (const slug of getQuestionSlugs()) {
    const locales = getQuestionLocales(slug);
    if (!locales.includes(questionListLang)) continue;
    const item = await loadQuestion(slug, questionListLang);
    if (!item) continue;
    const lastmod = item.updatedAt ?? item.publishedAt;
    const basePath = `/100-questions/${slug}`;
    urls.push(`
  <url>
    <loc>${escapeXml(`${BASE_URL}${withLangPrefix(lang, basePath)}`)}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}${questionAlternateLinksXml(basePath, locales)}
  </url>`);
  }

  // Case library detail pages: each language sitemap lists the cases that have
  // that translation; untranslated cases fall back to English and stay en-only.
  for (const slug of getCaseSlugs()) {
    const locales = getCaseLocales(slug);
    if (!locales.includes(lang as ShowcaseLocale)) continue;
    const item = await loadCase(slug, lang as ShowcaseLocale);
    if (!item) continue;
    const lastmod = item.updatedAt ?? item.publishedAt;
    const loc = `${BASE_URL}${withLangPrefix(lang, `/showcase/${slug}`)}`;
    urls.push(`
  <url>
    <loc>${escapeXml(loc)}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}${caseAlternateLinksXml(slug, locales)}
  </url>`);
  }

  // User-generated shared pages (/p/*) are intentionally absent: /p/ is
  // Disallowed in robots.txt and served noindex, so listing them here would
  // only produce "submitted but blocked by robots.txt" warnings in GSC.

  return `${XML_HDR}\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls.join("")}\n</urlset>`;
}

// Register one sitemap route per language: /sitemap-zh.xml, /sitemap-en.xml, ...
for (const lang of LANGS) {
  api.get(`/sitemap-${lang}.xml`, async (c) => {
    const body = await buildLangSitemap(lang as Lang);
    return c.text(body, 200, { "Content-Type": "application/xml" });
  });
}

// --- Agent Skill ---
import skillMd from "../.claude/skills/100mini-upload/SKILL.md?raw";
api.get("/skill/100mini-upload", (c) => {
  return c.text(skillMd, 200, { "Content-Type": "text/markdown; charset=utf-8" });
});


// Mount feature routers (server/features/*，各自按 repo/service/routes 分层)
const apiWithFeatures = api.route("/", squareRoutes).route("/", pagesRoutes).route("/", adminRoutes).route("/", pomodoroRoutes).route("/", wardrobeRoutes).route("/", rankRoutes).route("/", ensoRoutes).route("/", outbreakRoutes).route("/", tierlistRoutes);

// Hono RPC 类型：前端通过 hc<AppType> 获得端到端类型安全的客户端
export type AppType = typeof apiWithFeatures;

export default apiWithFeatures;