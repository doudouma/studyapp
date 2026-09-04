import type { D1Database } from "@cloudflare/workers-types";
import { log } from "../../lib/log";

export interface UploadLogEntry {
  userId?: string | null;
  pageId: string;
  event: "upload" | "delete" | "cleanup";
  contentType?: string | null;
  isAnonymous: boolean;
  ip?: string | null;
  fileSize?: number | null;
}

export interface UploadLogRow {
  id: number;
  userId: string | null;
  pageId: string;
  event: string;
  contentType: string | null;
  isAnonymous: number;
  ip: string | null;
  fileSize: number | null;
  createdAt: number;
}

/**
 * Insert an upload log entry. Fire-and-forget — errors are swallowed.
 */
export function insertUploadLog(d1: D1Database, entry: UploadLogEntry): void {
  d1.prepare(
    `INSERT INTO upload_log (user_id, page_id, event, content_type, is_anonymous, ip, file_size, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      entry.userId ?? null,
      entry.pageId,
      entry.event,
      entry.contentType ?? null,
      entry.isAnonymous ? 1 : 0,
      entry.ip ?? null,
      entry.fileSize ?? null,
      Date.now()
    )
    .run()
    .catch((e) => log.error("upload log write failed", { pageId: entry.pageId, event: entry.event, error: String(e) }));
}

export interface LogQueryParams {
  page?: number;
  pageSize?: number;
  userId?: string;
  event?: string;
  from?: number;
  to?: number;
}

export interface LogQueryResult {
  logs: UploadLogRow[];
  total: number;
}

export async function queryUploadLogs(
  d1: D1Database,
  params: LogQueryParams
): Promise<LogQueryResult> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 20));
  const offset = (page - 1) * pageSize;

  const conditions: string[] = [];
  const binds: unknown[] = [];

  if (params.userId) {
    conditions.push("user_id = ?");
    binds.push(params.userId);
  }
  if (params.event) {
    conditions.push("event = ?");
    binds.push(params.event);
  }
  if (params.from) {
    conditions.push("created_at >= ?");
    binds.push(params.from);
  }
  if (params.to) {
    conditions.push("created_at <= ?");
    binds.push(params.to);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const [countRow, rows] = await Promise.all([
    d1.prepare(`SELECT COUNT(*) as cnt FROM upload_log ${where}`)
      .bind(...binds)
      .first<{ cnt: number }>(),
    d1.prepare(`SELECT * FROM upload_log ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
      .bind(...binds, pageSize, offset)
      .all(),
  ]);

  const logs: UploadLogRow[] = (rows.results ?? []).map((r: any) => ({
    id: r.id,
    userId: r.user_id ?? null,
    pageId: r.page_id,
    event: r.event,
    contentType: r.content_type ?? null,
    isAnonymous: r.is_anonymous,
    ip: r.ip ?? null,
    fileSize: r.file_size ?? null,
    createdAt: r.created_at,
  }));

  return {
    logs,
    total: countRow?.cnt ?? 0,
  };
}

export async function deleteOldUploadLogs(
  d1: D1Database,
  cutoffMs: number
): Promise<number> {
  const result = await d1.prepare("DELETE FROM upload_log WHERE created_at < ?")
    .bind(cutoffMs)
    .run();
  return result.meta.changes ?? 0;
}
