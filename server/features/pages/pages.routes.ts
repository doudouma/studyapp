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
} from "./pages.service";
import { cleanupAnonymousUploads, deletePageObjects } from "./pages.storage";

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

    await deleteOwnPage(c.env.D1, c.env?.BUCKET, user.id, c.req.param("id"));
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
    return c.json(result);
  })

  // 上传页面缩略图（SnapDOM 生成的 WebP）
  .post("/api/upload-thumbnail", async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "未登录" }, 401);

    const body = await c.req.parseBody();
    const pageId = body.pageId as string;
    const thumbnail = body.thumbnail as File | null;
    if (!pageId || !thumbnail) return c.json({ error: "缺少参数" }, 400);

    return c.json(
      await savePageThumbnail(c.env.D1, c.env?.BUCKET, user.id, pageId, thumbnail)
    );
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
