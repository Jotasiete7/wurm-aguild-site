-- ============================================
-- CORREÇÃO DEFINITIVA SSO - Recipes Tool
-- ============================================
-- ⚠️ DEPRECATED: This migration is obsolete as of 2026-02-02
-- The SSO system was replaced with direct login authentication
-- Tables modified here (sso_clients) are removed in migration 20260202_cleanup_sso_tables.sql
-- Execute este SQL no Supabase SQL Editor do projeto Hub
-- Project: gzhvqprdrtudyokhgxlj
-- 1. Limpar configuração antiga
DELETE FROM sso_clients
WHERE client_id = 'recipes_tool';
-- 2. Inserir configuração correta
INSERT INTO sso_clients (client_id, client_name, redirect_uris, is_active)
VALUES (
        'recipes_tool',
        'Wurm Recipes',
        ARRAY [
        'https://wurm-recipe-tool.pages.dev',
        'https://wurm-recipe-tool.pages.dev/',
        'http://localhost:5173',
        'http://localhost:5173/'
    ],
        true
    );
-- 3. Verificar
SELECT client_id,
    client_name,
    redirect_uris,
    is_active
FROM sso_clients
WHERE client_id = 'recipes_tool';