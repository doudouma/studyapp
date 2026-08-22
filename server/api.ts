/// <reference types="@cloudflare/workers-types" />
import { Hono } from "hono";
import { nanoid } from "nanoid";
import { count, eq, and, desc, sql, gte, lt } from "drizzle-orm";
import {
  LANGS,
  DEFAULT_LANG,
  withLangPrefix,
  BASE_URL,
  getBcp47,
  isLang,
  type Lang,
} from "../app/lib/lang";
import { MAX_SIZE } from "./r2";
import { createDb } from "./db";
import { page, user, membership, pomodoroSession, wardrobeItem, wardrobeJob } from "./db/schema";

type Variables = {
  user: { id: string; name: string; email: string; image?: string; role?: string } | null;
  session: any;
};

const api = new Hono<{
  Bindings: { BUCKET?: R2Bucket; D1?: D1Database; AI?: Ai };
  Variables: Variables;
}>();

const FREE_PERMANENT_LIMIT = 5;
const MAX_THUMBNAIL_SIZE = 2 * 1024 * 1024; // 2MB

api.onError((err, c) => {
  console.error("API Error:", err);
  return c.json({ error: err.message || "Internal Server Error" }, 500);
});

// Admin middleware
const requireAdmin = (c: any, next: any) => {
  const user = c.get("user");
  if (!user || user.role !== "admin") {
    return c.json({ error: "无权访问" }, 403);
  }
  return next();
};

const ALLOWED_EXTENSIONS = [".html", ".htm", ".zip"];

function getMimeType(filename: string): string {
  if (filename.endsWith(".html") || filename.endsWith(".htm")) return "text/html; charset=utf-8";
  if (filename.endsWith(".json")) return "application/json; charset=utf-8";
  if (filename.endsWith(".js")) return "application/javascript; charset=utf-8";
  if (filename.endsWith(".css")) return "text/css; charset=utf-8";
  if (filename.endsWith(".png")) return "image/png";
  if (filename.endsWith(".jpg") || filename.endsWith(".jpeg")) return "image/jpeg";
  if (filename.endsWith(".gif")) return "image/gif";
  if (filename.endsWith(".svg")) return "image/svg+xml";
  if (filename.endsWith(".webp")) return "image/webp";
  if (filename.endsWith(".woff2")) return "font/woff2";
  if (filename.endsWith(".woff")) return "font/woff";
  if (filename.endsWith(".ttf")) return "font/ttf";
  if (filename.endsWith(".mp3")) return "audio/mpeg";
  if (filename.endsWith(".wav")) return "audio/wav";
  if (filename.endsWith(".mp4")) return "video/mp4";
  if (filename.endsWith(".pdf")) return "application/pdf";
  return "application/octet-stream";
}

function injectBanner(html: string, meta?: { title?: string; description?: string; url?: string }, baseHref?: string): string {
  const baseTag = baseHref ? `<base href="${escapeHtml(baseHref)}">` : "";
  const seoTags = meta ? `
    <meta property="og:type" content="website">
    <meta property="og:title" content="${escapeHtml(meta.title || "学习页面")} | 100mini">
    <meta property="og:description" content="${escapeHtml(meta.description || "来自 100mini 的学习页面")}">
    <meta property="og:url" content="${escapeHtml(meta.url || "")}">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="${escapeHtml(meta.title || "学习页面")} | 100mini">
    <meta name="twitter:description" content="${escapeHtml(meta.description || "来自 100mini 的学习页面")}">
    <link rel="canonical" href="${escapeHtml(meta.url || "")}">
  ` : "";

  let result = html;
  if (baseTag) result = result.replace(/<head\b[^>]*>/i, (m) => `${m}${baseTag}`);
  if (seoTags) result = result.replace(/<\/head\s*>/i, (m) => `${seoTags}${m}`);
  return result;
}

function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c] || c));
}

async function putToStorage(
  c: any,
  key: string,
  body: string
) {
  if (c.env?.BUCKET) {
    await c.env.BUCKET.put(key, body, {
      httpMetadata: { contentType: "text/html; charset=utf-8" },
    });
  }
}

async function deletePageFromBucket(bucket: R2Bucket, id: string) {
  await bucket.delete(`${id}.html`);
  await bucket.delete(`thumbnails/${id}.webp`);
  let cursor: string | undefined;
  do {
    const listed = await bucket.list({ prefix: `${id}/`, cursor });
    if (listed.objects.length > 0) {
      await bucket.delete(listed.objects.map((o) => o.key));
    }
    cursor = listed.truncated ? listed.cursor : undefined;
  } while (cursor);
}

const TMP_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days


function isExpiredByUploaded(uploaded: Date | undefined): boolean {
  if (!uploaded) return true;
  return Date.now() - uploaded.getTime() > TMP_EXPIRY_MS;
}

async function cleanupAnonymousUploads(bucket: R2Bucket): Promise<number> {
  let deleted = 0;
  let cursor: string | undefined;
  do {
    const listed = await bucket.list({ prefix: "tmp/", cursor });
    const toDelete: string[] = [];
    for (const obj of listed.objects) {
      if (isExpiredByUploaded(obj.uploaded)) {
        toDelete.push(obj.key);
      }
    }
    if (toDelete.length > 0) {
      await bucket.delete(toDelete);
      deleted += toDelete.length;
    }
    cursor = listed.truncated ? listed.cursor : undefined;
  } while (cursor);
  return deleted;
}

async function deleteTmpByBucketId(bucket: R2Bucket, id: string) {
  const prefix = `tmp/${id}`;
  let cursor: string | undefined;
  do {
    const listed = await bucket.list({ prefix, cursor });
    const toDelete = listed.objects
      .filter((o) => o.key === `${prefix}.html` || o.key.startsWith(`${prefix}/`))
      .map((o) => o.key);
    if (toDelete.length > 0) {
      await bucket.delete(toDelete);
    }
    cursor = listed.truncated ? listed.cursor : undefined;
  } while (cursor);
}

async function getFromStorage(
  c: any,
  key: string
): Promise<string | null> {
  if (c.env?.BUCKET) {
    const obj = await c.env.BUCKET.get(key);
    if (!obj) return null;
    return await obj.text();
  }
  return null;
}

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
Disallow: /p/
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


// Get current user + page count
api.get("/api/me", async (c) => {
  const user = c.get("user");
  if (!user || !c.env.D1) {
    return c.json({ user: user ?? null, pageCount: 0, limit: 0 });
  }

  const db = createDb(c.env.D1);
  const result = await db.select({ count: count() }).from(page).where(eq(page.userId, user.id));
  const pageCount = result[0]?.count ?? 0;

  // Check membership
  let isMember = false;
  let membershipExpiresAt: string | null = null;
  const memberRows = await c.env.D1.prepare(
    "SELECT expires_at FROM membership WHERE user_id = ?"
  ).bind(user.id).all<{ expires_at: number }>();
  if (memberRows.results.length > 0) {
    const expiresAtNum = Number(memberRows.results[0].expires_at) * 1000;
    isMember = expiresAtNum > Date.now();
    membershipExpiresAt = isMember ? new Date(expiresAtNum).toISOString() : null;
  }

  return c.json({
    user,
    pageCount,
    isMember,
    membershipExpiresAt,
    limit: isMember ? -1 : FREE_PERMANENT_LIMIT,
  });
});

