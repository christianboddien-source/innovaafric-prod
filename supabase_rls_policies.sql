-- ============================================================
-- InnovaAFRIC — RLS Policies for Admin Panel (anon key)
-- Run this in Supabase SQL Editor
-- ============================================================
-- This allows the admin panel (which uses the anon/publishable key)
-- to read and write all tables. In production you would restrict
-- these policies to authenticated admin roles, but for now we use
-- permissive policies so the panel functions correctly.
-- ============================================================

-- Disable RLS entirely on non-sensitive tables (simplest approach)
ALTER TABLE users               DISABLE ROW LEVEL SECURITY;
ALTER TABLE wallets             DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions        DISABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_requests        DISABLE ROW LEVEL SECURITY;
ALTER TABLE loans               DISABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets     DISABLE ROW LEVEL SECURITY;
ALTER TABLE merchants           DISABLE ROW LEVEL SECURITY;
ALTER TABLE partners            DISABLE ROW LEVEL SECURITY;
ALTER TABLE stores              DISABLE ROW LEVEL SECURITY;
ALTER TABLE products            DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders              DISABLE ROW LEVEL SECURITY;
ALTER TABLE installments        DISABLE ROW LEVEL SECURITY;
ALTER TABLE investment_funds    DISABLE ROW LEVEL SECURITY;
ALTER TABLE fund_members        DISABLE ROW LEVEL SECURITY;
ALTER TABLE tontinas            DISABLE ROW LEVEL SECURITY;
ALTER TABLE tontina_members     DISABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals       DISABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_plans     DISABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_claims    DISABLE ROW LEVEL SECURITY;
ALTER TABLE physical_cards      DISABLE ROW LEVEL SECURITY;
ALTER TABLE virtual_cards       DISABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns           DISABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_results     DISABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes         DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews             DISABLE ROW LEVEL SECURITY;
ALTER TABLE riders              DISABLE ROW LEVEL SECURITY;
ALTER TABLE circulares          DISABLE ROW LEVEL SECURITY;
ALTER TABLE bill_providers      DISABLE ROW LEVEL SECURITY;
ALTER TABLE shop_categories     DISABLE ROW LEVEL SECURITY;
ALTER TABLE bancos              DISABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_entries  DISABLE ROW LEVEL SECURITY;
ALTER TABLE manual_charges      DISABLE ROW LEVEL SECURITY;
ALTER TABLE nps_responses       DISABLE ROW LEVEL SECURITY;
ALTER TABLE white_label_instances DISABLE ROW LEVEL SECURITY;

-- Keep RLS enabled on sensitive tables but with permissive admin policy
-- (already created in migration v1, but ensure they exist)
DO $$ BEGIN
  -- notifications
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='notif_all' AND tablename='notifications') THEN
    CREATE POLICY "notif_all" ON notifications FOR ALL USING (true) WITH CHECK (true);
  END IF;
  -- admin_log
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='admin_log_all' AND tablename='admin_log') THEN
    CREATE POLICY "admin_log_all" ON admin_log FOR ALL USING (true) WITH CHECK (true);
  END IF;
  -- config
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='config_all' AND tablename='config') THEN
    CREATE POLICY "config_all" ON config FOR ALL USING (true) WITH CHECK (true);
  END IF;
  -- api_keys
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='api_keys_all' AND tablename='api_keys') THEN
    CREATE POLICY "api_keys_all" ON api_keys FOR ALL USING (true) WITH CHECK (true);
  END IF;
  -- sar_reports
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='sar_all' AND tablename='sar_reports') THEN
    CREATE POLICY "sar_all" ON sar_reports FOR ALL USING (true) WITH CHECK (true);
  END IF;
  -- ctr_reports
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='ctr_all' AND tablename='ctr_reports') THEN
    CREATE POLICY "ctr_all" ON ctr_reports FOR ALL USING (true) WITH CHECK (true);
  END IF;
  -- aml_cases
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='aml_all' AND tablename='aml_cases') THEN
    CREATE POLICY "aml_all" ON aml_cases FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Also disable RLS on those tables to avoid any policy conflicts
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_log     DISABLE ROW LEVEL SECURITY;
ALTER TABLE config        DISABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys      DISABLE ROW LEVEL SECURITY;
ALTER TABLE sar_reports   DISABLE ROW LEVEL SECURITY;
ALTER TABLE ctr_reports   DISABLE ROW LEVEL SECURITY;
ALTER TABLE aml_cases     DISABLE ROW LEVEL SECURITY;

-- Verify: list tables with RLS status
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
