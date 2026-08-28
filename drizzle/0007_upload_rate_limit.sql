CREATE TABLE IF NOT EXISTS upload_rate_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_upload_rate_log_ip_ts ON upload_rate_log(ip, created_at);
