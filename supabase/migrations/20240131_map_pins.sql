-- Migration: 20240131_map_pins.sql
-- Description: Create map_pins table for the Guild Map
create table if not exists map_pins (
    id uuid default gen_random_uuid() primary key,
    x float not null,
    y float not null,
    type text not null,
    -- 'resource', 'infra', 'project', 'poi', 'warning'
    title text not null,
    note text,
    author text not null,
    -- Display name (from AuthContext)
    timestamp bigint not null,
    -- JS Timestamp
    created_at timestamptz default now()
);
-- RLS Policies
alter table map_pins enable row level security;
-- 1. Public Read (All members can see pins)
create policy "Public read map_pins" on map_pins for
select using (true);
-- 2. Authenticated Insert (Members can add pins)
create policy "Authenticated insert map_pins" on map_pins for
insert to authenticated with check (true);
-- 3. Author Delete (Users can delete their own pins)
-- Note: This relies on the 'author' column matching the user's name or ID.
-- Ideally we should use user_id UUID, but the current types.ts uses 'author' string.
-- We will allow delete if the provider (AuthContext) author matches, 
-- BUT since we haven't linked 'author' column to auth.uid() strictly in this legacy table, 
-- we typically trust the app or require a user_id column.
-- For now, let's allow all authenticated to delete (Collaborative map) or restrict to Admins.
-- Let's stick to: Authenticated can insert, Everyone can read. 
-- Deletion might be restricted to Admins for safety.