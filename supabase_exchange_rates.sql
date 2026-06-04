-- Initial exchange rates for XenderMoney live calculator
-- Run in Supabase SQL Editor

INSERT INTO exchange_rates (pair, rate, updated_at)
VALUES
  ('EUR-XAF', 655.957, NOW()),
  ('EUR-XOF', 655.957, NOW()),
  ('EUR-GNF', 9800,    NOW()),
  ('EUR-USD', 1.08,    NOW()),
  ('EUR-GBP', 0.86,    NOW()),
  ('USD-XAF', 607,     NOW()),
  ('USD-XOF', 607,     NOW()),
  ('USD-GNF', 8600,    NOW()),
  ('USD-EUR', 0.925,   NOW()),
  ('USD-GBP', 0.795,   NOW()),
  ('GBP-XAF', 763,     NOW()),
  ('GBP-XOF', 763,     NOW()),
  ('GBP-GNF', 10800,   NOW()),
  ('GBP-USD', 1.258,   NOW()),
  ('GBP-EUR', 1.163,   NOW()),
  ('XAF-EUR', 0.001524,NOW()),
  ('XAF-USD', 0.001647,NOW()),
  ('XOF-EUR', 0.001524,NOW()),
  ('XOF-USD', 0.001647,NOW()),
  ('GNF-EUR', 0.000102,NOW()),
  ('GNF-USD', 0.000116,NOW())
ON CONFLICT (pair) DO UPDATE SET rate = EXCLUDED.rate, updated_at = NOW();
