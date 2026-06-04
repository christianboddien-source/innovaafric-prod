-- ============================================================
-- InnovaAFRIC — Supabase Webhook Trigger (users → Railway)
-- Run this in Supabase SQL Editor
-- ============================================================
-- Prerequisite: Enable the pg_net extension in Supabase:
--   Extensions → pg_net → Enable
-- ============================================================
-- Then run this SQL to create the trigger that calls Railway
-- every time a new user registers in Supabase.
-- ============================================================

-- 1. Enable pg_net (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Create the trigger function
CREATE OR REPLACE FUNCTION notify_railway_new_user()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM net.http_post(
    url     := 'https://innovaafric-api-production.up.railway.app/v1/admin/sync-user',
    headers := jsonb_build_object(
      'Content-Type',       'application/json',
      'X-Webhook-Secret',   'innovaafric_sync_2026'
    ),
    body    := jsonb_build_object(
      'type',   'INSERT',
      'table',  'users',
      'record', row_to_json(NEW)
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Attach the trigger to the users table
DROP TRIGGER IF EXISTS on_user_insert_sync_railway ON users;

CREATE TRIGGER on_user_insert_sync_railway
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION notify_railway_new_user();

-- 4. Verify the trigger was created
SELECT trigger_name, event_manipulation, event_object_table, action_timing
FROM information_schema.triggers
WHERE event_object_table = 'users'
  AND trigger_name = 'on_user_insert_sync_railway';