// Admin: List all users (with membership status)
api.get("/api/admin/users", requireAdmin, async (c) => {
  if (!c.env.D1) return c.json({ error: "database unavailable" }, 503);

  const db = createDb(c.env.D1);
  const page = Math.max(1, parseInt(c.req.query("page") || "1", 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(c.req.query("pageSize") || "20", 10) || 20));
  const offset = (page - 1) * pageSize;

  const [totalResult] = await db.select({ count: count() }).from(user);
  const total = totalResult?.count ?? 0;

  const users = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      membershipId: membership.id,
      membershipStartedAt: membership.startedAt,
      membershipExpiresAt: membership.expiresAt,
    })
    .from(user)
    .leftJoin(membership, eq(membership.userId, user.id))
    .orderBy(desc(user.createdAt))
    .limit(pageSize)
    .offset(offset);

  const now = Date.now();
  const result = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
    membership: u.membershipId
      ? {
          expiresAt: u.membershipExpiresAt,
          isActive: u.membershipExpiresAt && new Date(u.membershipExpiresAt).getTime() > now ? true : false,
          startedAt: u.membershipStartedAt,
        }
      : null,
  }));

  return c.json({ users: result, total, page, pageSize });
});

// Admin: Set user membership
api.post("/api/admin/users/:id/membership", requireAdmin, async (c) => {
  if (!c.env.D1) return c.json({ error: "database unavailable" }, 503);

  const admin = c.get("user");
  const userId = c.req.param("id");
  const body = await c.req.json();
  const durationMonths = body.durationMonths;

  if (![1, 3, 6, 12].includes(durationMonths)) {
    return c.json({ error: "时长仅支持 1、3、6、12 个月" }, 400);
  }

  const db = createDb(c.env.D1);

  const [existingUser] = await db.select().from(user).where(eq(user.id, userId)).limit(1);
  if (!existingUser) {
    return c.json({ error: "用户不存在" }, 404);
  }

  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setMonth(expiresAt.getMonth() + durationMonths);

  const existingMembership = await db
    .select()
    .from(membership)
    .where(eq(membership.userId, userId))
    .limit(1);

  if (existingMembership.length > 0) {
    await db
      .update(membership)
      .set({
        expiresAt,
        adminId: admin!.id,
        updatedAt: now,
      })
      .where(eq(membership.userId, userId));
  } else {
    await db.insert(membership).values({
      id: nanoid(7),
      userId,
      adminId: admin!.id,
      startedAt: now,
      expiresAt,
      createdAt: now,
      updatedAt: now,
    });
  }

  return c.json({ success: true, expiresAt: expiresAt.getTime() });
});

// Admin: Remove user membership
api.delete("/api/admin/users/:id/membership", requireAdmin, async (c) => {
  if (!c.env.D1) return c.json({ error: "database unavailable" }, 503);

  const userId = c.req.param("id");
  const db = createDb(c.env.D1);

  const existing = await db
    .select()
    .from(membership)
    .where(eq(membership.userId, userId))
    .limit(1);

  if (existing.length === 0) {
    return c.json({ error: "该用户不是会员" }, 404);
  }

  await db.delete(membership).where(eq(membership.userId, userId));

  return c.json({ success: true, message: "会员已取消" });
});

// Admin: List all pages (with user info)
api.get("/api/admin/pages", requireAdmin, async (c) => {
  if (!c.env.D1) return c.json({ error: "database unavailable" }, 503);

  const db = createDb(c.env.D1);
  const pageParam = parseInt(c.req.query("page") || "1", 10);
  const pageSize = Math.min(100, Math.max(1, parseInt(c.req.query("pageSize") || "20", 10) || 20));
  const offset = (pageParam - 1) * pageSize;
  const scope = c.req.query("scope") || "all";

  // Count
  let total = 0;
  if (scope === "square") {
    const [r] = await db.select({ count: count() }).from(page).where(eq(page.isSharedToSquare, true));
    total = r?.count ?? 0;
  } else {
    const [r] = await db.select({ count: count() }).from(page);
    total = r?.count ?? 0;
  }

  const items = await db
    .select({
      id: page.id,
      title: page.title,
      category: page.category,
      tags: page.tags,
      viewCount: page.viewCount,
      isSharedToSquare: page.isSharedToSquare,
      createdAt: page.createdAt,
      expiresAt: page.expiresAt,
      userName: user.name,
      userEmail: user.email,
      userId: user.id,
    })
    .from(page)
    .leftJoin(user, eq(page.userId, user.id))
    .where(scope === "square" ? eq(page.isSharedToSquare, true) : undefined as any)
    .orderBy(desc(page.createdAt))
    .limit(pageSize)
    .offset(offset);

  return c.json({ items, total, page: pageParam, pageSize });
});

// Admin: Clean up expired anonymous (tmp) uploads
api.post("/api/admin/cleanup-tmp", requireAdmin, async (c) => {
  if (!c.env?.BUCKET) return c.json({ error: "storage unavailable" }, 503);
  const count = await cleanupAnonymousUploads(c.env.BUCKET);
  return c.json({ success: true, deleted: count });
});

// Admin: Delete any page (no ownership check)
api.delete("/api/admin/pages/:id", requireAdmin, async (c) => {
  if (!c.env.D1) return c.json({ error: "database unavailable" }, 503);
  const pageId = c.req.param("id");
  const db = createDb(c.env.D1);

  const existing = await db.select().from(page).where(eq(page.id, pageId)).limit(1);
  if (existing.length === 0) return c.json({ error: "页面不存在" }, 404);

  // Delete from R2
  if (c.env?.BUCKET) {
    await deletePageFromBucket(c.env.BUCKET, pageId);
  }

  // Delete from D1
  await db.delete(page).where(eq(page.id, pageId));

  return c.json({ success: true });
});

// List user's pages
api.get("/api/pages", async (c) => {
  const user = c.get("user");
  if (!user || !c.env.D1) return c.json({ error: "未登录" }, 401);

  const db = createDb(c.env.D1);

  const p = Math.max(1, parseInt(c.req.query("page") || "1", 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(c.req.query("pageSize") || "10", 10) || 10));
  const offset = (p - 1) * pageSize;

  const [totalResult] = await db
    .select({ count: count() })
    .from(page)
    .where(eq(page.userId, user.id));
  const total = totalResult?.count ?? 0;

  const pages = await db
    .select({
      id: page.id,
      title: page.title,
      category: page.category,
      tags: page.tags,
      isPermanent: page.isPermanent,
      viewCount: page.viewCount,
      createdAt: page.createdAt,
      expiresAt: page.expiresAt,
      previewPath: page.previewPath,
    })
    .from(page)
    .where(eq(page.userId, user.id))
    .orderBy(desc(page.createdAt))
    .limit(pageSize)
    .offset(offset);

  // Check membership for limit
  let limit = FREE_PERMANENT_LIMIT;
  if (c.env.D1) {
    const memberRows = await c.env.D1.prepare(
      "SELECT expires_at FROM membership WHERE user_id = ?"
    ).bind(user.id).all<{ expires_at: number }>();
    if (memberRows.results.length > 0 && Number(memberRows.results[0].expires_at) * 1000 > Date.now()) {
      limit = -1;
    }
  }

  return c.json({ pages, total, limit });
});

