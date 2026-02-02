-- MIGRATION CONSOLIDADA: Hints + Editor Role + Audit Trail
-- Execute este script COMPLETO no SQL Editor do Supabase para atualizar seu banco de production.
-- ============================================
-- PARTE 1: ADICIONAR CAMPOS DE DICA (HINTS)
-- ============================================
ALTER TABLE recipes
ADD COLUMN IF NOT EXISTS hint_en text,
    ADD COLUMN IF NOT EXISTS hint_pt text,
    ADD COLUMN IF NOT EXISTS hint_ru text;
CREATE INDEX IF NOT EXISTS idx_recipes_skill ON recipes(skill);
CREATE INDEX IF NOT EXISTS idx_recipes_container ON recipes(container);
CREATE INDEX IF NOT EXISTS idx_recipes_cooker ON recipes(cooker);
COMMENT ON COLUMN recipes.hint_en IS 'Recipe hint/tip in English';
COMMENT ON COLUMN recipes.hint_pt IS 'Recipe hint/tip in Portuguese';
COMMENT ON COLUMN recipes.hint_ru IS 'Recipe hint/tip in Russian';
-- ============================================
-- PARTE 2: ADICIONAR ROLE 'EDITOR'
-- ============================================
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
END IF;
END $$;
-- ============================================
-- PARTE 3: SISTEMA DE AUDITORIA
-- ============================================
-- 3.1 Tabela de Logs
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
CREATE INDEX IF NOT EXISTS idx_audit_recipe ON recipe_audit_log(recipe_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON recipe_audit_log(changed_by);
CREATE INDEX IF NOT EXISTS idx_audit_created ON recipe_audit_log(created_at DESC);
-- 3.2 Função de Trigger
CREATE OR REPLACE FUNCTION log_recipe_changes() RETURNS TRIGGER AS $$
DECLARE changed_fields jsonb := '{}'::jsonb;
old_vals jsonb := '{}'::jsonb;
new_vals jsonb := '{}'::jsonb;
BEGIN IF TG_OP = 'UPDATE' THEN -- Check Hints
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
-- Check Core Fields
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
ELSIF TG_OP = 'INSERT' THEN
INSERT INTO recipe_audit_log (recipe_id, changed_by, action, new_values)
VALUES (
        NEW.id,
        auth.uid(),
        'create',
        jsonb_build_object('name', NEW.name, 'skill', NEW.skill)
    );
RETURN NEW;
ELSIF TG_OP = 'DELETE' THEN
INSERT INTO recipe_audit_log (recipe_id, changed_by, action, old_values)
VALUES (
        OLD.id,
        auth.uid(),
        'delete',
        jsonb_build_object('name', OLD.name)
    );
RETURN OLD;
END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- 3.3 Aplicar Trigger
DROP TRIGGER IF EXISTS recipe_audit_trigger ON recipes;
CREATE TRIGGER recipe_audit_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON recipes FOR EACH ROW EXECUTE FUNCTION log_recipe_changes();
-- ============================================
-- PARTE 4: ATUALIZAR POLICIES (SEGURANÇA)
-- ============================================
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
-- Limpar policies antigas para recriar
DROP POLICY IF EXISTS "Public can view verified recipes" ON recipes;
DROP POLICY IF EXISTS "Authenticated users can insert recipes" ON recipes;
DROP POLICY IF EXISTS "Admins can update recipes" ON recipes;
DROP POLICY IF EXISTS "Admins can delete recipes" ON recipes;
-- Política de Leitura (Público vê verificados, Admins/Editors veem tudo)
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
-- Política de Inserção (Qualquer autenticado pode sugerir)
CREATE POLICY "Authenticated users can insert recipes" ON recipes FOR
INSERT WITH CHECK (
        auth.uid() IS NOT NULL
        AND status = 'pending'
        AND submitted_by = auth.uid()
    );
-- Política de Atualização (Apenas Admins/Editors)
CREATE POLICY "Admins can update recipes" ON recipes FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE profiles.id = auth.uid()
                AND profiles.global_role IN ('superadmin', 'admin', 'editor')
        )
    );
-- Política de Exclusão (Apenas Admins/Superadmins)
CREATE POLICY "Admins can delete recipes" ON recipes FOR DELETE USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE profiles.id = auth.uid()
            AND profiles.global_role IN ('superadmin', 'admin')
    )
);
-- Segurança da Audit Log
ALTER TABLE recipe_audit_log ENABLE ROW LEVEL SECURITY;
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
-- PARTE 5: VALIDAÇÃO DE DADOS
-- ============================================
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
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'name_not_empty'
) THEN
ALTER TABLE recipes
ADD CONSTRAINT name_not_empty CHECK (length(trim(name)) > 0);
END IF;
END $$;
-- Confirmação Final
SELECT 'MIGRATION COMPLETE' as status;