import { Hono } from "hono";
import type { AppEnv } from "../../types";
import type { MembershipDuration } from "@shared/types/admin";
import {
  ServiceError,
  isValidDuration,
  listUsers,
  setMembership,
  cancelMembership,
  listPages,
  cleanupTmp,
  deletePage,
} from "./admin.service";

/**
 * Admin 路由层 (HTTP 边界)
 * 只做参数解析、认证检查与响应映射；业务逻辑在 service 层
 * 路径使用绝对路径，由主 api.ts 挂载在根路径
 */

/** 管理员守卫：未登录或非 admin 一律 403 */
function requireAdmin(c: { get: (k: "user") => { role?: string } | null }) {
  const u = c.get("user");
  return !!u && u.role === "admin";
}

export const adminRoutes = new Hono<AppEnv>()
  .onError((err, c) => {
    if (err instanceof ServiceError) {
      return c.json({ error: err.message }, err.status as 400);
    }
    throw err;
  })
  .use("*", async (c, next) => {
    if (!requireAdmin(c)) {
      return c.json({ error: "无权访问" }, 403);
    }
    return next();
  })

  // 用户列表（含会员状态）
  .get("/api/admin/users", async (c) => {
    if (!c.env.D1) return c.json({ error: "database unavailable" }, 503);
    const page = Math.max(1, parseInt(c.req.query("page") || "1", 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(c.req.query("pageSize") || "20", 10) || 20));
    return c.json(await listUsers(c.env.D1, page, pageSize));
  })

  // 设置会员时长
  .post("/api/admin/users/:id/membership", async (c) => {
    if (!c.env.D1) return c.json({ error: "database unavailable" }, 503);
    const admin = c.get("user");
    const userId = c.req.param("id");
    const body = await c.req.json<{ durationMonths: unknown }>();

    if (!isValidDuration(body.durationMonths)) {
      return c.json({ error: "时长仅支持 1、3、6、12 个月" }, 400);
    }
    return c.json(await setMembership(c.env.D1, admin!.id, userId, body.durationMonths));
  })

  // 取消会员
  .delete("/api/admin/users/:id/membership", async (c) => {
    if (!c.env.D1) return c.json({ error: "database unavailable" }, 503);
    return c.json(await cancelMembership(c.env.D1, c.req.param("id")));
  })

  // 页面列表（含作者信息，可选 scope=square）
  .get("/api/admin/pages", async (c) => {
    if (!c.env.D1) return c.json({ error: "database unavailable" }, 503);
    const pageParam = Math.max(1, parseInt(c.req.query("page") || "1", 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(c.req.query("pageSize") || "20", 10) || 20));
    const scope = c.req.query("scope") === "square" ? "square" : "all" as const;
    return c.json(await listPages(c.env.D1, pageParam, pageSize, scope));
  })

  // 手动触发匿名 tmp 清理
  .post("/api/admin/cleanup-tmp", async (c) => {
    if (!c.env?.BUCKET) return c.json({ error: "storage unavailable" }, 503);
    return c.json(await cleanupTmp(c.env.BUCKET));
  })

  // 删除任意页面（无所有权校验）
  .delete("/api/admin/pages/:id", async (c) => {
    if (!c.env.D1) return c.json({ error: "database unavailable" }, 503);
    return c.json(await deletePage(c.env.D1, c.env?.BUCKET, c.req.param("id")));
  });
