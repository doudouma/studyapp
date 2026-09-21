import type { SquareData, SquareItem } from "@shared/types/square";
import {
  listSharedPages,
  isPageOwnedBy,
  clearSquareSharing,
  type SharedPageRow,
} from "./square.repo";

/**
 * 广场业务逻辑层 (Service)
 * 承载业务规则与 DTO 转换，供 routes 与未来其他调用方复用
 */

/** DB 原始行 → 前端 DTO */
function toSquareItem(row: SharedPageRow): SquareItem {
  return {
    id: row.id,
    title: row.title || "",
    category: row.category || "general",
    tags: row.tags || "",
    viewCount: row.viewCount,
    sharedAt: row.sharedAt ? row.sharedAt.getTime() : 0,
    previewPath: row.previewPath,
    userName: row.userName,
    userImage: row.userImage,
  };
}

/** 获取广场分页数据；offset 越界时返回空页 */
export async function getSquarePage(
  d1: D1Database | undefined,
  offset: number,
  pageSize: number
): Promise<SquareData> {
  if (!d1) return { items: [], hasMore: false };

  const rows = await listSharedPages(d1, Math.max(0, offset), pageSize);
  const hasMore = rows.length > pageSize;
  const items = rows.slice(0, pageSize).map(toSquareItem);
  return { items, hasMore };
}

/** 取消分享；页面不存在或不属于该用户时返回 false。同时删除不再需要的缩略图 */
export async function unshareFromSquare(
  d1: D1Database | undefined,
  bucket: R2Bucket | undefined,
  pageId: string,
  userId: string
): Promise<boolean> {
  if (!d1) return false;
  const owned = await isPageOwnedBy(d1, pageId, userId);
  if (!owned) return false;
  await clearSquareSharing(d1, pageId);
  // 缩略图仅用于广场，取消分享后删除（失败不影响取消结果）
  if (bucket) {
    try {
      await bucket.delete(`thumbnails/${pageId}.webp`);
    } catch {
      // best-effort：R2 删除失败仅遗留孤立对象，不影响分享状态
    }
  }
  return true;
}
