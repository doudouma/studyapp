/// <reference types="@cloudflare/workers-types" />
import { Hono } from "hono";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";
import { r2, BUCKET, MAX_SIZE } from "./r2";

const api = new Hono<{
  Bindings: { BUCKET: R2Bucket };
}>();

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

api.post("/api/upload", async (c) => {
  const body = await c.req.parseBody();

  const content = body.content;
  const file = body.file;

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

  return c.json({
    url: `/p/${id}`,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });
});

api.get("/p/:id", async (c) => {
  const id = c.req.param("id");
  if (!/^[a-zA-Z0-9_-]{7}$/.test(id)) {
    return c.html(notFoundHtml(), 404);
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
<head><meta charset="utf-8"><meta name="robots" content="noindex"><title>404 - 页面不存在 | 码上钉</title>
<meta name="description" content="该页面不存在或已过期（24小时自动销毁）。返回码上钉首页创建新的分享链接。">
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
