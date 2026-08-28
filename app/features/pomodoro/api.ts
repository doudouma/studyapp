import { apiClient } from "~/features/api-client";
import type { RecordSessionResponse, TodayCountResponse } from "@shared/types/pomodoro";

/**
 * Pomodoro 功能的类型化 API 客户端 (Hono RPC)
 * 页面/组件只依赖此模块，不直接 fetch
 */

/** 记录番茄钟会话 */
export async function recordPomodoroSession(duration: number): Promise<RecordSessionResponse> {
  const res = await apiClient().api.pomodoro.sessions.$post({ json: { duration } });
  if (!res.ok) return { success: false };
  return (await res.json()) as RecordSessionResponse;
}

/** 获取今日番茄钟数量 */
export async function fetchTodayTomatoCount(): Promise<TodayCountResponse> {
  const res = await apiClient().api.pomodoro["today-count"].$get();
  if (!res.ok) return { today: 0, total: 0 };
  return (await res.json()) as TodayCountResponse;
}