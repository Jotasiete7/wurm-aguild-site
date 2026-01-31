-- Migration: 20240131_migration_schema.sql
-- Description: Add columns for Legacy Recipe Migration (Strict Governance + Enum)
-- 1. Add legacy_key for strict idempotency and traceability
-- This key will store the SHA256 hash of the original legacy content
ALTER TABLE recipes
ADD COLUMN IF NOT EXISTS legacy_key text UNIQUE;
-- 2. Create ENUM for strict source governance
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'recipe_source'
) THEN CREATE TYPE recipe_source AS ENUM ('legacy', 'user');
END IF;
END $$;
-- 3. Add source column using the new ENUM
ALTER TABLE recipes
ADD COLUMN IF NOT EXISTS source recipe_source DEFAULT 'user';
-- 4. Update Status Check Constraint to allow 'legacy_verified'
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
-- 5. Create Index for faster lookups on legacy_key
CREATE INDEX IF NOT EXISTS idx_recipes_legacy_key ON recipes(legacy_key);