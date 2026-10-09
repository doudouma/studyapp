import { Hono } from "hono";
import type { AppEnv } from "../../types";
import type { RankPostRequest } from "@shared/types/deliveryrush";
import { getRanking, isValidDiff, registerScore } from "./rank.service";

/**
 * Delivery Rush 排行榜路由层 (HTTP 边界)
 * game.js 通过原生 fetch 调用（非 Hono RPC 客户端），响应字段名与其对齐：
 *   GET  /api/rank?diff=normal   → { top: RankEntry[], mine: RankMine | null }
 *   POST /api/rank (X-Player-Key) → { updated, best, mine }
 */

export const rankRoutes = new Hono<AppEnv>()
  .get("/api/rank", async (c) => {
    const diff = c.req.query("diff");
    if (!isValidDiff(diff)) return c.json({ error: "invalid diff" }, 400);

    // D1 不可用时返回空榜单（游戏内显示空态，不报错）
    if (!c.env.D1) return c.json({ top: [], mine: null });

    const playerKey = c.req.header("X-Player-Key") || null;
    return c.json(await getRanking(c.env.D1, diff, playerKey));
  })
  .post("/api/rank", async (c) => {
    if (!c.env.D1) return c.json({ error: "database unavailable" }, 503);

    const playerKey = c.req.header("X-Player-Key");
    if (!playerKey || playerKey.length < 8 || playerKey.length > 128) {
      return c.json({ error: "missing player key" }, 400);
    }

    const body = await c.req.json<RankPostRequest>().catch(() => null);
    if (!body || !isValidDiff(body.diff)) return c.json({ error: "invalid diff" }, 400);
    if (
      typeof body.name !== "string" ||
      typeof body.score !== "number" || !Number.isFinite(body.score) ||
      typeof body.delivered !== "number" || !Number.isFinite(body.delivered) ||
      typeof body.combo !== "number" || !Number.isFinite(body.combo)
    ) {
      return c.json({ error: "invalid body" }, 400);
    }

    const res = await registerScore(c.env.D1, {
      diff: body.diff,
      name: body.name,
      score: body.score,
      delivered: body.delivered,
      combo: body.combo,
      playerKey,
    });

    if ("error" in res) {
      if (res.error === "rate_limited") return c.json({ error: "rate limited" }, 429);
      return c.json({ error: "invalid score" }, 400);
    }
    return c.json(res);
  });

export type RankApi = typeof rankRoutes;
