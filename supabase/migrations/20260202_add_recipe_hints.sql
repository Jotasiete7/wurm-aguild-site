-- Migration: 20260202_add_recipe_hints.sql
-- Description: Add multilingual hint columns to recipes table
-- Date: 2026-02-02
-- Reason: Enable translatable recipe tips/hints for better UX
-- 1. Add hint columns for each supported language
ALTER TABLE recipes
ADD COLUMN IF NOT EXISTS hint_en text,
    ADD COLUMN IF NOT EXISTS hint_pt text,
    ADD COLUMN IF NOT EXISTS hint_ru text;
-- 2. Add indexes for better query performance on filter fields
CREATE INDEX IF NOT EXISTS idx_recipes_skill ON recipes(skill);
CREATE INDEX IF NOT EXISTS idx_recipes_container ON recipes(container);
CREATE INDEX IF NOT EXISTS idx_recipes_cooker ON recipes(cooker);
-- 3. Add comments for documentation
COMMENT ON COLUMN recipes.hint_en IS 'Recipe hint/tip in English';
COMMENT ON COLUMN recipes.hint_pt IS 'Recipe hint/tip in Portuguese';
COMMENT ON COLUMN recipes.hint_ru IS 'Recipe hint/tip in Russian';
-- 4. Verification
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'recipes'
        AND column_name = 'hint_en'
) THEN RAISE EXCEPTION 'Failed to add hint_en column!';
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'recipes'
        AND column_name = 'hint_pt'
) THEN RAISE EXCEPTION 'Failed to add hint_pt column!';
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'recipes'
        AND column_name = 'hint_ru'
) THEN RAISE EXCEPTION 'Failed to add hint_ru column!';
END IF;
RAISE NOTICE 'Recipe hints migration completed successfully';
RAISE NOTICE 'Added columns: hint_en, hint_pt, hint_ru';
RAISE NOTICE 'Added indexes: idx_recipes_skill, idx_recipes_container, idx_recipes_cooker';
END $$;