/**
 * Enso (一笔禅圆) 功能的共享类型与常量
 * 前后端唯一数据契约来源
 */

/** 排行榜展示上限（与榜单查询一致） */
export const ENSO_TOP_LIMIT = 100;

/** 排行榜单条记录 */
export interface EnsoRankEntry {
  name: string;
  score: number;
  /** 结业时通过题数 */
  passed: number;
  /** 结业时平均准确率（整数 %） */
  avg: number;
  /** 是否为当前设备自己的记录 */
  me?: boolean;
}

/** 当前设备的个人最佳信息 */
export interface EnsoRankMine {
  rank: number;
  score: number;
  /** 是否进入 TOP100 */
  inTop: boolean;
  /** 超过展示范围时只提示圈外 */
  over?: boolean;
}

/** GET /api/enso/rank 响应 */
export interface EnsoRankGetResponse {
  top: EnsoRankEntry[];
  mine: EnsoRankMine | null;
}

/** POST /api/enso/rank 请求体 */
export interface EnsoRankPostRequest {
  name: string;
  score: number;
  passed: number;
  avg: number;
}

/** POST /api/enso/rank 响应 */
export interface EnsoRankPostResponse {
  updated: boolean;
  best: number;
  mine: EnsoRankMine | null;
}
