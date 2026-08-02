CREATE TABLE IF NOT EXISTS exchange_auth_codes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES contributor_users(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL UNIQUE,
  expires_at INTEGER NOT NULL,
  used_at INTEGER,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS exchange_auth_codes_lookup_idx
  ON exchange_auth_codes(code_hash, expires_at, used_at);
