/// <reference types="@cloudflare/workers-types" />
import { Hono } from "hono";
import { eq, desc } from "drizzle-orm";
import {
  LANGS,
  DEFAULT_LANG,
  withLangPrefix,
  BASE_URL,
  getBcp47,
  type Lang,
} from "../app/lib/lang";
import { page } from "./db/schema";
import { createDb } from "./db";
import { squareRoutes } from "./features/square/square.routes";
import { pagesRoutes } from "./features/pages/pages.routes";
import { adminRoutes } from "./features/admin/admin.routes";
import { pomodoroRoutes } from "./features/pomodoro/pomodoro.routes";
import { wardrobeRoutes } from "./features/wardrobe/wardrobe.routes";
import { log } from "./lib/log";

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

const STATIC_PAGES: { loc: string; changefreq: string; priority: string }[] = [
  { loc: "/", changefreq: "daily", priority: "1.0" },
  { loc: "/square", changefreq: "hourly", priority: "0.9" },
  { loc: "/md2html", changefreq: "weekly", priority: "0.8" },
  { loc: "/any2md", changefreq: "weekly", priority: "0.8" },
  { loc: "/freetool", changefreq: "weekly", priority: "0.7" },
  { loc: "/idphoto", changefreq: "weekly", priority: "0.7" },
  { loc: "/links", changefreq: "weekly", priority: "0.7" },
  { loc: "/pomodoro", changefreq: "weekly", priority: "0.6" },
  { loc: "/rhythm", changefreq: "weekly", priority: "0.6" },
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

api.get("/robots.txt", (c) => {
  const sitemapLines = LANGS.map((l) => `Sitemap: ${BASE_URL}/sitemap-${l}.xml`).join("\n");
  return c.text(`User-agent: *
Allow: /
Allow: /p/
Disallow: /api/
Disallow: /admin

${sitemapLines}
`);
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

async function buildLangSitemap(c: any, lang: Lang): Promise<string> {
  const urls: string[] = STATIC_PAGES.map((p) => {
    const loc = `${BASE_URL}${withLangPrefix(lang, p.loc)}`;
    return `
  <url>
    <loc>${loc}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>${alternateLinksXml(p.loc)}
  </url>`;
  });

  // User-generated shared pages live at root only (single canonical URL, no
  // language variants — /{lang}/p/:id 301-redirects to /p/:id). Include them
  // only in the default-language (en) sitemap.
  if (lang === DEFAULT_LANG && c.env?.D1) {
    const db = createDb(c.env.D1);
    const dynamicPages = await db
      .select({ id: page.id, sharedAt: page.sharedAt })
      .from(page)
      .where(eq(page.isSharedToSquare, true))
      .orderBy(desc(page.sharedAt))
      .limit(1000);
    for (const p of dynamicPages) {
      if (!p.sharedAt) continue;
      const lastmod = new Date(p.sharedAt).toISOString().split("T")[0];
      urls.push(`
  <url>
    <loc>${BASE_URL}/p/${escapeXml(p.id)}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`);
    }
  }

  return `${XML_HDR}\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls.join("")}\n</urlset>`;
}

// Register one sitemap route per language: /sitemap-zh.xml, /sitemap-en.xml, ...
for (const lang of LANGS) {
  api.get(`/sitemap-${lang}.xml`, async (c) => {
    const body = await buildLangSitemap(c, lang as Lang);
    return c.text(body, 200, { "Content-Type": "application/xml" });
  });
}

// --- Agent Skill ---
import skillMd from "../.claude/skills/100mini-upload/SKILL.md?raw";
api.get("/skill/100mini-upload", (c) => {
  return c.text(skillMd, 200, { "Content-Type": "text/markdown; charset=utf-8" });
});


// Mount feature routers (server/features/*，各自按 repo/service/routes 分层)
const apiWithFeatures = api.route("/", squareRoutes).route("/", pagesRoutes).route("/", adminRoutes).route("/", pomodoroRoutes).route("/", wardrobeRoutes);

// Hono RPC 类型：前端通过 hc<AppType> 获得端到端类型安全的客户端
export type AppType = typeof apiWithFeatures;

export default apiWithFeatures;