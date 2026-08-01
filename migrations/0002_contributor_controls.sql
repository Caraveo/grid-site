ALTER TABLE contributor_users ADD COLUMN mailbox_quota_mb INTEGER NOT NULL DEFAULT 1024;
ALTER TABLE contributor_users ADD COLUMN daily_send_limit INTEGER NOT NULL DEFAULT 100;
ALTER TABLE contributor_users ADD COLUMN daily_sent_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE contributor_users ADD COLUMN daily_sent_date TEXT;

CREATE TABLE IF NOT EXISTS contributor_rate_limits (
  bucket TEXT NOT NULL,
  subject_hash TEXT NOT NULL,
  window_started_at INTEGER NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (bucket, subject_hash)
);

