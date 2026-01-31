-- Migration: 20240131_migration_schema.sql
-- Description: Add columns for Legacy Recipe Migration (Strict Governance)
-- 1. Add legacy_key for strict idempotency and traceability
-- This key will store the SHA256 hash of the original legacy content
ALTER TABLE recipes
ADD COLUMN IF NOT EXISTS legacy_key text UNIQUE;
-- 2. Add source column to distinguish legacy imports from user submissions
ALTER TABLE recipes
ADD COLUMN IF NOT EXISTS source text DEFAULT 'user';
-- 3. Update Status Check Constraint to allow 'legacy_verified'
-- First, drop the old constraint if it exists (Supabase/Postgres specific)
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'recipes_status_check'
) THEN
ALTER TABLE recipes DROP CONSTRAINT recipes_status_check;
END IF;
END $$;
-- Re-add constraint with new value
ALTER TABLE recipes
ADD CONSTRAINT recipes_status_check CHECK (
        status IN (
            'pending',
            'verified',
            'rejected',
            'legacy_verified',
            'approved',
            'draft'
        )
    );
-- 4. Create Index for faster lookups (optional but good for migration script)
CREATE INDEX IF NOT EXISTS idx_recipes_legacy_key ON recipes(legacy_key);