-- Migration: 20240131_fix_difficulty.sql
-- Description: Ensure difficulty column exists (was missing in some setups)
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'recipes'
        AND column_name = 'difficulty'
) THEN
ALTER TABLE recipes
ADD COLUMN difficulty int;
END IF;
END $$;