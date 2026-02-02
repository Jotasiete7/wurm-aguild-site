-- Add root URL to allowed redirect URIs on the Hub
-- Execute this on the 'wurm-guild' Supabase project (Hub)
-- ⚠️ DEPRECATED: This migration is obsolete as of 2026-02-02
-- The SSO system was replaced with direct login authentication
-- Tables modified here (sso_clients) are removed in migration 20260202_cleanup_sso_tables.sql
update sso_clients
set redirect_uris = array_append(redirect_uris, 'https://wurm-recipes.pages.dev')
where client_id = 'recipes_tool'
    and not (
        'https://wurm-recipes.pages.dev' = any(redirect_uris)
    );
update sso_clients
set redirect_uris = array_append(redirect_uris, 'https://wurm-recipes.pages.dev/')
where client_id = 'recipes_tool'
    and not (
        'https://wurm-recipes.pages.dev/' = any(redirect_uris)
    );