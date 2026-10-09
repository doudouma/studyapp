/**
 * Delivery Rush (电梯配送游戏) 功能的共享类型与常量
 * 前后端唯一数据契约来源
 */

/** 支持排行榜的难度等级 */
export const RANK_DIFFS = ["normal", "hard", "extreme"] as const;
export type RankDiff = (typeof RANK_DIFFS)[number];

/** 排行榜单条记录（game.js 消费的字段名） */
export interface RankEntry {
  name: string;
  score: number;
  del: number;
  combo: number;
  /** 是否为当前设备自己的记录 */
  me?: boolean;
}

/** 当前设备的个人最佳信息 */
export interface RankMine {
  rank: number;
  score: number;
  /** 是否进入 TOP100 */
  inTop: boolean;
  /** 超过 1000 名时只提示圏外 */
  over?: boolean;
}

/** GET /api/rank?diff= 响应 */
export interface RankGetResponse {
  top: RankEntry[];
  mine: RankMine | null;
}

/** POST /api/rank 请求体 */
export interface RankPostRequest {
  diff: RankDiff;
  name: string;
  score: number;
  delivered: number;
  combo: number;
}

/** POST /api/rank 响应 */
export interface RankPostResponse {
  updated: boolean;
  best: number;
  mine: RankMine | null;
}