// Delete a page
api.delete("/api/pages/:id", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "未登录" }, 401);

  const pageId = c.req.param("id");
  if (!c.env.D1) return c.json({ error: "database unavailable" }, 503);
  const db = createDb(c.env.D1);

  // Check ownership
  const existing = await db.select().from(page).where(and(eq(page.id, pageId), eq(page.userId, user.id))).limit(1);
  if (existing.length === 0) return c.json({ error: "页面不存在" }, 404);

  // Delete from R2
  if (c.env?.BUCKET) {
    await deletePageFromBucket(c.env.BUCKET, pageId);
  }

  // Delete from D1
  await db.delete(page).where(eq(page.id, pageId));

  return c.json({ success: true });
});

// Get page content
api.get("/api/pages/:id/content", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "未登录" }, 401);

  const pageId = c.req.param("id");
  if (!c.env.D1) return c.json({ error: "database unavailable" }, 503);
  const db = createDb(c.env.D1);

  const existing = await db.select().from(page).where(and(eq(page.id, pageId), eq(page.userId, user.id))).limit(1);
  if (existing.length === 0) return c.json({ error: "页面不存在" }, 404);

  let content = "";
  if (c.env?.BUCKET) {
    let obj = await c.env.BUCKET.get(`${pageId}.html`);
    if (!obj) obj = await c.env.BUCKET.get(`${pageId}/index.html`);
    if (obj) content = await obj.text();
  }

  return c.json({ content });
});

// Update a page
api.patch("/api/pages/:id", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "未登录" }, 401);

  const pageId = c.req.param("id");
  if (!c.env.D1) return c.json({ error: "database unavailable" }, 503);
  if (!c.env.BUCKET) return c.json({ error: "storage unavailable" }, 503);
  const db = createDb(c.env.D1);
  const bucket = c.env.BUCKET;

  const existing = await db.select().from(page).where(and(eq(page.id, pageId), eq(page.userId, user.id))).limit(1);
  if (existing.length === 0) return c.json({ error: "页面不存在" }, 404);

  const ct = c.req.header("content-type") || "";
  const isMultipart = ct.includes("multipart/form-data");

  if (isMultipart) {
    const body = await c.req.parseBody();
    const file = body.file;
    const title = ((body.title as string) || "").trim();
    const category = (body.category as string) || "general";
    const tags = ((body.tags as string) || "")
      .split(/[,，\s]+/)
      .map((t: string) => t.trim())
      .filter(Boolean)
      .filter((t: string, i: number, arr: string[]) => arr.indexOf(t) === i)
      .join(",");

    const updates: Record<string, string> = {};
    if (title) updates.title = title;
    if (category) updates.category = category;
    updates.tags = tags;

    if (file && file instanceof File) {
      const bytes = new Uint8Array(await file.arrayBuffer());
      if (bytes.length > MAX_SIZE) {
        return c.json({ error: "文件大小不能超过 5MB" }, 413);
      }

      if (file.name.toLowerCase().endsWith(".zip")) {
        const { unzipSync } = await import("fflate");
        const files = unzipSync(bytes);
        const entries = Object.keys(files);

        const htmlEntry = entries.find(
          (f) => f.endsWith("/index.html") || f === "index.html"
        ) || entries.find((f) => f.endsWith(".html"));
        if (!htmlEntry) return c.json({ error: "ZIP 中未找到 HTML 文件" }, 400);

        const totalSize = entries.reduce((sum, f) => sum + files[f].length, 0);
        if (totalSize > MAX_SIZE) {
          return c.json({ error: "解压后文件大小不能超过 5MB" }, 413);
        }

        // Replace all files under {id}/ prefix
        await deletePageFromBucket(bucket, pageId);
        const puts = Object.entries(files).map(([filename, data]) => {
          const key = filename === htmlEntry ? `${pageId}/index.html` : `${pageId}/${filename}`;
          const mime = getMimeType(filename);
          const buf = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
          return bucket.put(key, buf, { httpMetadata: { contentType: mime } });
        });
        await Promise.all(puts);
      } else {
        // Single .html file upload
        const content = new TextDecoder().decode(bytes);
        await bucket.put(`${pageId}.html`, content, {
          httpMetadata: { contentType: "text/html; charset=utf-8" },
        });
        // Clean up any existing ZIP format files (with pagination)
        let cursor: string | undefined;
        do {
          const listed = await bucket.list({ prefix: `${pageId}/`, cursor });
          if (listed.objects.length > 0) {
            await bucket.delete(listed.objects.map((o) => o.key));
          }
          cursor = listed.truncated ? listed.cursor : undefined;
        } while (cursor);
      }
    }

    if (Object.keys(updates).length > 0) {
      await db.update(page).set(updates as any).where(eq(page.id, pageId));
    }
  } else {
    const body = await c.req.json<{ title?: string; category?: string; tags?: string; content?: string }>();
    const updates: Record<string, string> = {};

    if (body.title !== undefined) updates.title = body.title;
    if (body.category !== undefined) updates.category = body.category;
    if (body.tags !== undefined) updates.tags = body.tags;

    if (body.content !== undefined) {
      if (new Blob([body.content]).size > MAX_SIZE) {
        return c.json({ error: "内容大小不能超过 5MB" }, 413);
      }
    }

    if (Object.keys(updates).length > 0) {
      await db.update(page).set(updates as any).where(eq(page.id, pageId));
    }

    if (body.content !== undefined) {
      // Detect ZIP format: HTML is stored under {id}/index.html instead of {id}.html
      const isZip = await bucket.get(`${pageId}/index.html`).then(Boolean).catch(() => false);
      const key = isZip ? `${pageId}/index.html` : `${pageId}.html`;
      await bucket.put(key, body.content, {
        httpMetadata: { contentType: "text/html; charset=utf-8" },
      });
    }
  }

  const [updated] = await db.select({
    id: page.id, title: page.title, category: page.category,
    tags: page.tags, isPermanent: page.isPermanent,
    viewCount: page.viewCount, createdAt: page.createdAt,
    expiresAt: page.expiresAt, previewPath: page.previewPath,
  }).from(page).where(eq(page.id, pageId));

  return c.json({ success: true, page: updated });
});

