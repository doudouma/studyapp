/// <reference types="@cloudflare/workers-types" />

/**
 * Pages 存储层 (R2)
 * 对象键布局、MIME 推断与匿名 tmp 生命周期，不感知 HTTP
 *
 * 键约定：
 * - 单文件 HTML:  {id}.html            匿名: tmp/{id}.html
 * - ZIP 上传:     {id}/index.html + {id}/{assets}   匿名: tmp/{id}/...
 * - 缩略图:       thumbnails/{id}.webp
 * - 匿名对象 customMetadata.createdAt = String(Date.now())，7 天过期
 */

import { MAX_CONTENT_SIZE } from "@shared/types/pages";

export const TMP_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
export const MAX_THUMBNAIL_SIZE = 2 * 1024 * 1024; // 2MB

export const ALLOWED_EXTENSIONS = [".html", ".htm", ".zip"];

export { MAX_CONTENT_SIZE };

export function getMimeType(filename: string): string {
  if (filename.endsWith(".html") || filename.endsWith(".htm")) return "text/html; charset=utf-8";
  if (filename.endsWith(".json")) return "application/json; charset=utf-8";
  if (filename.endsWith(".js")) return "application/javascript; charset=utf-8";
  if (filename.endsWith(".css")) return "text/css; charset=utf-8";
  if (filename.endsWith(".png")) return "image/png";
  if (filename.endsWith(".jpg") || filename.endsWith(".jpeg")) return "image/jpeg";
  if (filename.endsWith(".gif")) return "image/gif";
  if (filename.endsWith(".svg")) return "image/svg+xml";
  if (filename.endsWith(".webp")) return "image/webp";
  if (filename.endsWith(".woff2")) return "font/woff2";
  if (filename.endsWith(".woff")) return "font/woff";
  if (filename.endsWith(".ttf")) return "font/ttf";
  if (filename.endsWith(".mp3")) return "audio/mpeg";
  if (filename.endsWith(".wav")) return "audio/wav";
  if (filename.endsWith(".mp4")) return "video/mp4";
  if (filename.endsWith(".pdf")) return "application/pdf";
  return "application/octet-stream";
}

/** 写入单文件 HTML（登录用户页面） */
export async function putHtml(bucket: R2Bucket, key: string, body: string): Promise<void> {
  await bucket.put(key, body, {
    httpMetadata: { contentType: "text/html; charset=utf-8" },
  });
}

/** 删除一个页面的所有 R2 对象（HTML/ZIP 资产/缩略图） */
export async function deletePageObjects(bucket: R2Bucket, id: string): Promise<void> {
  await bucket.delete(`${id}.html`);
  await bucket.delete(`thumbnails/${id}.webp`);
  let cursor: string | undefined;
  do {
    const listed = await bucket.list({ prefix: `${id}/`, cursor });
    if (listed.objects.length > 0) {
      await bucket.delete(listed.objects.map((o) => o.key));
    }
    cursor = listed.truncated ? listed.cursor : undefined;
  } while (cursor);
}

function isExpiredByUploaded(uploaded: Date | undefined): boolean {
  if (!uploaded) return true;
  return Date.now() - uploaded.getTime() > TMP_EXPIRY_MS;
}

/** 全量遍历并删除过期的匿名 tmp 上传（cron 手动清理用），返回删除数量 */
export async function cleanupAnonymousUploads(bucket: R2Bucket): Promise<number> {
  let deleted = 0;
  let cursor: string | undefined;
  do {
    const listed = await bucket.list({ prefix: "tmp/", cursor });
    const toDelete: string[] = [];
    for (const obj of listed.objects) {
      if (isExpiredByUploaded(obj.uploaded)) {
        toDelete.push(obj.key);
      }
    }
    if (toDelete.length > 0) {
      await bucket.delete(toDelete);
      deleted += toDelete.length;
    }
    cursor = listed.truncated ? listed.cursor : undefined;
  } while (cursor);
  return deleted;
}

/** 按 tmp/{id} 前缀删除，兼容 tmp/{id}.html 与 tmp/{id}/... 两种布局 */
export async function deleteTmpByBucketId(bucket: R2Bucket, id: string): Promise<void> {
  const prefix = `tmp/${id}`;
  let cursor: string | undefined;
  do {
    const listed = await bucket.list({ prefix, cursor });
    const toDelete = listed.objects
      .filter((o) => o.key === `${prefix}.html` || o.key.startsWith(`${prefix}/`))
      .map((o) => o.key);
    if (toDelete.length > 0) {
      await bucket.delete(toDelete);
    }
    cursor = listed.truncated ? listed.cursor : undefined;
  } while (cursor);
}

export { isExpiredByUploaded };
