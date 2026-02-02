-- Migration: 20260202_add_editor_role.sql
-- Description: Add 'editor' role to global_role_enum
-- Date: 2026-02-02
-- Reason: Enable editor role for recipe management
-- Add 'editor' to the enum if it doesn't exist
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_enum
    WHERE enumlabel = 'editor'
        AND enumtypid = (
            SELECT oid
            FROM pg_type
            WHERE typname = 'global_role_enum'
        )
) THEN ALTER TYPE global_role_enum
ADD VALUE 'editor';
RAISE NOTICE '✅ Added "editor" to global_role_enum';
ELSE RAISE NOTICE 'ℹ️  "editor" already exists in global_role_enum';
END IF;
END $$;
-- Verification
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_enum
    WHERE enumlabel = 'editor'
        AND enumtypid = (
            SELECT oid
            FROM pg_type
            WHERE typname = 'global_role_enum'
        )
) THEN RAISE EXCEPTION 'CRITICAL: Failed to add "editor" to global_role_enum';
END IF;
RAISE NOTICE '✅ Editor role is ready to use';
END $$;