api.post("/api/upload", async (c) => {
  const user = c.get("user");

  const body = await c.req.parseBody();
  const content = body.content;
  const file = body.file;
  const title = ((body.title as string) || "").trim();
  if (user && !title) {
    return c.json({ error: "标题不能为空" }, 400);
  }
  const tags = ((body.tags as string) || "")
    .split(/[,，\s]+/)
    .map((t: string) => t.trim())
    .filter(Boolean)
    .filter((t: string, i: number, arr: string[]) => arr.indexOf(t) === i)
    .join(",");
  const category = (body.category as string) || "general";
  const shareToSquare = body.shareToSquare === "true";

  // Check quota for logged-in users requesting permanent storage
  const wantPermanent = !!user;
  if (wantPermanent && user) {
    // Members have no upload limit
    let isMember = false;
    if (c.env.D1) {
      const memberRows = await c.env.D1.prepare(
        "SELECT expires_at FROM membership WHERE user_id = ?"
      ).bind(user.id).all<{ expires_at: number }>();
      isMember = memberRows.results.length > 0 &&
        Number(memberRows.results[0].expires_at) * 1000 > Date.now();
    }

    if (!isMember) {
      if (!c.env.D1) return c.json({ error: "database unavailable" }, 503);
      const db = createDb(c.env.D1);
      const result = await db.select({ count: count() }).from(page).where(eq(page.userId, user.id));
      const pageCount = result[0]?.count ?? 0;
      if (pageCount >= FREE_PERMANENT_LIMIT) {
        return c.json({
          error: `免费额度已用完（${FREE_PERMANENT_LIMIT}/${FREE_PERMANENT_LIMIT}），请删除旧页面后重试`,
        }, 403);
      }
    }
  }

  let html: string;
  let zipEntries: Record<string, Uint8Array> | null = null;
  let htmlFile: string | undefined;

  if (file && file instanceof File) {
    const name = file.name.toLowerCase();
    const ext = ALLOWED_EXTENSIONS.find((e) => name.endsWith(e));
    if (!ext) {
      return c.json({ error: "仅支持 .html 或 .zip 文件" }, 400);
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    if (bytes.length > MAX_SIZE) {
      return c.json({ error: "文件大小不能超过 5MB" }, 413);
    }

    if (ext === ".zip") {
      const { unzipSync } = await import("fflate");
      const files = unzipSync(bytes);
      const entries = Object.keys(files);

      htmlFile = entries.find(
        (f) => f.endsWith("/index.html") || f === "index.html"
      );
      if (!htmlFile) htmlFile = entries.find((f) => f.endsWith(".html"));
      if (!htmlFile) {
        return c.json({ error: "ZIP 中未找到 HTML 文件" }, 400);
      }

      const totalSize = entries.reduce((sum, f) => sum + files[f].length, 0);
      if (totalSize > MAX_SIZE) {
        return c.json({ error: "解压后文件大小不能超过 5MB" }, 413);
      }

      html = new TextDecoder().decode(files[htmlFile]);
      zipEntries = files;
    } else {
      html = new TextDecoder().decode(bytes);
    }
  } else if (typeof content === "string" && content.trim()) {
    if (new Blob([content]).size > MAX_SIZE) {
      return c.json({ error: "内容大小不能超过 5MB" }, 413);
    }
    html = content;
  } else {
    return c.json({ error: "请提供 HTML 内容或上传文件" }, 400);
  }

  const id = nanoid(7);
  const now = Date.now();
  const isAnonymous = !user;

  if (zipEntries) {
    // Store all ZIP files under {id}/ prefix
    // Rename the main HTML to index.html so the serving code can find it
    const prefix = isAnonymous ? `tmp/${id}` : id;
    if (c.env?.BUCKET) {
      const puts = Object.entries(zipEntries).map(([filename, data]) => {
        const key = filename === htmlFile ? `${prefix}/index.html` : `${prefix}/${filename}`;
        const mime = getMimeType(filename);
        const opts: R2PutOptions = {
          httpMetadata: { contentType: mime },
        };
        if (isAnonymous) {
          opts.customMetadata = { createdAt: String(now) };
        }
        const buf = new Uint8Array(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength));
        return c.env.BUCKET!.put(key, buf, opts);
      });
      await Promise.all(puts);
    }
  } else if (isAnonymous) {
    // Store under tmp/ with creation timestamp for auto-cleanup
    const key = `tmp/${id}.html`;
    if (c.env?.BUCKET) {
      await c.env.BUCKET.put(key, html, {
        httpMetadata: { contentType: "text/html; charset=utf-8" },
        customMetadata: { createdAt: String(now) },
      });
    }
  } else {
    await putToStorage(c, `${id}.html`, html);
  }

  const isPermanent = wantPermanent;
  const expiresAt = isPermanent ? null : new Date(now + 7 * 24 * 60 * 60 * 1000);

  // Record in D1 only for logged-in users
  if (user && c.env.D1) {
    const db = createDb(c.env.D1);
    await db.insert(page).values({
      id,
      userId: user.id,
      title: title || "未命名",
      category,
      tags,
      isPermanent: true,
      isSharedToSquare: shareToSquare,
      sharedAt: shareToSquare ? new Date(now) : null,
      createdAt: new Date(now),
      expiresAt,
    });
  }

  return c.json({
    id,
    url: `/p/${id}`,
    expiresAt: expiresAt?.toISOString() ?? null,
    isPermanent,
    title,
    isSharedToSquare: shareToSquare,
    previewPath: null,
  });
});

// Upload thumbnail for a page
api.post("/api/upload-thumbnail", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "未登录" }, 401);

  const body = await c.req.parseBody();
  const pageId = body.pageId as string;
  const thumbnail = body.thumbnail as File | null;

  if (!pageId || !thumbnail) {
    return c.json({ error: "缺少参数" }, 400);
  }

  // Validate image type — must be WebP from SnapDOM
  if (thumbnail.type !== "image/webp") {
    return c.json({ error: "仅支持 WebP 格式的缩略图" }, 400);
  }

  // Validate file size (max 2MB)
  if (thumbnail.size > MAX_THUMBNAIL_SIZE) {
    return c.json({ error: "缩略图大小不能超过 2MB" }, 413);
  }

  // Validate page ownership
  if (!c.env.D1) return c.json({ error: "database unavailable" }, 503);
  const db = createDb(c.env.D1);
  const existing = await db
    .select()
    .from(page)
    .where(and(eq(page.id, pageId), eq(page.userId, user.id)))
    .limit(1);
  if (existing.length === 0) {
    return c.json({ error: "页面不存在" }, 404);
  }

  // Upload thumbnail to R2
  const key = `thumbnails/${pageId}.webp`;
  const buffer = await thumbnail.arrayBuffer();

  if (c.env?.BUCKET) {
    await c.env.BUCKET.put(key, buffer, {
      httpMetadata: { contentType: "image/webp" },
    });
  }

  // Update DB
  await db.update(page).set({ previewPath: key }).where(eq(page.id, pageId));

  return c.json({ success: true, previewPath: key });
});

// Serve thumbnail
api.get("/thumbnails/:id", async (c) => {
  const id = c.req.param("id");
  if (!/^[a-zA-Z0-9_-]{7}$/.test(id)) {
    return c.json({ error: "invalid id" }, 404);
  }

  const key = `thumbnails/${id}.webp`;

  if (c.env?.BUCKET) {
    const obj = await c.env.BUCKET.get(key);
    if (!obj) return c.json({ error: "not found" }, 404);
    const headers = new Headers();
    headers.set("Content-Type", "image/webp");
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
    return new Response(obj.body, { headers });
  }
});

// Unshare from square
api.delete("/api/pages/:id/square", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "未登录" }, 401);

  const pageId = c.req.param("id");
  if (!c.env.D1) return c.json({ error: "database unavailable" }, 503);
  const db = createDb(c.env.D1);

  const existing = await db.select().from(page).where(and(eq(page.id, pageId), eq(page.userId, user.id))).limit(1);
  if (existing.length === 0) return c.json({ error: "页面不存在" }, 404);

  await db.update(page).set({
    isSharedToSquare: false,
    sharedAt: null,
  }).where(eq(page.id, pageId));

  return c.json({ success: true });
});

