import { Hono } from "hono";
import type { AppEnv } from "../../types";
import { recordSession, getTodayTomatoCount } from "./pomodoro.service";

/**
 * Pomodoro 路由层 (HTTP 边界)
 * 只做参数解析、认证检查与响应映射，业务逻辑在 service 层
 * 路径使用绝对路径 (/api/...)，由主 api.ts 挂载在根路径
 */

export const pomodoroRoutes = new Hono<AppEnv>()
  // 记录番茄钟会话
  .post("/api/pomodoro/sessions", async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "未登录" }, 401);
    if (!c.env.D1) return c.json({ error: "database unavailable" }, 503);

    const { duration } = await c.req.json<{ duration: number }>();
    if (!duration || duration <= 0) return c.json({ error: "无效的时长" }, 400);

    const success = await recordSession(c.env.D1, user.id, duration);
    if (!success) return c.json({ error: "记录失败" }, 500);

    return c.json({ success: true });
  })
  // 获取今日番茄钟数量
  .get("/api/pomodoro/today-count", async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ today: 0, total: 0 });
    if (!c.env.D1) return c.json({ today: 0, total: 0 });

    const data = await getTodayTomatoCount(c.env.D1, user.id);
    return c.json(data);
  });

export type PomodoroApi = typeof pomodoroRoutes;