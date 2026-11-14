-- upload_rate_log 的清理语句按 created_at 单列过滤，而现有索引是 (ip, created_at)
-- （0007_upload_rate_limit.sql），SQLite 无法用它做 created_at 前缀查找，导致
-- 每天 cron 的 DELETE 走全表扫描。补一个单列时间索引；限流查询
-- `WHERE ip = ? AND created_at > ?` 继续用原来的复合索引，两者不冲突。
CREATE INDEX IF NOT EXISTS idx_upload_rate_log_time ON upload_rate_log(created_at);
