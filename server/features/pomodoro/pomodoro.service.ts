import type { TodayCountResponse } from "@shared/types/pomodoro";
import {
  recordPomodoroSession,
  getTodayCount,
  getTotalCount,
} from "./pomodoro.repo";

/**
 * Pomodoro 业务逻辑层 (Service)
 * 承载业务规则与 DTO 转换，供 routes 与未来其他调用方复用
 */

/** 记录番茄钟会话 */
export async function recordSession(
  d1: D1Database | undefined,
  userId: string,
  duration: number
): Promise<boolean> {
  if (!d1) return false;
  if (duration <= 0) return false;
  
  await recordPomodoroSession(d1, userId, duration);
  return true;
}

/** 获取今日番茄钟数量 */
export async function getTodayTomatoCount(
  d1: D1Database | undefined,
  userId: string
): Promise<TodayCountResponse> {
  if (!d1) return { today: 0, total: 0 };

  const [today, total] = await Promise.all([
    getTodayCount(d1, userId),
    getTotalCount(d1, userId),
  ]);

  return { today, total };
}