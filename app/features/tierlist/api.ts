import { apiClient, rpcErrorMessage } from "~/features/api-client";
import type {
  CastVoteResponse,
  TierlistBoardResponse,
} from "@shared/types/tierlist";

/**
 * AI Tier List 功能的类型化 API 客户端 (Hono RPC)
 * 页面/组件只依赖此模块，不直接 fetch
 */

/** 拉取某主题榜的聚合结果（未登录也能看，myVotes 为空） */
export async function fetchTierlistBoard(
  board: string,
): Promise<TierlistBoardResponse | null> {
  try {
    const res = await apiClient().api.tierlist[":board"].$get({ param: { board } });
    if (!res.ok) return null;
    return (await res.json()) as TierlistBoardResponse;
  } catch {
    return null;
  }
}

/** 投票 / 改票（需登录；失败时返回 null 并带出错误信息） */
export async function castTierlistVote(
  board: string,
  tool: string,
  tier: number,
): Promise<{ data: CastVoteResponse | null; error?: string }> {
  try {
    const res = await apiClient().api.tierlist.vote.$post({
      json: { board, tool, tier },
    });
    if (!res.ok) {
      return { data: null, error: await rpcErrorMessage(res) };
    }
    return { data: (await res.json()) as CastVoteResponse };
  } catch (e) {
    return { data: null, error: e instanceof Error ? e.message : "network error" };
  }
}
