-- Vault PWA — Seed Data
-- Creates the single personal account row.

INSERT INTO accounts (balance, currency)
VALUES (0.00, 'GBP')
ON CONFLICT DO NOTHING;
