-- 页面自定义地址：/p/{slug}，R2 存储仍以原 nanoid id 为 key，slug 仅作别名映射
-- 可空（随机 ID 页面为 NULL）；SQLite 唯一索引允许多个 NULL，存量页面不受影响
ALTER TABLE page ADD COLUMN slug TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS page_slug_unique ON page (slug);
