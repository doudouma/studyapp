import { apiClient } from "~/features/api-client";
import type { SquareData } from "@shared/types/square";

/**
 * 广场功能的类型化 API 客户端 (Hono RPC)
 * 页面/组件只依赖此模块，不直接 fetch
 */

/** 分页拉取广场分享列表 */
export async function fetchSquareItems(offset: number): Promise<SquareData> {
  const res = await apiClient().api.square.$get({ query: { offset: String(offset) } });
  if (!res.ok) return { items: [], hasMore: false };
  return res.json();
}

/** 取消自己的页面在广场的分享 */
export async function unshareFromSquare(pageId: string): Promise<{ ok: boolean; error?: string }> {
  const res = await apiClient().api.pages[":id"].square.$delete({ param: { id: pageId } });
  const body = await res.json();
  if (!res.ok) return { ok: false, error: (body as { error?: string }).error };
  return { ok: true };
}
