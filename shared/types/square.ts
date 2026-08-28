/**
 * 广场 (Square) 功能的共享类型与常量
 * 前后端唯一数据契约来源，禁止在前端或后端重复定义同名字段
 */

export const SQUARE_PAGE_SIZE = 12;

/** 广场列表单项 (面向前端的 DTO，不暴露数据库内部结构) */
export interface SquareItem {
  id: string;
  title: string;
  category: string;
  tags: string;
  viewCount: number;
  /** 分享时间 (Unix 毫秒)，0 表示未知 */
  sharedAt: number;
  previewPath: string | null;
  userName: string | null;
  userImage: string | null;
}

/** 广场列表分页响应 */
export interface SquareData {
  items: SquareItem[];
  hasMore: boolean;
}
