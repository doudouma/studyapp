/**
 * Outbreak Delivery (末世配送) 功能的共享类型与常量
 * 前后端唯一数据契约来源
 */

/** 排行榜展示上限（与榜单查询一致） */
export const OUTBREAK_TOP_LIMIT = 100;

/** 排行榜单条记录 */
export interface OutbreakRankEntry {
  name: string;
  score: number;
  /** 送达件数 */
  delivered: number;
  /** 存活秒数 */
  time: number;
  /** 是否为当前设备自己的记录 */
  me?: boolean;
}

/** 当前设备的个人最佳信息 */
export interface OutbreakRankMine {
  rank: number;
  score: number;
  inTop: boolean;
  over?: boolean;
}

/** GET /api/outbreak/rank 响应 */
export interface OutbreakRankGetResponse {
  top: OutbreakRankEntry[];
  mine: OutbreakRankMine | null;
}

/** POST /api/outbreak/rank 请求体 */
export interface OutbreakRankPostRequest {
  name: string;
  score: number;
  delivered: number;
  time: number;
}

/** POST /api/outbreak/rank 响应 */
export interface OutbreakRankPostResponse {
  updated: boolean;
  best: number;
  mine: OutbreakRankMine | null;
}
