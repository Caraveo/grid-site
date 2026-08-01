PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS contributor_users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE COLLATE NOCASE,
  recovery_email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'contributor' CHECK (role IN ('admin', 'contributor')),
  status TEXT NOT NULL DEFAULT 'pending_email'
    CHECK (status IN ('pending_email', 'pending_approval', 'approved', 'suspended', 'rejected')),
  email_verified_at INTEGER,
  approved_at INTEGER,
  approved_by TEXT REFERENCES contributor_users(id),
  agentmail_inbox_id TEXT UNIQUE,
  agentmail_email TEXT UNIQUE COLLATE NOCASE,
  totp_secret_encrypted TEXT,
  totp_enabled_at INTEGER,
  failed_login_count INTEGER NOT NULL DEFAULT 0,
  locked_until INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS contributor_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES contributor_users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  user_agent TEXT,
  ip_hash TEXT,
  created_at INTEGER NOT NULL,
  last_seen_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  revoked_at INTEGER
);

CREATE INDEX IF NOT EXISTS contributor_sessions_user_idx
  ON contributor_sessions(user_id, expires_at);

CREATE TABLE IF NOT EXISTS contributor_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES contributor_users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('verify_email', 'password_reset', 'login_2fa')),
  token_hash TEXT NOT NULL UNIQUE,
  expires_at INTEGER NOT NULL,
  used_at INTEGER,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS contributor_tokens_lookup_idx
  ON contributor_tokens(token_hash, kind, expires_at);

CREATE TABLE IF NOT EXISTS contributor_recovery_codes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES contributor_users(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,
  used_at INTEGER,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS contributor_audit_log (
  id TEXT PRIMARY KEY,
  actor_user_id TEXT REFERENCES contributor_users(id) ON DELETE SET NULL,
  target_user_id TEXT REFERENCES contributor_users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  detail TEXT,
  ip_hash TEXT,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS contributor_audit_created_idx
  ON contributor_audit_log(created_at DESC);

