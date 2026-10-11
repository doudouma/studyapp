import { Hono } from "hono";
import type { AppEnv } from "../../types";
import type { OutbreakRankPostRequest } from "@shared/types/outbreak";
import { getRanking, registerScore } from "./outbreak.service";

/**
 * Outbreak Delivery 排行榜路由层
 *   GET  /api/outbreak/rank (X-Player-Key 可选)
 *   POST /api/outbreak/rank (X-Player-Key 必填)
 */
export const outbreakRoutes = new Hono<AppEnv>()
  .get("/api/outbreak/rank", async (c) => {
    if (!c.env.D1) return c.json({ top: [], mine: null });
    const playerKey = c.req.header("X-Player-Key") || null;
    return c.json(await getRanking(c.env.D1, playerKey));
  })
  .post("/api/outbreak/rank", async (c) => {
    if (!c.env.D1) return c.json({ error: "database unavailable" }, 503);

    const playerKey = c.req.header("X-Player-Key");
    if (!playerKey || playerKey.length < 8 || playerKey.length > 128) {
      return c.json({ error: "missing player key" }, 400);
    }

    const body = await c.req.json<OutbreakRankPostRequest>().catch(() => null);
    if (
      !body ||
      typeof body.name !== "string" ||
      typeof body.score !== "number" || !Number.isFinite(body.score) ||
      typeof body.delivered !== "number" || !Number.isFinite(body.delivered) ||
      typeof body.time !== "number" || !Number.isFinite(body.time)
    ) {
      return c.json({ error: "invalid body" }, 400);
    }

    const res = await registerScore(c.env.D1, {
      name: body.name,
      score: body.score,
      delivered: body.delivered,
      time: body.time,
      playerKey,
    });

    if ("error" in res) {
      if (res.error === "rate_limited") return c.json({ error: "rate limited" }, 429);
      return c.json({ error: "invalid score" }, 400);
    }
    return c.json(res);
  });

export type OutbreakApi = typeof outbreakRoutes;
