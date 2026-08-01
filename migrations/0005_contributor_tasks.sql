PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS contributor_task_moderators (
  user_id TEXT PRIMARY KEY REFERENCES contributor_users(id) ON DELETE CASCADE,
  granted_by TEXT NOT NULL REFERENCES contributor_users(id),
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS contributor_tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'todo'
    CHECK (status IN ('todo', 'in_progress', 'blocked', 'done')),
  priority TEXT NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  assigned_to TEXT NOT NULL REFERENCES contributor_users(id) ON DELETE CASCADE,
  created_by TEXT NOT NULL REFERENCES contributor_users(id),
  due_at INTEGER,
  completed_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS contributor_tasks_assignee_idx
  ON contributor_tasks(assigned_to, status, updated_at DESC);

CREATE INDEX IF NOT EXISTS contributor_tasks_status_idx
  ON contributor_tasks(status, updated_at DESC);

CREATE TABLE IF NOT EXISTS contributor_task_comments (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES contributor_tasks(id) ON DELETE CASCADE,
  author_id TEXT NOT NULL REFERENCES contributor_users(id),
  body TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS contributor_task_comments_task_idx
  ON contributor_task_comments(task_id, created_at ASC);
