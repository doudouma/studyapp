-- 审核日志表：记录后台安全扫描结果（approved / blocked / error）
-- 用于管理后台审计与被下架页面的原因展示（保留 90 天，由 deleteOldScanLogs 清理）
-- 注：生产库已有同名表（结构一致），IF NOT EXISTS 保证幂等
CREATE TABLE IF NOT EXISTS scan_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page_id TEXT NOT NULL,
  status TEXT NOT NULL,
  reason TEXT,
  threats TEXT,
  html_length INTEGER,
  is_anonymous INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_scan_log_page ON scan_log (page_id);
CREATE INDEX IF NOT EXISTS idx_scan_log_time ON scan_log (created_at);
