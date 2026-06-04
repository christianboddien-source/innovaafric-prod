-- ============================================================
-- InnovaAFRIC — Supabase Migration v1
-- Run this in Supabase SQL Editor (Settings > SQL Editor)
-- All statements use IF NOT EXISTS — safe on existing schemas
-- ============================================================

-- ── CORE EXTENSIONS ─────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── USERS (extend if exists) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email        TEXT UNIQUE NOT NULL,
  full_name    TEXT,
  phone        TEXT,
  country      TEXT,
  city         TEXT,
  role         TEXT DEFAULT 'cliente',
  kyc_level    INTEGER DEFAULT 0,
  is_blocked   BOOLEAN DEFAULT false,
  pin_hash     TEXT,
  bank_iban    TEXT,
  bank_name    TEXT,
  commission_pct NUMERIC(5,2) DEFAULT 0,
  notes        TEXT,
  convenio_accepted BOOLEAN DEFAULT false,
  convenio_date TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- Columns that analytics / B17 needs on transactions
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS flag TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS is_suspicious BOOLEAN DEFAULT false;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR';
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS reference TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS fee NUMERIC(14,4) DEFAULT 0;

-- ── WALLETS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wallets (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  eur        NUMERIC(14,4) DEFAULT 0,
  xaf        NUMERIC(14,4) DEFAULT 0,
  usd        NUMERIC(14,4) DEFAULT 0,
  points     INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- ── KYC REQUESTS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kyc_requests (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  status      TEXT DEFAULT 'pending',   -- pending | approved | rejected
  level       INTEGER DEFAULT 1,
  doc_type    TEXT,
  doc_url     TEXT,
  selfie_url  TEXT,
  reviewer    TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS kyc_status_idx ON kyc_requests(status);

-- ── LOANS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS loans (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID REFERENCES users(id) ON DELETE CASCADE,
  amount         NUMERIC(14,4),
  currency       TEXT DEFAULT 'EUR',
  term_months    INTEGER,
  interest_rate  NUMERIC(5,2),
  monthly_payment NUMERIC(14,4),
  status         TEXT DEFAULT 'pending', -- pending | approved | active | overdue | paid | rejected
  purpose        TEXT,
  guarantor      TEXT,
  approved_by    TEXT,
  approved_at    TIMESTAMPTZ,
  due_date       DATE,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS loans_status_idx ON loans(status);
CREATE INDEX IF NOT EXISTS loans_user_idx ON loans(user_id);

-- ── SUPPORT TICKETS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS support_tickets (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  subject     TEXT,
  body        TEXT,
  status      TEXT DEFAULT 'open',  -- open | in_progress | resolved | closed
  priority    TEXT DEFAULT 'normal',
  category    TEXT,
  assigned_to TEXT,
  resolved_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ── NOTIFICATIONS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT,
  body        TEXT,
  type        TEXT DEFAULT 'info',   -- info | warn | danger | mass
  target_role TEXT,
  read        BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);
-- Extend if table already existed without these columns
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS body TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'info';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS target_role TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT false;
CREATE INDEX IF NOT EXISTS notif_user_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notif_read_idx ON notifications(read);

-- ── ADMIN LOG (audit) ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action      TEXT NOT NULL,
  detail      TEXT,
  admin_email TEXT,
  admin_role  TEXT,
  ip          TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS admin_log_action_idx ON admin_log(action);
CREATE INDEX IF NOT EXISTS admin_log_date_idx  ON admin_log(created_at DESC);

-- ── CONFIG (key-value store) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS config (
  key        TEXT PRIMARY KEY,
  value      TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── API KEYS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS api_keys (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_name  TEXT NOT NULL,
  key_prefix    TEXT,
  full_key_hash TEXT,    -- store hashed, never plaintext
  environment   TEXT DEFAULT 'production',
  permissions   TEXT DEFAULT 'read',
  rate_limit    INTEGER DEFAULT 1000,
  call_count    BIGINT DEFAULT 0,
  last_used_at  TIMESTAMPTZ,
  status        TEXT DEFAULT 'activa',
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ── SAR REPORTS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sar_reports (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ref         TEXT UNIQUE,
  subject     TEXT,
  type        TEXT,
  assigned_to TEXT,
  status      TEXT DEFAULT 'draft',  -- draft | review | filed | closed
  priority    TEXT DEFAULT 'medium', -- low | medium | high | critical
  notes       TEXT,
  opened      DATE DEFAULT CURRENT_DATE,
  filed_at    TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sar_status_idx ON sar_reports(status);

-- ── CTR REPORTS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ctr_reports (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ref         TEXT UNIQUE,
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  user_name   TEXT,
  country     TEXT,
  amount      NUMERIC(14,4),
  currency    TEXT DEFAULT 'EUR',
  txn_type    TEXT,
  status      TEXT DEFAULT 'pending', -- pending | submitted | acknowledged
  report_date DATE DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── AML CASES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS aml_cases (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID REFERENCES users(id) ON DELETE SET NULL,
  case_ref     TEXT UNIQUE,
  risk_score   INTEGER DEFAULT 0,
  flags        TEXT[],
  status       TEXT DEFAULT 'open', -- open | investigating | resolved | escalated
  assigned_to  TEXT,
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- ── CAMPAIGNS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS campaigns (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  channel      TEXT DEFAULT 'email', -- email | sms | push
  audience     TEXT DEFAULT 'todos',
  template_id  TEXT,
  sent_count   INTEGER DEFAULT 0,
  open_rate    NUMERIC(5,2) DEFAULT 0,
  conv_rate    NUMERIC(5,2) DEFAULT 0,
  scheduled_at TIMESTAMPTZ,
  status       TEXT DEFAULT 'borrador',
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- ── A/B TEST RESULTS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ab_test_results (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id   TEXT NOT NULL,
  variant   TEXT NOT NULL,  -- A | B
  sent      INTEGER DEFAULT 0,
  opened    INTEGER DEFAULT 0,
  converted INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ab_test_idx ON ab_test_results(test_id);

-- ── MERCHANTS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS merchants (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  cat        TEXT,
  country    TEXT,
  email      TEXT,
  phone      TEXT,
  commission NUMERIC(5,2) DEFAULT 2.5,
  kyc        TEXT DEFAULT 'pendiente',
  sales      NUMERIC(14,4) DEFAULT 0,
  status     TEXT DEFAULT 'activo',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── PARTNERS (B2B) ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS partners (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  type       TEXT,
  country    TEXT,
  email      TEXT,
  contact    TEXT,
  rev_share  NUMERIC(5,2) DEFAULT 0,
  vol        NUMERIC(14,4) DEFAULT 0,
  contract   DATE,
  status     TEXT DEFAULT 'negociacion',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── STORES (XenderBigShop) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS stores (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  emoji      TEXT DEFAULT '🏪',
  type       TEXT,
  plan       TEXT DEFAULT 'basic',
  country    TEXT,
  city       TEXT,
  street     TEXT,
  streetnum  TEXT,
  phone      TEXT,
  currency   TEXT DEFAULT 'XAF',
  description TEXT,
  owner      UUID REFERENCES users(id) ON DELETE SET NULL,
  active     BOOLEAN DEFAULT true,
  products   INTEGER DEFAULT 0,
  sales      NUMERIC(14,4) DEFAULT 0,
  rating     NUMERIC(3,1) DEFAULT 5.0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── PRODUCTS (Marketplace) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  cat        TEXT,
  price      NUMERIC(14,4),
  stock      INTEGER DEFAULT 0,
  merchant   TEXT,
  description TEXT,
  rating     NUMERIC(3,1) DEFAULT 5.0,
  status     TEXT DEFAULT 'activo',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── ORDERS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  product_id  UUID REFERENCES products(id) ON DELETE SET NULL,
  amount      NUMERIC(14,4),
  currency    TEXT DEFAULT 'XAF',
  status      TEXT DEFAULT 'pending',
  delivery_id TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── INSTALLMENTS (BNPL) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS installments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  product     TEXT,
  total       NUMERIC(14,4),
  installments INTEGER,
  paid        INTEGER DEFAULT 0,
  monthly     NUMERIC(14,4),
  next_date   DATE,
  status      TEXT DEFAULT 'activo',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── INVESTMENT FUNDS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS investment_funds (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  type        TEXT,
  members     INTEGER DEFAULT 0,
  aum         NUMERIC(14,4) DEFAULT 0,
  return_pct  NUMERIC(5,2) DEFAULT 0,
  start_date  DATE,
  status      TEXT DEFAULT 'activo',
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fund_members (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fund_id   UUID REFERENCES investment_funds(id) ON DELETE CASCADE,
  user_id   UUID REFERENCES users(id) ON DELETE CASCADE,
  amount    NUMERIC(14,4) DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT now()
);

-- ── TONTINAS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tontinas (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  country      TEXT,
  organizer    UUID REFERENCES users(id) ON DELETE SET NULL,
  members_max  INTEGER DEFAULT 10,
  contribution NUMERIC(14,4),
  frequency    TEXT DEFAULT 'monthly',
  status       TEXT DEFAULT 'activo',
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tontina_members (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tontina_id UUID REFERENCES tontinas(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  turn       INTEGER,
  paid       BOOLEAN DEFAULT false,
  joined_at  TIMESTAMPTZ DEFAULT now()
);

-- ── SAVINGS GOALS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS savings_goals (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT,
  target      NUMERIC(14,4),
  saved       NUMERIC(14,4) DEFAULT 0,
  currency    TEXT DEFAULT 'EUR',
  deadline    DATE,
  status      TEXT DEFAULT 'activo',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── INSURANCE ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS insurance_plans (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  type         TEXT,
  premium      NUMERIC(14,4),
  coverage     NUMERIC(14,4),
  policyholders INTEGER DEFAULT 0,
  active       BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS insurance_subscriptions (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id   UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_id   UUID REFERENCES insurance_plans(id) ON DELETE SET NULL,
  status    TEXT DEFAULT 'activa',
  start_date DATE DEFAULT CURRENT_DATE,
  end_date  DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS insurance_claims (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  plan        TEXT,
  amount      NUMERIC(14,4),
  description TEXT,
  status      TEXT DEFAULT 'pendiente',
  filed_at    TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- ── PHYSICAL CARDS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS physical_cards (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  card_number TEXT,
  status      TEXT DEFAULT 'pendiente', -- pendiente | activa | bloqueada
  type        TEXT DEFAULT 'debit',
  delivery_address TEXT,
  requested_at TIMESTAMPTZ DEFAULT now(),
  activated_at TIMESTAMPTZ
);

-- ── VIRTUAL CARDS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS virtual_cards (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  card_number TEXT,
  expiry      TEXT,
  cvv_hash    TEXT,
  limit_eur   NUMERIC(14,4) DEFAULT 500,
  status      TEXT DEFAULT 'activa',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── PROMO CODES ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS promo_codes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code        TEXT UNIQUE NOT NULL,
  discount    NUMERIC(5,2),
  type        TEXT DEFAULT 'percent', -- percent | fixed
  max_uses    INTEGER DEFAULT 100,
  uses        INTEGER DEFAULT 0,
  expires_at  TIMESTAMPTZ,
  status      TEXT DEFAULT 'activo',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── REVIEWS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  target_type TEXT,  -- product | store | rider | merchant
  target_id   UUID,
  rating      INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  status      TEXT DEFAULT 'published',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── RIDERS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS riders (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID REFERENCES users(id) ON DELETE CASCADE,
  full_name        TEXT,
  country          TEXT,
  city             TEXT,
  vehicle          TEXT,
  total_deliveries INTEGER DEFAULT 0,
  avg_rating       NUMERIC(3,1) DEFAULT 5.0,
  status           TEXT DEFAULT 'activo',
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- ── CIRCULARES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS circulares (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT,
  country     TEXT,
  city        TEXT,
  license_no  TEXT,
  status      TEXT DEFAULT 'pendiente',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── BILL PROVIDERS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bill_providers (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  emoji       TEXT,
  name        TEXT NOT NULL,
  country     TEXT,
  type        TEXT,
  currency    TEXT DEFAULT 'XAF',
  city        TEXT,
  amounts     NUMERIC[],
  phone       TEXT,
  web         TEXT,
  description TEXT,
  active      BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── SHOP CATEGORIES ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shop_categories (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  emoji         TEXT,
  name          TEXT NOT NULL,
  description   TEXT,
  subcategories TEXT[],
  color         TEXT,
  order_idx     INTEGER DEFAULT 1,
  active        BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ── BANCOS / IBAN ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bancos (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  emoji     TEXT,
  name      TEXT NOT NULL,
  country   TEXT,
  city      TEXT,
  swift     TEXT,
  currency  TEXT DEFAULT 'EUR',
  iban      TEXT,
  titular   TEXT,
  phone     TEXT,
  address   TEXT,
  ref       TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── ACCOUNTING ENTRIES ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS accounting_entries (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date        DATE DEFAULT CURRENT_DATE,
  type        TEXT,  -- income | expense | transfer
  category    TEXT,
  amount      NUMERIC(14,4),
  currency    TEXT DEFAULT 'EUR',
  description TEXT,
  reference   TEXT,
  created_by  TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── MANUAL CHARGES ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS manual_charges (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  amount      NUMERIC(14,4),
  currency    TEXT DEFAULT 'EUR',
  description TEXT,
  charged_by  TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── NPS RESPONSES ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS nps_responses (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  score      INTEGER CHECK (score BETWEEN 0 AND 10),
  comment    TEXT,
  channel    TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── WHITE LABEL INSTANCES ────────────────────────────────────
CREATE TABLE IF NOT EXISTS white_label_instances (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  partner    TEXT,
  domain     TEXT UNIQUE,
  theme      TEXT,
  logo_url   TEXT,
  users      INTEGER DEFAULT 0,
  tx         INTEGER DEFAULT 0,
  status     TEXT DEFAULT 'activo',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) — enable but allow service_role
-- ============================================================
ALTER TABLE admin_log          ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys           ENABLE ROW LEVEL SECURITY;
ALTER TABLE sar_reports        ENABLE ROW LEVEL SECURITY;
ALTER TABLE ctr_reports        ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS — admin panel uses service key
-- These policies allow authenticated admins to read/write
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='admin_log_all' AND tablename='admin_log') THEN
    CREATE POLICY "admin_log_all" ON admin_log FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='notifications_all' AND tablename='notifications') THEN
    CREATE POLICY "notifications_all" ON notifications FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='api_keys_all' AND tablename='api_keys') THEN
    CREATE POLICY "api_keys_all" ON api_keys FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='sar_reports_all' AND tablename='sar_reports') THEN
    CREATE POLICY "sar_reports_all" ON sar_reports FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='ctr_reports_all' AND tablename='ctr_reports') THEN
    CREATE POLICY "ctr_reports_all" ON ctr_reports FOR ALL USING (true);
  END IF;
END $$;

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS txns_user_idx    ON transactions(user_id);
CREATE INDEX IF NOT EXISTS txns_date_idx    ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS txns_status_idx  ON transactions(status);
CREATE INDEX IF NOT EXISTS txns_country_idx ON transactions(country);
CREATE INDEX IF NOT EXISTS notif_created_idx ON notifications(created_at DESC);

-- ============================================================
-- Done. Run in Supabase SQL Editor.
-- ============================================================
