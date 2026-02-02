-- Migration: 20260202_add_audit_trail.sql
-- Description: Add comprehensive audit trail and data protection
-- Date: 2026-02-02
-- Reason: Track all recipe changes and protect data integrity
-- ============================================
-- 1. AUDIT LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS recipe_audit_log (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    recipe_id uuid REFERENCES recipes(id) ON DELETE CASCADE,
    changed_by uuid REFERENCES auth.users(id),
    action text NOT NULL CHECK (action IN ('create', 'update', 'delete')),
    changed_fields jsonb,
    old_values jsonb,
    new_values jsonb,
    created_at timestamptz DEFAULT now()
);
-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_audit_recipe ON recipe_audit_log(recipe_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON recipe_audit_log(changed_by);
CREATE INDEX IF NOT EXISTS idx_audit_created ON recipe_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_action ON recipe_audit_log(action);
-- Comentários
COMMENT ON TABLE recipe_audit_log IS 'Audit trail for all recipe changes';
COMMENT ON COLUMN recipe_audit_log.changed_fields IS 'JSON object with field names that changed';
COMMENT ON COLUMN recipe_audit_log.old_values IS 'Previous values before change';
COMMENT ON COLUMN recipe_audit_log.new_values IS 'New values after change';
-- ============================================
-- 2. AUDIT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION log_recipe_changes() RETURNS TRIGGER AS $$
DECLARE changed_fields jsonb := '{}'::jsonb;
old_vals jsonb := '{}'::jsonb;
new_vals jsonb := '{}'::jsonb;
BEGIN -- UPDATE: Track specific field changes
IF TG_OP = 'UPDATE' THEN -- Hints
IF OLD.hint_en IS DISTINCT
FROM NEW.hint_en THEN changed_fields := changed_fields || '{"hint_en": true}'::jsonb;
old_vals := old_vals || jsonb_build_object('hint_en', OLD.hint_en);
new_vals := new_vals || jsonb_build_object('hint_en', NEW.hint_en);
END IF;
IF OLD.hint_pt IS DISTINCT
FROM NEW.hint_pt THEN changed_fields := changed_fields || '{"hint_pt": true}'::jsonb;
old_vals := old_vals || jsonb_build_object('hint_pt', OLD.hint_pt);
new_vals := new_vals || jsonb_build_object('hint_pt', NEW.hint_pt);
END IF;
IF OLD.hint_ru IS DISTINCT
FROM NEW.hint_ru THEN changed_fields := changed_fields || '{"hint_ru": true}'::jsonb;
old_vals := old_vals || jsonb_build_object('hint_ru', OLD.hint_ru);
new_vals := new_vals || jsonb_build_object('hint_ru', NEW.hint_ru);
END IF;
-- Core fields
IF OLD.name IS DISTINCT
FROM NEW.name THEN changed_fields := changed_fields || '{"name": true}'::jsonb;
old_vals := old_vals || jsonb_build_object('name', OLD.name);
new_vals := new_vals || jsonb_build_object('name', NEW.name);
END IF;
IF OLD.mandatory IS DISTINCT
FROM NEW.mandatory THEN changed_fields := changed_fields || '{"mandatory": true}'::jsonb;
old_vals := old_vals || jsonb_build_object('mandatory', OLD.mandatory);
new_vals := new_vals || jsonb_build_object('mandatory', NEW.mandatory);
END IF;
IF OLD.skill IS DISTINCT
FROM NEW.skill THEN changed_fields := changed_fields || '{"skill": true}'::jsonb;
old_vals := old_vals || jsonb_build_object('skill', OLD.skill);
new_vals := new_vals || jsonb_build_object('skill', NEW.skill);
END IF;
IF OLD.container IS DISTINCT
FROM NEW.container THEN changed_fields := changed_fields || '{"container": true}'::jsonb;
old_vals := old_vals || jsonb_build_object('container', OLD.container);
new_vals := new_vals || jsonb_build_object('container', NEW.container);
END IF;
IF OLD.cooker IS DISTINCT
FROM NEW.cooker THEN changed_fields := changed_fields || '{"cooker": true}'::jsonb;
old_vals := old_vals || jsonb_build_object('cooker', OLD.cooker);
new_vals := new_vals || jsonb_build_object('cooker', NEW.cooker);
END IF;
IF OLD.status IS DISTINCT
FROM NEW.status THEN changed_fields := changed_fields || '{"status": true}'::jsonb;
old_vals := old_vals || jsonb_build_object('status', OLD.status);
new_vals := new_vals || jsonb_build_object('status', NEW.status);
END IF;
-- Only log if there were actual changes
IF changed_fields != '{}'::jsonb THEN
INSERT INTO recipe_audit_log (
        recipe_id,
        changed_by,
        action,
        changed_fields,
        old_values,
        new_values
    )
VALUES (
        NEW.id,
        auth.uid(),
        'update',
        changed_fields,
        old_vals,
        new_vals
    );
END IF;
RETURN NEW;
-- INSERT: Log creation
ELSIF TG_OP = 'INSERT' THEN
INSERT INTO recipe_audit_log (
        recipe_id,
        changed_by,
        action,
        new_values
    )
VALUES (
        NEW.id,
        auth.uid(),
        'create',
        jsonb_build_object(
            'name',
            NEW.name,
            'skill',
            NEW.skill,
            'container',
            NEW.container,
            'cooker',
            NEW.cooker,
            'mandatory',
            NEW.mandatory,
            'status',
            NEW.status
        )
    );
RETURN NEW;
-- DELETE: Log deletion
ELSIF TG_OP = 'DELETE' THEN
INSERT INTO recipe_audit_log (
        recipe_id,
        changed_by,
        action,
        old_values
    )
VALUES (
        OLD.id,
        auth.uid(),
        'delete',
        jsonb_build_object(
            'name',
            OLD.name,
            'skill',
            OLD.skill,
            'container',
            OLD.container,
            'cooker',
            OLD.cooker,
            'mandatory',
            OLD.mandatory,
            'status',
            OLD.status
        )
    );
RETURN OLD;
END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Create trigger
DROP TRIGGER IF EXISTS recipe_audit_trigger ON recipes;
CREATE TRIGGER recipe_audit_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON recipes FOR EACH ROW EXECUTE FUNCTION log_recipe_changes();
-- ============================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- Enable RLS on recipes table
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view verified recipes" ON recipes;
DROP POLICY IF EXISTS "Authenticated users can insert recipes" ON recipes;
DROP POLICY IF EXISTS "Admins can update recipes" ON recipes;
DROP POLICY IF EXISTS "Admins can delete recipes" ON recipes;
-- SELECT: Everyone can view verified recipes
CREATE POLICY "Public can view verified recipes" ON recipes FOR
SELECT USING (
        status IN ('verified', 'legacy_verified')
        OR auth.uid() = submitted_by
        OR EXISTS (
            SELECT 1
            FROM profiles
            WHERE profiles.id = auth.uid()
                AND profiles.global_role IN ('superadmin', 'admin', 'editor')
        )
    );
-- INSERT: Authenticated users can submit (status must be pending)
CREATE POLICY "Authenticated users can insert recipes" ON recipes FOR
INSERT WITH CHECK (
        auth.uid() IS NOT NULL
        AND status = 'pending'
        AND submitted_by = auth.uid()
    );
-- UPDATE: Only admins/editors can update
CREATE POLICY "Admins can update recipes" ON recipes FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE profiles.id = auth.uid()
                AND profiles.global_role IN ('superadmin', 'admin', 'editor')
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE profiles.id = auth.uid()
                AND profiles.global_role IN ('superadmin', 'admin', 'editor')
        )
    );
