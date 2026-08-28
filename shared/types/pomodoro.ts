/**
 * Pomodoro (番茄钟) 功能的共享类型与常量
 * 前后端唯一数据契约来源，禁止在前端或后端重复定义同名字段
 */

/** 番茄钟会话记录 */
export interface PomodoroSession {
  id: string;
  userId: string;
  duration: number;
  completedAt: number; // Unix seconds (Drizzle timestamp mode)
}

/** 记录番茄钟会话请求 */
export interface RecordSessionRequest {
  duration: number;
}

/** 记录番茄钟会话响应 */
export interface RecordSessionResponse {
  success: boolean;
}

/** 获取今日番茄钟数量响应 */
export interface TodayCountResponse {
  today: number;
  total: number;
}