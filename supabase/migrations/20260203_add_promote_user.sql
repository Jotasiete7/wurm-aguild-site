-- Migration: 20260203_add_promote_user.sql
-- Description: Add promote_user RPC function with role mapping and MASTER ADMIN protection
-- Date: 2026-02-03
CREATE OR REPLACE FUNCTION promote_user(target_user_id UUID, new_role TEXT) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE executing_user_role global_role_enum;
executing_user_email TEXT;
target_role_enum global_role_enum;
current_target_role global_role_enum;
BEGIN -- 1. Check if the executing user is a superadmin
SELECT global_role,
    email INTO executing_user_role,
    executing_user_email
FROM profiles
WHERE id = auth.uid();
IF executing_user_role IS NULL
OR executing_user_role != 'superadmin' THEN RAISE EXCEPTION 'Apenas Super Admins podem promover usuários.';
END IF;
-- 2. PROTECTION: Check if target user is ALREADY a Superadmin
-- Prevent a Superadmin from changing the role of another Superadmin
-- EXCEPTION: 'jaimeengelmann@gmail.com' has supreme power (Master Admin)
IF target_user_id != auth.uid() THEN
SELECT global_role INTO current_target_role
FROM profiles
WHERE id = target_user_id;
IF current_target_role = 'superadmin' THEN -- Only allow if the executing user is strictly the Master Admin
IF executing_user_email != 'jaimeengelmann@gmail.com' THEN RAISE EXCEPTION 'Não é permitido alterar o cargo de outro Super Admin.';
END IF;
END IF;
END IF;
-- 3. Map the input role string to the correct enum value
IF new_role = 'member' THEN target_role_enum := 'viewer';
ELSIF new_role = 'admin' THEN target_role_enum := 'admin';
ELSIF new_role = 'superadmin' THEN target_role_enum := 'superadmin';
ELSIF new_role = 'editor' THEN target_role_enum := 'editor';
ELSE -- Helper to allow passing 'viewer' directly
IF new_role = 'viewer' THEN target_role_enum := 'viewer';
ELSE RAISE EXCEPTION 'Cargo inválido: %',
new_role;
END IF;
END IF;
-- 4. Update the target user's role
UPDATE profiles
SET global_role = target_role_enum
WHERE id = target_user_id;
-- Check if update happened
IF NOT FOUND THEN RAISE EXCEPTION 'Usuário alvo não encontrado.';
END IF;
END;
$$;