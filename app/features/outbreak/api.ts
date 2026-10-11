import { apiClient } from "~/features/api-client";
import type { OutbreakRankGetResponse, OutbreakRankPostRequest, OutbreakRankPostResponse } from "@shared/types/outbreak";

/** 拉取 TOP100（可选携带设备标识） */
export async function fetchOutbreakRank(playerKey: string | null): Promise<OutbreakRankGetResponse> {
  const res = await apiClient().api.outbreak.rank.$get({
    header: playerKey ? { "X-Player-Key": playerKey } : {},
  });
  if (!res.ok) throw new Error("Outbreak rank fetch failed");
  return (await res.json()) as OutbreakRankGetResponse;
}

/** 提交成绩（仅刷新个人最佳时入库） */
export async function submitOutbreakScore(
  playerKey: string,
  data: OutbreakRankPostRequest
): Promise<OutbreakRankPostResponse> {
  const res = await apiClient().api.outbreak.rank.$post({
    json: data,
    header: { "X-Player-Key": playerKey },
  });
  if (!res.ok) {
    const err = new Error("Outbreak rank submit failed") as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return (await res.json()) as OutbreakRankPostResponse;
}
