/// <reference types="@cloudflare/workers-types" />
import { Hono } from "hono";
import { nanoid } from "nanoid";
import { count, eq, and, desc } from "drizzle-orm";
import { getR2, BUCKET, MAX_SIZE } from "./r2";
import { createDb } from "./db";
import { page } from "./db/schema";

type Variables = {
  user: { id: string; name: string; email: string; image?: string } | null;
  session: any;
};

const api = new Hono<{
  Bindings: { BUCKET?: R2Bucket; D1?: D1Database };
  Variables: Variables;
}>();

const FREE_PERMANENT_LIMIT = 5;

api.onError((err, c) => {
  console.error("API Error:", err);
  return c.json({ error: err.message || "Internal Server Error" }, 500);
});

const ALLOWED_EXTENSIONS = [".html", ".htm", ".zip"];

const SECURITY_BANNER = `<div style="position:fixed;top:0;left:0;right:0;z-index:99999;background:rgba(255,200,0,0.95);color:#333;padding:8px 16px;font-size:13px;text-align:center;font-family:system-ui,sans-serif;">⚠️ 安全提示：本页面由用户临时托管，请勿输入密码或任何敏感信息。</div>`;

function injectBanner(html: string): string {
  return html.includes("<body")
    ? html.replace(/<body([^>]*)>/i, `<body$1>${SECURITY_BANNER}`)
    : `${SECURITY_BANNER}${html}`;
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

  return c.json({
    user,
    pageCount,
    limit: FREE_PERMANENT_LIMIT,
  });
});

// List user's pages
api.get("/api/pages", async (c) => {
  const user = c.get("user");
  if (!user || !c.env.D1) return c.json({ error: "未登录" }, 401);

  const db = createDb(c.env.D1);
  const pages = await db
    .select({
      id: page.id,
      title: page.title,
      category: page.category,
      isPermanent: page.isPermanent,
      createdAt: page.createdAt,
      expiresAt: page.expiresAt,
    })
    .from(page)
    .where(eq(page.userId, user.id))
    .orderBy(desc(page.createdAt));

  return c.json({ pages });
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
  const category = (body.category as string) || "general";

  // Check quota for logged-in users requesting permanent storage
  const wantPermanent = !!user;
  if (wantPermanent && user) {
    const db = createDb(c.env.D1);
    const result = await db.select({ count: count() }).from(page).where(eq(page.userId, user.id));
    const pageCount = result[0]?.count ?? 0;
    if (pageCount >= FREE_PERMANENT_LIMIT) {
      return c.json({
        error: `免费额度已用完（${FREE_PERMANENT_LIMIT}/${FREE_PERMANENT_LIMIT}），请删除旧页面后重试`,
      }, 403);
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
      isPermanent,
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
  });
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