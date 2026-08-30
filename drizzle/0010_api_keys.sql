CREATE TABLE IF NOT EXISTS api_key (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  prefix TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  last_used_at INTEGER,
  revoked_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_api_key_user ON api_key(user_id);
CREATE INDEX IF NOT EXISTS idx_api_key_hash ON api_key(key_hash);
