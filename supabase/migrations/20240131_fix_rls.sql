-- Migration: 20240131_fix_rls.sql
-- Description: Allow public read access to 'legacy_verified' recipes
-- 1. Drop the old restrictive policy
DROP POLICY IF EXISTS "Public read verified recipes" ON recipes;
-- 2. Create new inclusive policy
-- Allows reading if status is 'verified' OR 'legacy_verified'
CREATE POLICY "Public read verified recipes" ON recipes FOR
SELECT USING (status IN ('verified', 'legacy_verified'));