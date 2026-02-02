-- Migration: 20260202_cleanup_sso_tables.sql
-- Description: Remove SSO tables after migration to direct login
-- Date: 2026-02-02
-- Reason: SSO system replaced with direct authentication
-- ⚠️ IMPORTANT: This migration removes SSO infrastructure
-- The system now uses direct login with supabase.auth.signInWithPassword()
-- Backup these tables before running if you need historical data
-- 1. Drop SSO Codes Table (contains sensitive tokens)
DROP TABLE IF EXISTS sso_codes CASCADE;
-- 2. Drop SSO Clients Table (no longer needed)
DROP TABLE IF EXISTS sso_clients CASCADE;
-- 3. Verification: Ensure profiles table still exists and is intact
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'profiles'
) THEN RAISE EXCEPTION 'CRITICAL: profiles table is missing!';
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'profiles'
        AND column_name = 'global_role'
) THEN RAISE EXCEPTION 'CRITICAL: global_role column is missing from profiles!';
END IF;
END $$;
-- 4. Log cleanup
DO $$ BEGIN RAISE NOTICE 'SSO cleanup completed successfully';
RAISE NOTICE 'Removed tables: sso_codes, sso_clients';
RAISE NOTICE 'Authentication now uses direct login';
END $$;