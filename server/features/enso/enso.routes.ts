import { Hono } from "hono";
import type { AppEnv } from "../../types";
import type { EnsoRankPostRequest } from "@shared/types/enso";
import { getRanking, registerScore } from "./enso.service";

/**
 * Enso (一笔禅圆) 排行榜路由层 (HTTP 边界)
 *   GET  /api/enso/rank (X-Player-Key 可选) → { top: EnsoRankEntry[], mine: EnsoRankMine | null }
 *   POST /api/enso/rank (X-Player-Key 必填)  → { updated, best, mine }
 */

export const ensoRoutes = new Hono<AppEnv>()
  .get("/api/enso/rank", async (c) => {
    // D1 不可用时返回空榜单（游戏内显示空态，不报错）
    if (!c.env.D1) return c.json({ top: [], mine: null });

    const playerKey = c.req.header("X-Player-Key") || null;
    return c.json(await getRanking(c.env.D1, playerKey));
  })
  .post("/api/enso/rank", async (c) => {
    if (!c.env.D1) return c.json({ error: "database unavailable" }, 503);

    const playerKey = c.req.header("X-Player-Key");
    if (!playerKey || playerKey.length < 8 || playerKey.length > 128) {
      return c.json({ error: "missing player key" }, 400);
    }

    const body = await c.req.json<EnsoRankPostRequest>().catch(() => null);
    if (
      !body ||
      typeof body.name !== "string" ||
      typeof body.score !== "number" || !Number.isFinite(body.score) ||
      typeof body.passed !== "number" || !Number.isFinite(body.passed) ||
      typeof body.avg !== "number" || !Number.isFinite(body.avg)
    ) {
      return c.json({ error: "invalid body" }, 400);
    }

    const res = await registerScore(c.env.D1, {
      name: body.name,
      score: body.score,
      passed: body.passed,
      avg: body.avg,
      playerKey,
    });

    if ("error" in res) {
      if (res.error === "rate_limited") return c.json({ error: "rate limited" }, 429);
      return c.json({ error: "invalid score" }, 400);
    }
    return c.json(res);
  });

export type EnsoApi = typeof ensoRoutes;
