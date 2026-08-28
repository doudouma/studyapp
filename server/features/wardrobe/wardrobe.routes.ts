import { Hono } from "hono";
import type { AppEnv } from "../../types";
import { WARDROBE_ALLOWED_TYPES, WARDROBE_MAX_FILE_SIZE } from "@shared/types/wardrobe";
import {
  uploadImage,
  getJobStatus,
  analyzeImage,
  extractItem,
  listItems,
  updateWardrobeItem,
  removeItem,
  listOutfits,
  createWardrobeOutfit,
  autoCreateOutfits,
  getOutfitDetail,
  removeOutfit,
} from "./wardrobe.service";

/**
 * Wardrobe 路由层 (HTTP 边界)
 * 只做参数解析、认证检查与响应映射，业务逻辑在 service 层
 * 路径使用绝对路径 (/api/...)，由主 api.ts 挂载在根路径
 */

export const wardrobeRoutes = new Hono<AppEnv>()
  // 上传图片并创建任务
  .post("/api/wardrobe/upload", async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const formData = await c.req.formData();
    const file = formData.get("image") as File | null;
    if (!file) return c.json({ error: "No image provided" }, 400);

    if (!WARDROBE_ALLOWED_TYPES.includes(file.type)) {
      return c.json({ error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF" }, 400);
    }

    if (file.size > WARDROBE_MAX_FILE_SIZE) {
      const maxSizeMB = WARDROBE_MAX_FILE_SIZE / (1024 * 1024);
      return c.json({ error: `File too large. Maximum size: ${maxSizeMB}MB` }, 400);
    }

    const result = await uploadImage(c.env, user.id, file);
    if ("error" in result) return c.json({ error: result.error }, 500);

    return c.json(result);
  })
  // 获取任务状态
  .get("/api/wardrobe/jobs/:id", async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const result = await getJobStatus(c.env, c.req.param("id"), user.id);
    if ("error" in result) return c.json({ error: result.error }, 404);

    return c.json(result);
  })
  // 分析图片
  .post("/api/wardrobe/jobs/:id/analyze", async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const result = await analyzeImage(c.env, c.req.param("id"), user.id);
    if ("error" in result) return c.json({ error: result.error }, 500);

    return c.json(result);
  })
  // 提取服装项并生成图片
  .post("/api/wardrobe/jobs/:id/extract/:itemIndex", async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const itemIndex = parseInt(c.req.param("itemIndex"));
    const result = await extractItem(c.env, c.req.param("id"), itemIndex, user.id);
    if ("error" in result) return c.json({ error: result.error }, 500);

    return c.json(result);
  })
  // 获取用户服装列表
  .get("/api/wardrobe/items", async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const result = await listItems(c.env, user.id);
    return c.json(result);
  })
  // 更新服装项
  .put("/api/wardrobe/items/:id", async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const body = await c.req.json();
    const result = await updateWardrobeItem(c.env, c.req.param("id"), user.id, body);
    if ("error" in result) return c.json({ error: result.error }, 404);

    return c.json(result);
  })
  // 删除服装项
  .delete("/api/wardrobe/items/:id", async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const result = await removeItem(c.env, c.req.param("id"), user.id);
    if ("error" in result) return c.json({ error: result.error }, 404);

    return c.json(result);
  })
  // 获取 wardrobe 资源文件
  .get("/api/wardrobe/assets/*", async (c) => {
    const path = c.req.path.replace("/api/wardrobe/assets/", "");
    const key = `wardrobe/${path}`;

    const object = await c.env.BUCKET!.get(key);
    if (!object) return c.json({ error: "Not found" }, 404);

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    headers.set("cache-control", "public, max-age=31536000, immutable");

    return c.body(object.body, { headers });
  })
  // 获取用户 outfit 列表
  .get("/api/wardrobe/outfits", async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const result = await listOutfits(c.env, user.id);
    return c.json(result);
  })
  // 创建 outfit
  .post("/api/wardrobe/outfits", async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const body = await c.req.json();
    const result = await createWardrobeOutfit(
      { ...c.env, executionCtx: c.executionCtx },
      user.id,
      body
    );
    if ("error" in result) return c.json({ error: result.error }, 400);

    return c.json(result);
  })
  // 自动创建 outfit
  .post("/api/wardrobe/outfits/auto", async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const body = await c.req.json().catch(() => ({}));
    const count = Math.max(1, Math.min(6, Number(body.count) || 3));

    const result = await autoCreateOutfits(
      { ...c.env, executionCtx: c.executionCtx },
      user.id,
      count
    );
    if ("error" in result) return c.json({ error: result.error }, 400);

    return c.json(result);
  })
  // 获取 outfit 详情
  .get("/api/wardrobe/outfits/:id", async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const result = await getOutfitDetail(c.env, c.req.param("id"), user.id);
    if ("error" in result) return c.json({ error: result.error }, 404);

    return c.json(result);
  })
  // 删除 outfit
  .delete("/api/wardrobe/outfits/:id", async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const result = await removeOutfit(c.env, c.req.param("id"), user.id);
    if ("error" in result) return c.json({ error: result.error }, 404);

    return c.json(result);
  });

export type WardrobeApi = typeof wardrobeRoutes;