// List pages shared to square (public)
api.get("/api/square", async (c) => {
  const db = c.env.D1 ? createDb(c.env.D1) : null;
  if (!db) return c.json({ items: [] });

  const items = await db
    .select({
      id: page.id,
      title: page.title,
      category: page.category,
      tags: page.tags,
      viewCount: page.viewCount,
      sharedAt: page.sharedAt,
      previewPath: page.previewPath,
      userName: user.name,
      userImage: user.image,
    })
    .from(page)
    .leftJoin(user, eq(page.userId, user.id))
    .where(eq(page.isSharedToSquare, true))
    .orderBy(desc(page.sharedAt));

  return c.json({ items });
});

// Record a completed pomodoro session
api.post("/api/pomodoro/sessions", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "未登录" }, 401);
  if (!c.env.D1) return c.json({ error: "database unavailable" }, 503);

  const { duration } = await c.req.json<{ duration: number }>();
  if (!duration || duration <= 0) return c.json({ error: "无效的时长" }, 400);

  const db = createDb(c.env.D1);
  await db.insert(pomodoroSession).values({
    id: nanoid(12),
    userId: user.id,
    duration,
    completedAt: new Date(),
  });

  return c.json({ success: true });
});

// Get today's pomodoro count
api.get("/api/pomodoro/today-count", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ today: 0, total: 0 });
  if (!c.env.D1) return c.json({ today: 0, total: 0 });

  const db = createDb(c.env.D1);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [todayResult, totalResult] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(pomodoroSession).where(
      and(eq(pomodoroSession.userId, user.id), gte(pomodoroSession.completedAt, today), lt(pomodoroSession.completedAt, tomorrow)),
    ),
    db.select({ count: sql<number>`count(*)` }).from(pomodoroSession).where(eq(pomodoroSession.userId, user.id)),
  ]);

  return c.json({
    today: Number(todayResult[0]?.count || 0),
    total: Number(totalResult[0]?.count || 0),
  });
});

api.get("/p/*", async (c) => {
  const rest = c.req.path.replace(/^\/p\//, "");
  const lang = detectLangFromHeader(c.req.header("accept-language"));

  // Parse /{id} or /{id}/{path}
  const match = rest.match(/^([a-zA-Z0-9_-]{7})(?:\/(.*))?$/);
  if (!match) return c.html(notFoundHtml(lang), 404);

  const id = match[1];
  const path = match[2];

  // Check expiration from D1 (logged-in user pages)
  if (c.env.D1) {
    const db = createDb(c.env.D1);
    const record = await db.select().from(page).where(eq(page.id, id)).limit(1);
    if (record.length > 0) {
      const p = record[0];
      if (p.expiresAt && new Date(p.expiresAt) < new Date()) {
        if (c.env?.BUCKET) {
          await deletePageFromBucket(c.env.BUCKET, id);
        }
        await db.delete(page).where(eq(page.id, id));
        return c.html(notFoundHtml(lang), 404);
      }
    }
  }

  const bucket = c.env?.BUCKET;
  if (!bucket) return c.html(notFoundHtml(lang), 404);

  if (path && path !== "index.html") {
    // Serving an asset file (e.g. data.json, image.png)
    let isTmp = false;
    let obj = await bucket.get(`${id}/${path}`);
    if (!obj) { obj = await bucket.get(`tmp/${id}/${path}`); isTmp = true; }
    if (!obj) return c.html(notFoundHtml(lang), 404);

    // Lazy cleanup for expired tmp uploads
    if (isTmp && isExpiredByUploaded(obj.uploaded)) {
      await deleteTmpByBucketId(bucket, id);
      return c.html(notFoundHtml(lang), 404);
    }

    const buf = await obj.arrayBuffer();
    const mime = getMimeType(path);
    return new Response(buf, {
      status: 200,
      headers: {
        "Content-Type": mime,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  // Serving the main HTML page
  // Try ZIP directory format first, then flat format (backward compat)
  let obj = await bucket.get(`${id}/index.html`);
  let isZip = !!obj;
  if (!obj) obj = await bucket.get(`tmp/${id}/index.html`);
  if (obj) isZip = true;
  if (!obj) obj = await bucket.get(`${id}.html`);
  if (!obj) obj = await bucket.get(`tmp/${id}.html`);

  if (!obj) {
    return c.html(notFoundHtml(lang), 404);
  }

  // Lazy cleanup: delete expired anonymous tmp uploads
  if (obj.key?.startsWith("tmp/") && isExpiredByUploaded(obj.uploaded)) {
    await deleteTmpByBucketId(bucket, id);
    return c.html(notFoundHtml(lang), 404);
  }

  // Increment view count if the page is tracked in D1
  let pageMeta: { title?: string; description?: string; url?: string } | undefined;
  if (c.env?.D1) {
    const db = createDb(c.env.D1);
    const [record] = await db
      .select({ title: page.title, category: page.category, tags: page.tags })
      .from(page)
      .where(eq(page.id, id))
      .limit(1);

    if (record) {
      const categoryLabels: Record<string, string> = {
        general: "通用", chinese: "语文", math: "数学", english: "英语",
        physics: "物理", chemistry: "化学", history: "历史",
        biology: "生物", geography: "地理", other: "其他",
      };
      const categoryLabel = categoryLabels[record.category ?? "general"] || "学习";
      const description = record.tags
        ? `${categoryLabel} - ${record.tags}`
        : categoryLabel;

      pageMeta = {
        title: record.title || "学习页面",
        description,
        url: `https://100mini.com/p/${id}`,
      };
    }

    await db.update(page).set({ viewCount: sql`view_count + 1` }).where(eq(page.id, id));
  }

  const rawHtml = await obj.text();
  const baseHref = isZip ? `/p/${id}/` : undefined;
  const injected = injectBanner(rawHtml, pageMeta, baseHref);

  return new Response(injected, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy": "form-action 'none';",
    },
  });
});

/**
 * Pick the best language from an Accept-Language header, falling back to the
 * default lang. /p/* pages are served at root (no URL prefix), so the header
 * is the only signal for localizing the 404 page.
 */
function detectLangFromHeader(acceptLanguage: string | undefined): Lang {
  if (!acceptLanguage) return DEFAULT_LANG;
  const parts = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, qStr] = part.trim().split(";");
      const q = qStr ? parseFloat(qStr.replace(/^q=/, "")) : 1;
      return { base: tag.toLowerCase().split("-")[0], q: Number.isNaN(q) ? 0 : q };
    })
    .sort((a, b) => b.q - a.q);
  for (const { base } of parts) {
    if (isLang(base)) return base;
  }
  return DEFAULT_LANG;
}

