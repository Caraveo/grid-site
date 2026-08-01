PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS contributor_passkeys (
  credential_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES contributor_users(id) ON DELETE CASCADE,
  public_key TEXT NOT NULL,
  counter INTEGER NOT NULL DEFAULT 0,
  transports TEXT,
  device_name TEXT NOT NULL DEFAULT 'Passkey',
  created_at INTEGER NOT NULL,
  last_used_at INTEGER
);

CREATE INDEX IF NOT EXISTS contributor_passkeys_user_idx
  ON contributor_passkeys(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS contributor_passkey_challenges (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES contributor_users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('registration', 'authentication')),
  challenge TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  used_at INTEGER,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS contributor_passkey_challenges_expiry_idx
  ON contributor_passkey_challenges(expires_at);
