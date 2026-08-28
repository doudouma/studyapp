import { eq, and, sql, gte, lt } from "drizzle-orm";
import { nanoid } from "nanoid";
import { createDb } from "../../db";
import { pomodoroSession } from "../../db/schema";

/**
 * Pomodoro 数据访问层 (Repository)
 * 只做数据读写，不含业务规则，不感知 HTTP
 */

/** 记录番茄钟会话 */
export async function recordPomodoroSession(
  d1: D1Database,
  userId: string,
  duration: number
): Promise<void> {
  const db = createDb(d1);
  await db.insert(pomodoroSession).values({
    id: nanoid(12),
    userId,
    duration,
    completedAt: new Date(),
  });
}

/** 获取用户今日番茄钟数量 */
export async function getTodayCount(
  d1: D1Database,
  userId: string
): Promise<number> {
  const db = createDb(d1);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(pomodoroSession)
    .where(
      and(
        eq(pomodoroSession.userId, userId),
        gte(pomodoroSession.completedAt, today),
        lt(pomodoroSession.completedAt, tomorrow)
      )
    );

  return Number(result[0]?.count || 0);
}

/** 获取用户总番茄钟数量 */
export async function getTotalCount(
  d1: D1Database,
  userId: string
): Promise<number> {
  const db = createDb(d1);
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(pomodoroSession)
    .where(eq(pomodoroSession.userId, userId));

  return Number(result[0]?.count || 0);
}