function notFoundHtml(lang: Lang = DEFAULT_LANG): string {
  const strings: Record<Lang, { title: string; desc: string; message: string; back: string }> = {
    en: {
      title: "404 - Page not found | 100mini",
      desc: "This page does not exist or has expired (auto-destroyed after 7 days). Return to the 100mini homepage to create a new share link.",
      message: "Page not found or expired (auto-destroyed after 7 days)",
      back: "Back to Home",
    },
    zh: {
      title: "404 - 页面不存在 | 100mini",
      desc: "该页面不存在或已过期（7天自动销毁）。返回100mini首页创建新的分享链接。",
      message: "页面不存在或已过期（7天自动销毁）",
      back: "返回首页",
    },
    es: {
      title: "404 - Página no encontrada | 100mini",
      desc: "Esta página no existe o ha caducado (se elimina automáticamente después de 7 días). Vuelve a la página de inicio de 100mini para crear un nuevo enlace para compartir.",
      message: "Página no encontrada o caducada (se elimina automáticamente después de 7 días)",
      back: "Volver al inicio",
    },
    pt: {
      title: "404 - Página não encontrada | 100mini",
      desc: "Esta página não existe ou expirou (destruída automaticamente após 7 dias). Volte à página inicial da 100mini para criar um novo link de compartilhamento.",
      message: "Página não encontrada ou expirada (destruída automaticamente após 7 dias)",
      back: "Voltar ao Início",
    },
    fr: {
      title: "404 - Page introuvable | 100mini",
      desc: "Cette page n'existe pas ou a expiré (supprimée automatiquement après 7 jours). Revenez à l'accueil de 100mini pour créer un nouveau lien de partage.",
      message: "Page introuvable ou expirée (supprimée automatiquement après 7 jours)",
      back: "Retour à l'accueil",
    },
  };
  const s = strings[lang] ?? strings[DEFAULT_LANG];
  return `<!DOCTYPE html>
<html lang="${getBcp47(lang)}">
<head><meta charset="utf-8"><meta name="robots" content="noindex"><title>${s.title}</title>
<meta name="description" content="${s.desc}">
<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;background:#f5f5f5}</style>
</head>
<body>
<div style="text-align:center">
<h1 style="font-size:2rem;margin-bottom:0.5rem">404</h1>
<p style="color:#666">${s.message}</p>
<a href="/" style="display:inline-block;margin-top:1rem;padding:0.5rem 1.5rem;background:#667eea;color:#fff;text-decoration:none;border-radius:8px">${s.back}</a>
</div>
</body></html>`;
}

export { cleanupAnonymousUploads };

// ==================== Wardrobe API ====================

// AI 模型配置
const VISION_MODEL = "@cf/meta/llama-3.2-11b-vision-instruct";

// 视觉分析提示词
const ANALYSIS_PROMPT = `Analyze this image and identify all clothing items.

For each clothing item, provide:
- name: specific clothing name
- part: category (upperbody, wholebody_up, lowerbody, accessories_up, shoes)
- color: hex color code
- secondaryColor: hex or null
- tags: array of descriptive tags
- boundingBox: {x, y, width, height} normalized to 0-1000

Return the result as a JSON object with an "items" array.`;

// 从 Markdown 响应中提取服装信息
function extractItemsFromMarkdown(content: string): any[] {
  const items: any[] = [];
  
  // 尝试识别服装项目 - 更精确的匹配
  const lines = content.split('\n');
  let currentItem: any = null;
  
  // 服装关键词映射到类别
  const categoryMap: Record<string, string> = {
    'shirt': 'upperbody', 'blouse': 'upperbody', 'top': 'upperbody', 't-shirt': 'upperbody',
    'sweater': 'upperbody', 'cardigan': 'upperbody', 'hoodie': 'upperbody', 'sweatshirt': 'upperbody',
    'dress': 'wholebody_up', 'jumpsuit': 'wholebody_up', 'romper': 'wholebody_up',
    'jacket': 'wholebody_up', 'coat': 'wholebody_up', 'blazer': 'wholebody_up', 'vest': 'wholebody_up',
    'pants': 'lowerbody', 'jeans': 'lowerbody', 'trousers': 'lowerbody', 'shorts': 'lowerbody',
    'skirt': 'lowerbody', 'leggings': 'lowerbody',
    'shoes': 'shoes', 'boots': 'shoes', 'sneakers': 'shoes', 'sandals': 'shoes', 'heels': 'shoes', 'slippers': 'shoes',
    'hat': 'accessories_up', 'cap': 'accessories_up', 'beanie': 'accessories_up',
    'bag': 'accessories_up', 'purse': 'accessories_up', 'backpack': 'accessories_up',
    'sunglasses': 'accessories_up', 'glasses': 'accessories_up', 'scarf': 'accessories_up', 'belt': 'accessories_up',
  };
  
  // 颜色关键词映射到 hex
  const colorMap: Record<string, string> = {
    'white': '#FFFFFF', 'black': '#000000', 'red': '#FF0000', 'blue': '#0000FF', 'green': '#008000',
    'yellow': '#FFFF00', 'purple': '#800080', 'orange': '#FFA500', 'pink': '#FFC0CB', 'brown': '#A52A2A',
    'gray': '#808080', 'grey': '#808080', 'navy': '#000080', 'beige': '#F5F5DC', 'cream': '#FFFDD0',
    'maroon': '#800000', 'olive': '#808000', 'teal': '#008080', 'cyan': '#00FFFF', 'magenta': '#FF00FF',
  };
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    // 检测新的服装项 - 查找包含服装关键词的行
    let detectedCategory = null;
    let detectedName = null;
    
    for (const [keyword, category] of Object.entries(categoryMap)) {
      if (lowerLine.includes(keyword)) {
        detectedCategory = category;
        // 提取名称 - 尝试从行中提取
        const nameMatch = line.match(new RegExp(`([^.,]*${keyword}[^.,]*)`, 'i'));
        if (nameMatch) {
          detectedName = nameMatch[1].replace(/[*#]/g, '').trim();
          // 清理名称
          detectedName = detectedName.replace(/^(a|an|the|this|that|these|those)\s+/i, '');
          detectedName = detectedName.charAt(0).toUpperCase() + detectedName.slice(1);
        } else {
          detectedName = keyword.charAt(0).toUpperCase() + keyword.slice(1);
        }
        break;
      }
    }
    
    if (detectedCategory && detectedName) {
      // 提取颜色
      let color = '#808080';
      for (const [colorName, hex] of Object.entries(colorMap)) {
        if (lowerLine.includes(colorName)) {
          color = hex;
          break;
        }
      }
      
      // 检查是否已经存在相同的项目
      const existingItem = items.find(item => 
        item.name.toLowerCase() === detectedName.toLowerCase() || 
        (item.part === detectedCategory && item.name.toLowerCase().includes(detectedName.toLowerCase().split(' ')[0]))
      );
      
      if (!existingItem) {
        currentItem = {
          name: detectedName,
          part: detectedCategory,
          color: color,
          secondaryColor: null,
          tags: [],
          boundingBox: { x: 0, y: 0, width: 1000, height: 1000 }
        };
        items.push(currentItem);
      }
    }
    
    // 提取标签 - 从描述性词语中提取
    if (currentItem) {
      const tagPatterns = [
        /pattern:\s*([^.,]+)/i,
        /style:\s*([^.,]+)/i,
        /material:\s*([^.,]+)/i,
        /design:\s*([^.,]+)/i,
        /floral/i, /striped/i, /plaid/i, /denim/i, /leather/i, /cotton/i, /silk/i, /wool/i,
        /casual/i, /formal/i, /sporty/i, /vintage/i, /modern/i,
      ];
      
      for (const pattern of tagPatterns) {
        const match = line.match(pattern);
        if (match) {
          const tag = (match[1] || match[0]).toLowerCase().trim();
          if (tag && !currentItem.tags.includes(tag) && currentItem.tags.length < 4) {
            currentItem.tags.push(tag);
          }
        }
      }
    }
  }
  
  // 如果没有识别到任何项目，尝试从整体描述中提取
  if (items.length === 0) {
    // 尝试识别常见的服装组合
    if (content.toLowerCase().includes('shirt') || content.toLowerCase().includes('top')) {
      items.push({
        name: 'Shirt',
        part: 'upperbody',
        color: '#FFFFFF',
        secondaryColor: null,
        tags: [],
        boundingBox: { x: 0, y: 0, width: 1000, height: 1000 }
      });
    }
    if (content.toLowerCase().includes('pants') || content.toLowerCase().includes('jeans')) {
      items.push({
        name: 'Pants',
        part: 'lowerbody',
        color: '#0000FF',
        secondaryColor: null,
        tags: [],
        boundingBox: { x: 0, y: 0, width: 1000, height: 1000 }
      });
    }
    if (content.toLowerCase().includes('boots') || content.toLowerCase().includes('shoes')) {
      items.push({
        name: 'Boots',
        part: 'shoes',
        color: '#000000',
        secondaryColor: null,
        tags: [],
        boundingBox: { x: 0, y: 0, width: 1000, height: 1000 }
      });
    }
  }
  
  // 如果还是没有识别到任何项目，创建一个默认项目
  if (items.length === 0) {
    items.push({
      name: 'Clothing Item',
      part: 'upperbody',
      color: '#808080',
      secondaryColor: null,
      tags: [],
      boundingBox: { x: 0, y: 0, width: 1000, height: 1000 }
    });
  }
  
  return items;
}

// 同意 Meta 许可证
let metaLicenseAgreed = false;
async function ensureMetaLicense(ai: Ai) {
  if (metaLicenseAgreed) return;
  try {
    await (ai as any).run(VISION_MODEL, {
      prompt: "agree",
    });
    metaLicenseAgreed = true;
  } catch (e) {
    // 如果错误不是许可证相关，则已经同意
    metaLicenseAgreed = true;
  }
}

// Wardrobe 上传限制
const WARDROBE_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const WARDROBE_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// 上传图片并创建任务
api.post("/api/wardrobe/upload", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const formData = await c.req.formData();
  const file = formData.get("image") as File | null;
  if (!file) return c.json({ error: "No image provided" }, 400);

  // 检查文件类型
  if (!WARDROBE_ALLOWED_TYPES.includes(file.type)) {
    return c.json({ 
      error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF" 
    }, 400);
  }

  // 检查文件大小
  if (file.size > WARDROBE_MAX_FILE_SIZE) {
    const maxSizeMB = WARDROBE_MAX_FILE_SIZE / (1024 * 1024);
    return c.json({ 
      error: `File too large. Maximum size: ${maxSizeMB}MB` 
    }, 400);
  }

  const jobId = nanoid(10);
  const buffer = await file.arrayBuffer();

  // 存储原始图片到 R2
  const key = `wardrobe/${jobId}/original.png`;
  await c.env.BUCKET!.put(key, buffer, {
    httpMetadata: { contentType: file.type || "image/png" },
  });

  const imageUrl = `/api/wardrobe/assets/${jobId}/original.png`;

  // 创建任务记录
  const db = createDb(c.env.D1!);
  await db.insert(wardrobeJob).values({
    id: jobId,
    userId: user.id,
    status: "pending",
    originalImageUrl: imageUrl,
  });

  return c.json({ jobId, imageUrl });
});

