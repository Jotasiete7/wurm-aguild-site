-- Migration: 20240131_init_sso.sql
-- Description: Initialize SSO tables and update profiles
-- ⚠️ DEPRECATED: This migration is obsolete as of 2026-02-02
-- The SSO system was replaced with direct login authentication
-- Tables created here (sso_clients, sso_codes) are removed in migration 20260202_cleanup_sso_tables.sql
-- 1. Create Enum for User Roles if it doesn't exist
do $$ begin create type user_role as enum ('superadmin', 'admin', 'editor', 'viewer');
exception
when duplicate_object then null;
end $$;
-- 2. Update Profiles Table with global_role
alter table profiles
add column if not exists global_role user_role default 'viewer';
-- 3. Create SSO Clients Table
create table if not exists sso_clients (
    id uuid default gen_random_uuid() primary key,
    client_id text unique not null,
    client_name text not null,
    redirect_uris text [] not null,
    -- Array de URIs permitidas
    is_active boolean default true
);
-- 4. Create SSO Codes Table
create table if not exists sso_codes (
    code text primary key,
    user_id uuid references auth.users not null,
    client_id text references sso_clients(client_id),
    access_token text,
    -- New: Store for handover
    refresh_token text,
    -- New: Store for handover
    expires_at timestamptz not null,
    used boolean default false,
    created_at timestamptz default now()
);
-- 5. Seed Initial Clients (Wurm Recipes)
-- Note: update redirection URIs as needed for production
insert into sso_clients (client_id, client_name, redirect_uris)
values (
        'recipes_tool',
        'Wurm Recipes',
        ARRAY [
    'https://wurm-recipes.pages.dev/auth/callback',
    'http://localhost:5173/auth/callback', -- Vite default
    'http://localhost:3000/auth/callback'
]
    ) on conflict (client_id) do nothing;
-- 6. RLS Policies
alter table sso_clients enable row level security;
-- Allow anyone to read client info (needed for the consent screen)
create policy "Public read clients" on sso_clients for
select using (true);
alter table sso_codes enable row level security;
-- Only the edge function (service_role) needs to write/read codes.
-- But if we want to debug, maybe allow admins. 
-- For now, default deny is fine as Edge Functions bypass RLS with service_role key.