-- DELETE: Only superadmin/admin can delete
CREATE POLICY "Admins can delete recipes" ON recipes FOR DELETE USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE profiles.id = auth.uid()
            AND profiles.global_role IN ('superadmin', 'admin')
    )
);
-- Enable RLS on audit log
ALTER TABLE recipe_audit_log ENABLE ROW LEVEL SECURITY;
-- Only admins can view audit log
CREATE POLICY "Admins can view audit log" ON recipe_audit_log FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE profiles.id = auth.uid()
                AND profiles.global_role IN ('superadmin', 'admin', 'editor')
        )
    );
-- ============================================
-- 4. DATA VALIDATION CONSTRAINTS
-- ============================================
-- Valid status values
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'valid_status'
) THEN
ALTER TABLE recipes
ADD CONSTRAINT valid_status CHECK (
        status IN (
            'pending',
            'verified',
            'rejected',
            'legacy_verified'
        )
    );
END IF;
END $$;
-- Name cannot be empty
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'name_not_empty'
) THEN
ALTER TABLE recipes
ADD CONSTRAINT name_not_empty CHECK (length(trim(name)) > 0);
END IF;
END $$;
-- ============================================
-- 5. VERIFICATION
-- ============================================
DO $$ BEGIN -- Check audit table exists
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'recipe_audit_log'
) THEN RAISE EXCEPTION 'CRITICAL: recipe_audit_log table was not created!';
END IF;
-- Check trigger exists
IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'recipe_audit_trigger'
) THEN RAISE EXCEPTION 'CRITICAL: recipe_audit_trigger was not created!';
END IF;
RAISE NOTICE '✅ Audit trail system installed successfully';
RAISE NOTICE '✅ RLS policies configured';
RAISE NOTICE '✅ Data validation constraints added';
RAISE NOTICE '✅ Automatic change tracking enabled';
END $$;