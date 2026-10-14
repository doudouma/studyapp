-- 到期 / 限次 / 一次性（焚毁）链接：page 元数据 + 焚毁事件埋点表
-- 复用已有列 page.expires_at（到期时间）与 page.view_count（访问次数）；
-- 新增列均可空或带默认值，存量页面不受影响（state 默认 'active'）。
ALTER TABLE page ADD COLUMN max_views INTEGER;
ALTER TABLE page ADD COLUMN state TEXT NOT NULL DEFAULT 'active';
ALTER TABLE page ADD COLUMN burn_reason TEXT;
ALTER TABLE page ADD COLUMN burned_at INTEGER;
ALTER TABLE page ADD COLUMN uploader_fp TEXT;
ALTER TABLE page ADD COLUMN content_hash TEXT;
ALTER TABLE page ADD COLUMN expiry_preset TEXT;

-- 焚毁事件埋点（KPI：选用到期分布、一次性占比、焚烧量），保留 90 天由 cron 清理
CREATE TABLE IF NOT EXISTS burn_event (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page_id TEXT NOT NULL,
  user_id TEXT,
  event TEXT NOT NULL,
  expiry_preset TEXT,
  max_views INTEGER,
  is_one_time INTEGER NOT NULL DEFAULT 0,
  burn_reason TEXT,
  view_count_at_burn INTEGER,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_burn_event_time ON burn_event (created_at);
CREATE INDEX IF NOT EXISTS idx_burn_event_page ON burn_event (page_id);
