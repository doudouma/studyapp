import { Hono } from "hono";
import type { AppEnv } from "../../types";
import { getSquarePage, unshareFromSquare } from "./square.service";
import { SQUARE_PAGE_SIZE } from "@shared/types/square";

/**
 * 广场路由层 (HTTP 边界)
 * 只做参数解析、认证检查与响应映射，业务逻辑在 service 层
 * 路径使用绝对路径 (/api/...)，由主 api.ts 挂载在根路径
 */

export const squareRoutes = new Hono<AppEnv>()
  // 公开：分页获取广场分享列表
  .get("/api/square", async (c) => {
    const offset = Math.max(0, parseInt(c.req.query("offset") || "0", 10) || 0);
    const limit = Math.min(
      50,
      Math.max(1, parseInt(c.req.query("limit") || String(SQUARE_PAGE_SIZE), 10) || SQUARE_PAGE_SIZE)
    );

    const data = await getSquarePage(c.env.D1, offset, limit);
    return c.json(data);
  })
  // 认证：取消自己的页面在广场的分享
  .delete("/api/pages/:id/square", async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "未登录" }, 401);
    if (!c.env.D1) return c.json({ error: "database unavailable" }, 503);

    const ok = await unshareFromSquare(c.env.D1, c.req.param("id"), user.id);
    if (!ok) return c.json({ error: "页面不存在" }, 404);

    return c.json({ success: true });
  });

export type SquareApi = typeof squareRoutes;
