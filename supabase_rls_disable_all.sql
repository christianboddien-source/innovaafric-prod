-- ============================================================
-- InnovaAFRIC — Disable RLS on ALL public tables (universal)
-- Run this in Supabase SQL Editor
-- ============================================================
-- This script dynamically disables RLS on every table in the
-- public schema, including tables created outside our migration.
-- ============================================================

DO $$
DECLARE
  t RECORD;
BEGIN
  FOR t IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
  LOOP
    EXECUTE 'ALTER TABLE public.' || quote_ident(t.tablename) || ' DISABLE ROW LEVEL SECURITY;';
    RAISE NOTICE 'RLS disabled: %', t.tablename;
  END LOOP;
END $$;

-- Verify: all should show false
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
