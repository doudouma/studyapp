/// <reference types="@cloudflare/workers-types" />
import { Hono } from "hono";
import { nanoid } from "nanoid";
import { count, eq, and, desc, sql } from "drizzle-orm";
import { getR2, BUCKET, MAX_SIZE } from "./r2";
import { createDb } from "./db";
import { page, user, membership } from "./db/schema";

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

function injectBanner(html: string): string {
  return html;
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
  } else {
    const { PutObjectCommand } = await import("@aws-sdk/client-s3");
    const r2 = await getR2();
    await r2.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: body,
        ContentType: "text/html; charset=utf-8",
      })
    );
  }
}

async function getFromStorage(
  c: any,
  key: string
): Promise<string | null> {
  if (c.env?.BUCKET) {
    const obj = await c.env.BUCKET.get(key);
    if (!obj) return null;
    return await obj.text();
  } else {
      try {
        const { GetObjectCommand } = await import("@aws-sdk/client-s3");
        const r2 = await getR2();
        const res = await r2.send(
        new GetObjectCommand({ Bucket: BUCKET, Key: key })
      );
      return await res.Body!.transformToString();
    } catch {
      return null;
    }
  }
}

api.get("/robots.txt", (c) => {
  return c.text(`User-agent: *
Allow: /
Disallow: /p/

Sitemap: https://studypage.app/sitemap.xml
`);
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

// Admin: Delete any page (no ownership check)
api.delete("/api/admin/pages/:id", requireAdmin, async (c) => {
  const pageId = c.req.param("id");
  const db = createDb(c.env.D1);

  const existing = await db.select().from(page).where(eq(page.id, pageId)).limit(1);
  if (existing.length === 0) return c.json({ error: "页面不存在" }, 404);

  // Delete from R2
  await putToStorage(c, `${pageId}.html`, "");
  if (c.env?.BUCKET) {
    await c.env.BUCKET.delete(`${pageId}.html`);
    await c.env.BUCKET.delete(`thumbnails/${pageId}.webp`);
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
  const db = createDb(c.env.D1);

  // Check ownership
  const existing = await db.select().from(page).where(and(eq(page.id, pageId), eq(page.userId, user.id))).limit(1);
  if (existing.length === 0) return c.json({ error: "页面不存在" }, 404);

  // Delete from R2
  await putToStorage(c, `${pageId}.html`, ""); // clear content
  if (c.env?.BUCKET) {
    await c.env.BUCKET.delete(`${pageId}.html`);
    await c.env.BUCKET.delete(`thumbnails/${pageId}.webp`);
  }

  // Delete from D1
  await db.delete(page).where(eq(page.id, pageId));

  return c.json({ success: true });
});

api.post("/api/upload", async (c) => {
  const user = c.get("user");

  const body = await c.req.parseBody();
  const content = body.content;
  const file = body.file;
  const title = (body.title as string) || "";
  const tags = (body.tags as string) || "";
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

      let htmlFile = entries.find(
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
  await putToStorage(c, `${id}.html`, html);

  const now = Date.now();
  const isPermanent = wantPermanent;
  const expiresAt = isPermanent ? null : new Date(now + 24 * 60 * 60 * 1000);

  // Always record in D1
  if (c.env.D1) {
    const db = createDb(c.env.D1);
    await db.insert(page).values({
      id,
      userId: user?.id ?? null,
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
  } else {
    const { PutObjectCommand } = await import("@aws-sdk/client-s3");
    const r2 = await getR2();
    await r2.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: new Uint8Array(buffer),
        ContentType: "image/webp",
      })
    );
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
    headers.set("Cache-Control", "public, max-age=86400");
    return new Response(obj.body, { headers });
  } else {
    try {
      const { GetObjectCommand } = await import("@aws-sdk/client-s3");
      const r2 = await getR2();
      const res = await r2.send(
        new GetObjectCommand({ Bucket: BUCKET, Key: key })
      );
      const headers = new Headers();
      headers.set("Content-Type", "image/webp");
      headers.set("Cache-Control", "public, max-age=86400");
      return new Response(res.Body as ReadableStream, { headers });
    } catch {
      return c.json({ error: "not found" }, 404);
    }
  }
});

// Unshare from square
api.delete("/api/pages/:id/square", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "未登录" }, 401);

  const pageId = c.req.param("id");
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

api.get("/p/:id", async (c) => {
  const id = c.req.param("id");
  if (!/^[a-zA-Z0-9_-]{7}$/.test(id)) {
    return c.html(notFoundHtml(), 404);
  }

  // Check expiration from D1
  if (c.env.D1) {
    const db = createDb(c.env.D1);
    const record = await db.select().from(page).where(eq(page.id, id)).limit(1);
    if (record.length > 0) {
      const p = record[0];
      if (p.expiresAt && new Date(p.expiresAt) < new Date()) {
        // Expired — clean up
        await putToStorage(c, `${id}.html`, "");
        if (c.env?.BUCKET) {
          await c.env.BUCKET.delete(`${id}.html`);
        }
        await db.delete(page).where(eq(page.id, id));
        return c.html(notFoundHtml(), 404);
      }
    }
  }

  const html = await getFromStorage(c, `${id}.html`);
  if (html === null) {
    return c.html(notFoundHtml(), 404);
  }

  // Increment view count if the page is tracked in D1
  if (c.env?.D1) {
    const db = createDb(c.env.D1);
    await db.update(page).set({ viewCount: sql`view_count + 1` }).where(eq(page.id, id));
  }

  const injected = injectBanner(html);

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

export default api;