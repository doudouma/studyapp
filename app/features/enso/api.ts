import { apiClient } from "~/features/api-client";
import type { EnsoRankGetResponse, EnsoRankPostRequest, EnsoRankPostResponse } from "@shared/types/enso";

/**
 * Enso (一笔禅圆) 排行榜的类型化 API 客户端 (Hono RPC)
 * 页面/组件只依赖此模块，不直接 fetch
 */

/** 拉取 TOP100（可选携带设备标识以标记“我的名次”） */
export async function fetchEnsoRank(playerKey: string | null): Promise<EnsoRankGetResponse> {
  const res = await apiClient().api.enso.rank.$get({
    header: playerKey ? { "X-Player-Key": playerKey } : {},
  });
  if (!res.ok) throw new Error("Enso rank fetch failed");
  return (await res.json()) as EnsoRankGetResponse;
}

/** 提交成绩（仅刷新个人最佳时入库） */
export async function submitEnsoScore(
  playerKey: string,
  data: EnsoRankPostRequest
): Promise<EnsoRankPostResponse> {
  const res = await apiClient().api.enso.rank.$post({
    json: data,
    header: { "X-Player-Key": playerKey },
  });
  if (!res.ok) {
    const err = new Error("Enso rank submit failed") as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return (await res.json()) as EnsoRankPostResponse;
}
