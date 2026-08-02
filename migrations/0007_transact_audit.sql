PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS transact_orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES contributor_users(id) ON DELETE RESTRICT,
  direction TEXT NOT NULL CHECK (direction IN ('buy_grid', 'sell_grid')),
  status TEXT NOT NULL CHECK (
    status IN (
      'draft',
      'identity_pending',
      'identity_approved',
      'quote_ready',
      'funding_pending',
      'funding_confirmed',
      'settlement_pending',
      'settled',
      'manual_review',
      'cancelled',
      'refunded',
      'failed'
    )
  ),
  source_asset TEXT NOT NULL,
  destination_asset TEXT NOT NULL,
  source_amount TEXT,
  destination_amount TEXT,
  destination_address TEXT,
  stripe_customer_ref TEXT,
  stripe_onramp_session_ref TEXT,
  provider_payment_ref TEXT,
  gex_quote_ref TEXT,
  source_transaction_ref TEXT,
  destination_transaction_ref TEXT,
  quote_expires_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS transact_orders_user_created_idx
  ON transact_orders(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS transact_orders_status_idx
  ON transact_orders(status, updated_at DESC);

CREATE TABLE IF NOT EXISTS transact_audit_log (
  id TEXT PRIMARY KEY,
  order_id TEXT REFERENCES transact_orders(id) ON DELETE RESTRICT,
  actor_user_id TEXT REFERENCES contributor_users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  previous_status TEXT,
  next_status TEXT,
  provider TEXT,
  provider_reference TEXT,
  detail TEXT,
  ip_hash TEXT,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS transact_audit_order_created_idx
  ON transact_audit_log(order_id, created_at ASC);

CREATE INDEX IF NOT EXISTS transact_audit_created_idx
  ON transact_audit_log(created_at DESC);

CREATE TRIGGER IF NOT EXISTS transact_audit_no_update
BEFORE UPDATE ON transact_audit_log
BEGIN
  SELECT RAISE(ABORT, 'transact audit records are immutable');
END;

CREATE TRIGGER IF NOT EXISTS transact_audit_no_delete
BEFORE DELETE ON transact_audit_log
BEGIN
  SELECT RAISE(ABORT, 'transact audit records are immutable');
END;
