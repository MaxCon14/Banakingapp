-- Vault PWA — Initial Database Schema
-- Run this file against your PostgreSQL database to set up the schema.

CREATE TABLE IF NOT EXISTS accounts (
  id          SERIAL PRIMARY KEY,
  balance     NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  currency    CHAR(3)        NOT NULL DEFAULT 'GBP',
  created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
  id                       SERIAL PRIMARY KEY,
  type                     VARCHAR(20)    NOT NULL CHECK (type IN ('deposit', 'withdrawal')),
  amount                   NUMERIC(12, 2) NOT NULL,
  stripe_payment_intent_id VARCHAR(255),
  stripe_payout_id         VARCHAR(255),
  status                   VARCHAR(20)    NOT NULL DEFAULT 'pending'
                                          CHECK (status IN ('pending', 'completed', 'failed')),
  created_at               TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pots (
  id             SERIAL PRIMARY KEY,
  name           VARCHAR(100)   NOT NULL,
  target_amount  NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  current_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  emoji          VARCHAR(10)    NOT NULL DEFAULT '💰',
  created_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_status     ON transactions (status);
CREATE INDEX IF NOT EXISTS idx_transactions_type       ON transactions (type);
