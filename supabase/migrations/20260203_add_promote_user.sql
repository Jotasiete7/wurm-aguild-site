-- Migration: 20260203_add_promote_user.sql
-- Description: Add promote_user RPC function with role mapping
-- Date: 2026-02-03
CREATE OR REPLACE FUNCTION promote_user(target_user_id UUID, new_role TEXT) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE executing_user_role user_role;
target_role_enum user_role;
BEGIN -- 1. Check if the executing user is a superadmin
SELECT global_role INTO executing_user_role
FROM profiles
WHERE id = auth.uid();
IF executing_user_role IS NULL
OR executing_user_role != 'superadmin' THEN RAISE EXCEPTION 'Apenas Super Admins podem promover usuários.';
END IF;
-- 2. Map the input role string to the correct enum value
-- Frontend uses 'member', Database uses 'viewer'
-- 'admin' and 'superadmin' are consistent
IF new_role = 'member' THEN target_role_enum := 'viewer';
ELSIF new_role = 'admin' THEN target_role_enum := 'admin';
ELSIF new_role = 'superadmin' THEN target_role_enum := 'superadmin';
ELSIF new_role = 'editor' THEN target_role_enum := 'editor';
ELSE -- Helper to allow passing 'viewer' directly if frontend changes
IF new_role = 'viewer' THEN target_role_enum := 'viewer';
ELSE RAISE EXCEPTION 'Cargo inválido: %',
new_role;
END IF;
END IF;
-- 3. Update the target user's role
UPDATE profiles
SET global_role = target_role_enum
WHERE id = target_user_id;
-- Check if update happened
IF NOT FOUND THEN RAISE EXCEPTION 'Usuário alvo não encontrado.';
END IF;
END;
$$;