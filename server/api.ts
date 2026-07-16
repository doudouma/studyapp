/// <reference types="@cloudflare/workers-types" />
import { Hono } from "hono";
import { nanoid } from "nanoid";
import { count, eq, and, desc, sql, gte, lt } from "drizzle-orm";
import { MAX_SIZE } from "./r2";
import { createDb } from "./db";
import { page, user, membership, pomodoroSession } from "./db/schema";

type Variables = {
  user: { id: string; name: string; email: string; image?: string; role?: string } | null;
  session: any;
};

const api = new Hono<{
  Bindings: { BUCKET?: R2Bucket; D1?: D1Database };
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

const TMP_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours


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

api.get("/robots.txt", (c) => {
  return c.text(`User-agent: *
Allow: /
Disallow: /p/

Sitemap: https://100mini.com/sitemap.xml
`);
});

api.get("/sitemap.xml", async (c) => {
  const baseUrl = "https://100mini.com";
  const staticPages = [
    { loc: "/", changefreq: "daily", priority: "1.0" },
    { loc: "/square", changefreq: "hourly", priority: "0.9" },
  ];

  let dynamicPages: { id: string; sharedAt: Date | null }[] = [];
  if (c.env.D1) {
    const db = createDb(c.env.D1);
    dynamicPages = await db
      .select({ id: page.id, sharedAt: page.sharedAt })
      .from(page)
      .where(eq(page.isSharedToSquare, true))
      .orderBy(desc(page.sharedAt))
      .limit(1000);
  }

  const urls = [
    ...staticPages.map((p) => `
  <url>
    <loc>${baseUrl}${p.loc}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`),
    ...dynamicPages.filter((p) => p.sharedAt).map((p) => `
  <url>
    <loc>${baseUrl}/p/${p.id}</loc>
    <lastmod>${new Date(p.sharedAt!).toISOString().split("T")[0]}</lastmod>
  </url>`),
  ];

  return c.text(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}
</urlset>`,
    { headers: { "Content-Type": "application/xml" } }
  );
});

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
    .orderBy(desc(page.createdAt));

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
  const expiresAt = isPermanent ? null : new Date(now + 24 * 60 * 60 * 1000);

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

  // Parse /{id} or /{id}/{path}
  const match = rest.match(/^([a-zA-Z0-9_-]{7})(?:\/(.*))?$/);
  if (!match) return c.html(notFoundHtml(), 404);

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
        return c.html(notFoundHtml(), 404);
      }
    }
  }

  const bucket = c.env?.BUCKET;
  if (!bucket) return c.html(notFoundHtml(), 404);

  if (path && path !== "index.html") {
    // Serving an asset file (e.g. data.json, image.png)
    let isTmp = false;
    let obj = await bucket.get(`${id}/${path}`);
    if (!obj) { obj = await bucket.get(`tmp/${id}/${path}`); isTmp = true; }
    if (!obj) return c.html(notFoundHtml(), 404);

    // Lazy cleanup for expired tmp uploads
    if (isTmp && isExpiredByUploaded(obj.uploaded)) {
      await deleteTmpByBucketId(bucket, id);
      return c.html(notFoundHtml(), 404);
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
    return c.html(notFoundHtml(), 404);
  }

  // Lazy cleanup: delete expired anonymous tmp uploads
  if (obj.key?.startsWith("tmp/") && isExpiredByUploaded(obj.uploaded)) {
    await deleteTmpByBucketId(bucket, id);
    return c.html(notFoundHtml(), 404);
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

function notFoundHtml(): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="utf-8"><meta name="robots" content="noindex"><title>404 - 页面不存在 | 100mini</title>
<meta name="description" content="该页面不存在或已过期（24小时自动销毁）。返回100mini首页创建新的分享链接。">
<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;background:#f5f5f5}</style>
</head>
<body>
<div style="text-align:center">
<h1 style="font-size:2rem;margin-bottom:0.5rem">404</h1>
<p style="color:#666">页面不存在或已过期（24小时自动销毁）</p>
<a href="/" style="display:inline-block;margin-top:1rem;padding:0.5rem 1.5rem;background:#667eea;color:#fff;text-decoration:none;border-radius:8px">返回首页</a>
</div>
</body></html>`;
}

export { cleanupAnonymousUploads };
export default api;