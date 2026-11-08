import { Hono } from "hono";
import type { AppEnv } from "../../types";
import type { CastVoteRequest } from "@shared/types/tierlist";
import { isTierlistBoard } from "@shared/types/tierlist";
import { castUserVote, getBoardResults } from "./tierlist.service";

/**
 * AI Tier List 路由层 (HTTP 边界)
 * 只做参数解析、认证检查与响应映射，校验与聚合在 service 层
 * 路径使用绝对路径 (/api/...)，由主 api.ts 挂载在根路径
 */
export const tierlistRoutes = new Hono<AppEnv>()
  // 拉取某主题榜的聚合结果（未登录也能看，myVotes 为空）
  .get("/api/tierlist/:board", async (c) => {
    const board = c.req.param("board");
    if (!isTierlistBoard(board)) return c.json({ error: "unknown board" }, 404);
    if (!c.env.D1) return c.json({ error: "database unavailable" }, 503);

    const user = c.get("user");
    const data = await getBoardResults(c.env.D1, board, user?.id);
    return c.json(data);
  })
  // 投票 / 改票（登录用户）
  .post("/api/tierlist/vote", async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "未登录" }, 401);
    if (!c.env.D1) return c.json({ error: "database unavailable" }, 503);

    let body: CastVoteRequest | undefined;
    try {
      body = await c.req.json<CastVoteRequest>();
    } catch {
      return c.json({ error: "invalid body" }, 400);
    }

    const result = await castUserVote(
      c.env.D1,
      user.id,
      body?.board,
      body?.tool,
      body?.tier,
    );
    if (!result.ok) return c.json({ error: result.error }, 400);

    return c.json({ success: true, tool: result.tool, tier: result.tier });
  });

export type TierlistApi = typeof tierlistRoutes;
