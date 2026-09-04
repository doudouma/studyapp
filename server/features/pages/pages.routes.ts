import { Hono } from "hono";
import type { AppEnv } from "../../types";
import {
  ServiceError,
  getMeInfo,
  listMyPages,
  deleteOwnPage,
  getPageContent,
  updateOwnPage,
  createUpload,
  savePageThumbnail,
  serveUserPage,
  serveThumbnail,
  normalizeTags,
  scanHtmlInBackground,
} from "./pages.service";
import { createApiKey, listApiKeys, revokeApiKey } from "./apikey.service";
import { detectLangFromHeader } from "./pages.render";
import { cleanupAnonymousUploads, deletePageObjects } from "./pages.storage";
import { insertUploadLog } from "../admin/upload-log.repo";
import { log } from "../../lib/log";

/**
 * Pages 路由层 (HTTP 边界)
 * 只做参数解析、认证检查与响应映射；业务逻辑在 service 层
 * 路径使用绝对路径，由主 api.ts 挂载在根路径
 */

export const pagesRoutes = new Hono<AppEnv>()
  .onError((err, c) => {
    if (err instanceof ServiceError) {
      return c.json({ error: err.message }, err.status as 400);
    }
    throw err; // 向上传播给主 api.ts 的全局 onError (500)
  })

  // 当前用户信息 + 配额（未登录返回匿名态而非 401，前端依赖此行为）
  .get("/api/me", async (c) => {
    const user = c.get("user");
    return c.json(await getMeInfo(c.env.D1, user));
  })

  // 我的页面列表
  .get("/api/pages", async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "未登录" }, 401);

    const pageParam = parseInt(c.req.query("page") || "1", 10) || 1;
    const pageSizeParam = parseInt(c.req.query("pageSize") || "10", 10) || 10;
    return c.json(await listMyPages(c.env.D1, user, pageParam, pageSizeParam));
  })

  // 删除我的页面
  .delete("/api/pages/:id", async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "未登录" }, 401);
    const pageId = c.req.param("id");
    await deleteOwnPage(c.env.D1, c.env?.BUCKET, user.id, pageId);
    if (c.env.D1) {
      insertUploadLog(c.env.D1, {
        userId: user.id,
        pageId,
        event: "delete",
        isAnonymous: false,
        ip: c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for")?.split(",")[0]?.trim() || null,
      });
    }
    return c.json({ success: true });
  })

  // 读取我的页面内容（编辑器用）
  .get("/api/pages/:id/content", async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "未登录" }, 401);

    const content = await getPageContent(c.env.D1, c.env?.BUCKET, user.id, c.req.param("id"));
    return c.json({ content });
  })

  // 更新页面（JSON 元数据/内容 或 multipart 文件替换）
  .patch("/api/pages/:id", async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "未登录" }, 401);
    if (!c.env.D1) return c.json({ error: "database unavailable" }, 503);
    if (!c.env.BUCKET) return c.json({ error: "storage unavailable" }, 503);

    const pageId = c.req.param("id");
    const ct = c.req.header("content-type") || "";

    if (ct.includes("multipart/form-data")) {
      const body = await c.req.parseBody();
      const file = body.file;
      let fileInput: { bytes: Uint8Array; filename: string } | undefined;
      if (file instanceof File) {
        fileInput = { bytes: new Uint8Array(await file.arrayBuffer()), filename: file.name };
      }
      return c.json(
        await updateOwnPage({
          d1: c.env.D1,
          bucket: c.env.BUCKET,
          userId: user.id,
          pageId,
          title: ((body.title as string) || "").trim() || undefined,
          category: (body.category as string) || undefined,
          tags: normalizeTags((body.tags as string) || ""),
          file: fileInput,
        })
      );
    }

    const body = await c.req.json<{
      title?: string;
      category?: string;
      tags?: string;
      content?: string;
    }>();
    return c.json(
      await updateOwnPage({
        d1: c.env.D1,
        bucket: c.env.BUCKET,
        userId: user.id,
        pageId,
        title: body.title,
        category: body.category,
        tags: body.tags,
        content: body.content,
      })
    );
  })

  // 上传页面（匿名 = 7 天临时；登录 = 永久，受配额限制）
  .post("/api/upload", async (c) => {
    const user = c.get("user");
    const body = await c.req.parseBody();
    const file = body.file;
    const ip = c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

    log.info("上传请求", {
      userId: user?.id,
      isAnonymous: !user,
      ip,
      hasFile: file instanceof File,
      hasContent: typeof body.content === "string" && body.content.length > 0,
    });

    // 匿名上传频率限制：同一 IP 每天最多 5 次
    // 容错：限流表（upload_rate_log）缺失或 D1 异常时「放行」，绝不让限流功能阻塞上传
    if (!user && c.env.D1) {
      try {
        const dayStart = new Date();
        dayStart.setUTCHours(0, 0, 0, 0);
        const ts = dayStart.getTime();

        const row = await c.env.D1.prepare(
          "SELECT COUNT(*) as cnt FROM upload_rate_log WHERE ip = ? AND created_at > ?"
        ).bind(ip, ts).first<{ cnt: number }>();

        if (row && row.cnt >= 5) {
          const lang = detectLangFromHeader(c.req.header("accept-language"));
          const msg: Record<string, string> = {
            zh: "匿名上传已达今日上限（5次/天），请明天再试或登录后上传",
            en: "Anonymous upload limit reached (5/day). Try again tomorrow or log in to upload.",
            es: "Límite de carga anónima alcanzado (5/día). Inténtelo mañana o inicie sesión para subir.",
            fr: "Limite d'upload anonyme atteinte (5/jour). Réessayez demain ou connectez-vous.",
            pt: "Limite de upload anônimo atingido (5/dia). Tente amanhã ou faça login para enviar.",
          };
          log.warn("上传被限流", { ip, count: row.cnt, status: "rate_limited" });
          return c.json({ error: msg[lang] || msg.en }, 429);
        }

        // 记录本次上传
        await c.env.D1.prepare(
          "INSERT INTO upload_rate_log (ip, created_at) VALUES (?, ?)"
        ).bind(ip, Date.now()).run();
      } catch (e) {
        // 限流失败不影响上传主流程（仅失去限流能力）
        log.error("限流记录失败（已放行）", { error: String(e) });
      }
    }

    let fileInput: { bytes: Uint8Array; filename: string } | undefined;
    if (file instanceof File) {
      fileInput = { bytes: new Uint8Array(await file.arrayBuffer()), filename: file.name };
    }

    const result = await createUpload({
      d1: c.env.D1,
      bucket: c.env?.BUCKET,
      ai: c.env?.AI,
      user,
      title: ((body.title as string) || "").trim(),
      category: (body.category as string) || "general",
      tags: normalizeTags((body.tags as string) || ""),
      shareToSquare: body.shareToSquare === "true",
      content: typeof body.content === "string" ? body.content : undefined,
      file: fileInput,
    });

    log.info("上传成功", {
      pageId: result.id,
      userId: user?.id,
      isAnonymous: result._isAnonymous,
      title: result.title,
      url: result.url,
      status: "success",
    });

    // 后台安全扫描（不阻塞响应）
    c.executionCtx.waitUntil(
      scanHtmlInBackground(
        { d1: c.env.D1, bucket: c.env?.BUCKET, ai: c.env?.AI },
        result.id,
        result._html,
        result._isAnonymous,
      )
    );

    // 剥离内部字段后返回
    const { _html, _isAnonymous, ...response } = result;
    return c.json(response);
  })

  // --- API Key management ---

  .post("/api/me/api-keys", async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "未登录" }, 401);
    const body = (await c.req.json<{ name?: string }>().catch(() => ({}))) as { name?: string };
    const name = (body.name || "").trim().slice(0, 64);
    if (!name) return c.json({ error: "名称不能为空" }, 400);
    try {
      const result = await createApiKey(c.env.D1!, user.id, name);
      return c.json(result);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "创建失败";
      return c.json({ error: msg }, 400);
    }
  })

  .get("/api/me/api-keys", async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "未登录" }, 401);
    const keys = await listApiKeys(c.env.D1!, user.id);
    return c.json({ keys });
  })

  .delete("/api/me/api-keys/:id", async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "未登录" }, 401);
    const ok = await revokeApiKey(c.env.D1!, user.id, c.req.param("id"));
    if (!ok) return c.json({ error: "Key not found or already revoked" }, 404);
    return c.json({ success: true });
  })

  // 上传页面缩略图（SnapDOM 生成的 WebP）
  .post("/api/upload-thumbnail", async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "未登录" }, 401);

    const body = await c.req.parseBody();
    const pageId = body.pageId as string;
    const thumbnail = body.thumbnail as File | null;
    if (!pageId || !thumbnail) return c.json({ error: "缺少参数" }, 400);

    const thumbResult = await savePageThumbnail(c.env.D1, c.env?.BUCKET, user.id, pageId, thumbnail);

    if (c.env.D1) {
      insertUploadLog(c.env.D1, {
        userId: user.id,
        pageId,
        event: "upload",
        contentType: "thumbnail",
        isAnonymous: false,
        ip: c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for")?.split(",")[0]?.trim() || null,
        fileSize: thumbnail.size,
      });
    }

    return c.json(thumbResult);
  })

  // 页面缩略图（长缓存）
  .get("/thumbnails/:id", async (c) => {
    const res = await serveThumbnail(c.env?.BUCKET, c.req.param("id"));
    if (!res) return c.json({ error: "not found" }, 404);
    return res;
  })

  // 用户页面访问（HTML + 资产），含过期惰性清理
  .get("/p/*", async (c) => {
    return serveUserPage(
      { d1: c.env.D1, bucket: c.env?.BUCKET },
      c.req.path.replace(/^\/p\//, ""),
      c.req.header("accept-language")
    );
  });

// 供 admin 功能复用（admin 未迁移，仍在 server/api.ts）
export { cleanupAnonymousUploads, deletePageObjects };