// 获取任务状态
api.get("/api/wardrobe/jobs/:id", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const jobId = c.req.param("id");
  const db = createDb(c.env.D1!);

  const job = await db.select().from(wardrobeJob).where(eq(wardrobeJob.id, jobId)).get();
  if (!job || job.userId !== user.id) {
    return c.json({ error: "Job not found" }, 404);
  }

  return c.json({
    id: job.id,
    status: job.status,
    originalImageUrl: job.originalImageUrl,
    analysisResult: job.analysisResult ? JSON.parse(job.analysisResult) : null,
    error: job.error,
  });
});

// 分析图片
api.post("/api/wardrobe/jobs/:id/analyze", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const jobId = c.req.param("id");
  const db = createDb(c.env.D1!);

  const job = await db.select().from(wardrobeJob).where(eq(wardrobeJob.id, jobId)).get();
  if (!job || job.userId !== user.id) {
    return c.json({ error: "Job not found" }, 404);
  }

  if (!c.env.AI) {
    return c.json({ error: "AI not configured" }, 500);
  }

  // 更新状态为分析中
  await db.update(wardrobeJob)
    .set({ status: "analyzing", updatedAt: new Date() })
    .where(eq(wardrobeJob.id, jobId));

  const maxRetries = 5; // 增加重试次数
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // 同意 Meta 许可证 (首次使用需要)
      await ensureMetaLicense(c.env.AI);

      // 从 R2 读取图片
      const imageKey = `wardrobe/${jobId}/original.png`;
      const imageObject = await c.env.BUCKET!.get(imageKey);
      if (!imageObject) throw new Error("Image not found");

      const imageBuffer = await imageObject.arrayBuffer();
      // 使用分块编码避免堆栈溢出
      const bytes = new Uint8Array(imageBuffer);
      let binary = "";
      const chunkSize = 8192;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
        binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
      }
      const base64 = btoa(binary);
      const imageDataUrl = `data:image/png;base64,${base64}`;

      // 调用视觉分析 (带超时)
      const aiPromise = c.env.AI.run(VISION_MODEL, {
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: ANALYSIS_PROMPT },
              { type: "image_url", image_url: { url: imageDataUrl } },
            ],
          },
        ],
      });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("AI request timeout")), 120000)
      );
      const response = await Promise.race([aiPromise, timeoutPromise]);

      // 解析响应
      const content = (response as any).response || (response as any).choices?.[0]?.message?.content;
      if (!content) throw new Error("No response from AI model");

      console.log("[wardrobe] AI response:", content.substring(0, 500));

      let items;
      try {
        // 尝试直接解析 JSON
        const parsed = JSON.parse(content);
        items = parsed.items || [];
      } catch (e) {
        // 尝试从文本中提取 JSON - 找到第一个 { 和最后一个 }
        const firstBrace = content.indexOf('{');
        const lastBrace = content.lastIndexOf('}');
        
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          const jsonStr = content.substring(firstBrace, lastBrace + 1);
          try {
            const parsed = JSON.parse(jsonStr);
            items = parsed.items || [];
          } catch (e2) {
            // 尝试提取多个 JSON 对象
            const allMatches = jsonStr.match(/\{[^{}]*\}/g);
            if (allMatches && allMatches.length > 0) {
              // 找到包含 "items" 的 JSON
              for (const match of allMatches) {
                try {
                  const parsed = JSON.parse(match);
                  if (parsed.items) {
                    items = parsed.items;
                    break;
                  }
                } catch (e3) {
                  // 继续尝试下一个
                }
              }
            }
            if (!items) {
              // 尝试从 Markdown 中提取信息
              items = extractItemsFromMarkdown(content);
            }
          }
        } else {
          // 尝试从 Markdown 中提取信息
          items = extractItemsFromMarkdown(content);
        }
      }

      if (!Array.isArray(items)) {
        throw new Error("Invalid items format in AI response");
      }

      // 更新任务状态
      await db.update(wardrobeJob)
        .set({
          status: "completed",
          analysisResult: JSON.stringify(items),
          updatedAt: new Date(),
        })
        .where(eq(wardrobeJob.id, jobId));

      return c.json({ items });
    } catch (error: any) {
      lastError = error;
      console.log(`[wardrobe] Attempt ${attempt} failed:`, error.message);
      
      // 如果是容量限制、网络错误或超时，等待后重试
      if (
        error.message.includes("3040") ||
        error.message.includes("Capacity temporarily exceeded") ||
        error.message.includes("rate limit") ||
        error.message.includes("timeout") ||
        error.message.includes("Network connection lost") ||
        error.message.includes("network")
      ) {
        if (attempt < maxRetries) {
          // 递增等待时间：10秒、20秒、30秒、40秒
          const waitTime = attempt * 10000;
          console.log(`[wardrobe] Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
      }
      
      // 其他错误直接抛出
      break;
    }
  }

  // 所有重试都失败
  const errorMessage = lastError?.message || "Analysis failed";
  await db.update(wardrobeJob)
    .set({
      status: "failed",
      error: errorMessage,
      updatedAt: new Date(),
    })
    .where(eq(wardrobeJob.id, jobId));

  return c.json({ error: errorMessage }, 500);
});

// 提取服装项并生成图片
api.post("/api/wardrobe/jobs/:id/extract/:itemIndex", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const jobId = c.req.param("id");
  const itemIndex = parseInt(c.req.param("itemIndex"));
  const db = createDb(c.env.D1!);

  const job = await db.select().from(wardrobeJob).where(eq(wardrobeJob.id, jobId)).get();
  if (!job || job.userId !== user.id) {
    return c.json({ error: "Job not found" }, 404);
  }

  if (!job.analysisResult) {
    return c.json({ error: "No analysis result" }, 400);
  }

  const items = JSON.parse(job.analysisResult);
  if (itemIndex < 0 || itemIndex >= items.length) {
    return c.json({ error: "Invalid item index" }, 400);
  }

  const item = items[itemIndex];

  if (!c.env.AI) {
    return c.json({ error: "AI not configured" }, 500);
  }

  const maxRetries = 5; // 增加重试次数
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // 从 R2 读取原始图片
      const imageKey = `wardrobe/${jobId}/original.png`;
      const imageObject = await c.env.BUCKET!.get(imageKey);
      if (!imageObject) throw new Error("Original image not found");

      const originalBuffer = await imageObject.arrayBuffer();
      
      // 使用 Cloudflare Images API 的 segment 功能移除背景
      // 构建图片 URL - 需要通过公共 URL 访问
      const imageUrl = `https://www.100mini.com/api/wardrobe/assets/${jobId}/original.png`;
      
      // 使用 fetch 的 cf.image 选项进行背景移除
      const imageResponse = await fetch(imageUrl, {
        cf: {
          image: {
            segment: "foreground",
            background: "#ffffff",
            format: "png",
            width: 512,
            height: 512,
            fit: "contain",
          },
        },
      });

      if (!imageResponse.ok) {
        throw new Error(`Image processing failed: ${imageResponse.status}`);
      }

      const imageBuffer = await imageResponse.arrayBuffer();

      // 存储生成的图片
      const itemId = nanoid(10);
      const itemImageKey = `wardrobe/items/${itemId}.png`;
      await c.env.BUCKET!.put(itemImageKey, imageBuffer, {
        httpMetadata: { contentType: "image/png" },
      });

      const itemImageUrl = `/api/wardrobe/assets/items/${itemId}.png`;

      // 创建服装项记录
      await db.insert(wardrobeItem).values({
        id: itemId,
        userId: user.id,
        name: item.name,
        part: item.part,
        color: item.color,
        secondaryColor: item.secondaryColor || null,
        tags: JSON.stringify(item.tags || []),
        imageUrl: itemImageUrl,
      });

      return c.json({
        item: {
          id: itemId,
          name: item.name,
          part: item.part,
          color: item.color,
          secondaryColor: item.secondaryColor,
          tags: item.tags,
          imageUrl: itemImageUrl,
        },
      });
    } catch (error: any) {
      lastError = error;
      console.log(`[wardrobe] Image generation attempt ${attempt} failed:`, error.message);
      
      // 如果是容量限制、网络错误或超时，等待后重试
      if (
        error.message.includes("3040") ||
        error.message.includes("Capacity temporarily exceeded") ||
        error.message.includes("rate limit") ||
        error.message.includes("timeout") ||
        error.message.includes("Network connection lost") ||
        error.message.includes("network")
      ) {
        if (attempt < maxRetries) {
          // 递增等待时间：10秒、20秒、30秒、40秒
          const waitTime = attempt * 10000;
          console.log(`[wardrobe] Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
      }
      
      // 其他错误直接抛出
      break;
    }
  }

  // 所有重试都失败
  const errorMessage = lastError?.message || "Image generation failed";
  return c.json({ error: errorMessage }, 500);
});

// 获取用户的服装列表
api.get("/api/wardrobe/items", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const db = createDb(c.env.D1!);
  const items = await db.select()
    .from(wardrobeItem)
    .where(eq(wardrobeItem.userId, user.id))
    .orderBy(desc(wardrobeItem.createdAt))
    .all();

  return c.json({
    items: items.map((item) => ({
      id: item.id,
      name: item.name,
      part: item.part,
      color: item.color,
      secondaryColor: item.secondaryColor,
      tags: item.tags ? JSON.parse(item.tags) : [],
      imageUrl: item.imageUrl,
      thumbnailUrl: item.thumbnailUrl,
      createdAt: item.createdAt,
    })),
  });
});

// 更新服装项
api.put("/api/wardrobe/items/:id", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const itemId = c.req.param("id");
  const db = createDb(c.env.D1!);

  const item = await db.select().from(wardrobeItem).where(eq(wardrobeItem.id, itemId)).get();
  if (!item || item.userId !== user.id) {
    return c.json({ error: "Item not found" }, 404);
  }

  const body = await c.req.json();
  const updates: any = {};

  if (body.name) updates.name = body.name;
  if (body.part) updates.part = body.part;
  if (body.color) updates.color = body.color;
  if (body.secondaryColor !== undefined) updates.secondaryColor = body.secondaryColor;
  if (body.tags) updates.tags = JSON.stringify(body.tags);

  updates.updatedAt = new Date();

  await db.update(wardrobeItem)
    .set(updates)
    .where(eq(wardrobeItem.id, itemId));

  return c.json({ success: true });
});

// 删除服装项
api.delete("/api/wardrobe/items/:id", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const itemId = c.req.param("id");
  const db = createDb(c.env.D1!);

  const item = await db.select().from(wardrobeItem).where(eq(wardrobeItem.id, itemId)).get();
  if (!item || item.userId !== user.id) {
    return c.json({ error: "Item not found" }, 404);
  }

  // 删除 R2 中的图片
  if (item.imageUrl) {
    const key = item.imageUrl.replace("/api/wardrobe/assets/", "wardrobe/");
    await c.env.BUCKET!.delete(key);
  }

  // 删除记录
  await db.delete(wardrobeItem).where(eq(wardrobeItem.id, itemId));

  return c.json({ success: true });
});

// 获取 wardrobe 资源文件
api.get("/api/wardrobe/assets/*", async (c) => {
  const path = c.req.path.replace("/api/wardrobe/assets/", "");
  const key = `wardrobe/${path}`;

  const object = await c.env.BUCKET!.get(key);
  if (!object) {
    return c.json({ error: "Not found" }, 404);
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");

  return c.body(object.body, { headers });
});

export default api;