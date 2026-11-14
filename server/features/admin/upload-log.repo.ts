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
  status?: string | null;
}

export interface UploadLogRow {
  id: number;
  userId: string | null;
  userName: string | null;
  pageId: string;
  event: string;
  contentType: string | null;
  isAnonymous: number;
  ip: string | null;
  fileSize: number | null;
  status: string | null;
  createdAt: number;
}

/**
 * Insert an upload log entry. Errors are swallowed to never block the caller.
 * Returns a Promise so callers can optionally await it for reliability.
 */
export function insertUploadLog(d1: D1Database, entry: UploadLogEntry): Promise<void> {
  return d1.prepare(
    `INSERT INTO upload_log (user_id, page_id, event, content_type, is_anonymous, ip, file_size, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      entry.userId ?? null,
      entry.pageId,
      entry.event,
      entry.contentType ?? null,
      entry.isAnonymous ? 1 : 0,
      entry.ip ?? null,
      entry.fileSize ?? null,
      entry.status ?? null,
      Date.now()
    )
    .run()
    .then(() => {})
    .catch((e) => { log.error("upload log write failed", { pageId: entry.pageId, event: entry.event, error: String(e) }); });
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
    d1.prepare(`SELECT l.*, u.name as user_name FROM upload_log l LEFT JOIN user u ON l.user_id = u.id ${where} ORDER BY l.created_at DESC LIMIT ? OFFSET ?`)
      .bind(...binds, pageSize, offset)
      .all(),
  ]);

  const logs: UploadLogRow[] = (rows.results ?? []).map((r: any) => ({
    id: r.id,
    userId: r.user_id ?? null,
    userName: r.user_name ?? null,
    pageId: r.page_id,
    event: r.event,
    contentType: r.content_type ?? null,
    isAnonymous: r.is_anonymous,
    ip: r.ip ?? null,
    fileSize: r.file_size ?? null,
    status: r.status ?? null,
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

// --- Scan logs ---

export interface ScanLogEntry {
  pageId: string;
  status: "approved" | "blocked" | "error";
  reason?: string | null;
  threats?: string | null;
  htmlLength?: number | null;
  isAnonymous: boolean;
}

/**
 * Insert a scan log entry. Errors are swallowed to never block the caller.
 */
export function insertScanLog(d1: D1Database, entry: ScanLogEntry): Promise<void> {
  return d1.prepare(
    `INSERT INTO scan_log (page_id, status, reason, threats, html_length, is_anonymous, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      entry.pageId,
      entry.status,
      entry.reason ?? null,
      entry.threats ?? null,
      entry.htmlLength ?? null,
      entry.isAnonymous ? 1 : 0,
      Date.now()
    )
    .run()
    .then(() => {})
    .catch((e) => { log.error("scan log write failed", { pageId: entry.pageId, status: entry.status, error: String(e) }); });
}

export interface BlockedScanInfo {
  reason: string;
  labels: string[];
}

/**
 * 查询页面最近一次被 block 的原因（供访问下架页面时展示）。
 * 仅 regex 类别返回命中的标签名，phishing/ai 不向用户暴露细节。
 */
export async function getLatestBlockedScan(
  d1: D1Database,
  pageId: string
): Promise<BlockedScanInfo | null> {
  const rows = await d1.prepare(
    `SELECT reason, threats FROM scan_log WHERE page_id = ? AND status = 'blocked'
     ORDER BY created_at DESC LIMIT 1`
  )
    .bind(pageId)
    .all<{ reason: string | null; threats: string | null }>();
  const row = rows.results[0];
  if (!row?.reason) return null;

  const labels: string[] = [];
  if (row.reason === "regex" && row.threats) {
    try {
      const parsed = JSON.parse(row.threats) as { label?: string }[];
      for (const t of parsed) {
        if (typeof t?.label === "string") labels.push(t.label);
      }
    } catch { /* threats 格式异常时仅展示类别文案 */ }
  }
  return { reason: row.reason, labels };
}

export async function deleteOldScanLogs(
  d1: D1Database,
  cutoffMs: number
): Promise<number> {
  const result = await d1.prepare("DELETE FROM scan_log WHERE created_at < ?")
    .bind(cutoffMs)
    .run();
  return result.meta.changes ?? 0;
}

export async function deleteOldRateLogs(
  d1: D1Database,
  cutoffMs: number
): Promise<number> {
  const result = await d1.prepare("DELETE FROM upload_rate_log WHERE created_at < ?")
    .bind(cutoffMs)
    .run();
  return result.meta.changes ?? 0;
}

export type LogTable = "upload_log" | "scan_log" | "upload_rate_log";

export interface LogCleanupOutcome {
  /** 各表删除的行数；该表失败时为 0 */
  deleted: Record<LogTable, number>;
  /** 失败的表及其错误，交给调用方决定怎么记日志 */
  failures: { table: LogTable; error: unknown }[];
}

/**
 * 清理三张日志表。三张表互相独立：任何一张失败都只记进 failures，
 * 不会中断另外两张，也不会把异常抛给 cron 里后续的清理步骤。
 */
export async function cleanupOldLogs(
  d1: D1Database,
  cutoffMs: number
): Promise<LogCleanupOutcome> {
  const tasks: { table: LogTable; run: () => Promise<number> }[] = [
    { table: "upload_log", run: () => deleteOldUploadLogs(d1, cutoffMs) },
    { table: "scan_log", run: () => deleteOldScanLogs(d1, cutoffMs) },
    { table: "upload_rate_log", run: () => deleteOldRateLogs(d1, cutoffMs) },
  ];

  const deleted: Record<LogTable, number> = {
    upload_log: 0,
    scan_log: 0,
    upload_rate_log: 0,
  };
  const failures: LogCleanupOutcome["failures"] = [];

  await Promise.all(
    tasks.map(async ({ table, run }) => {
      try {
        deleted[table] = await run();
      } catch (error) {
        failures.push({ table, error });
      }
    })
  );

  return { deleted, failures };
}
