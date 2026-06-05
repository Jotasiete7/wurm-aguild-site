-- ============================================================
-- ECOSSISTEMA A GUILDA — DINAMIZAÇÃO DE ADMINISTRADORES
-- Execute este script no SQL Editor do seu Supabase Dashboard
-- ============================================================

-- 1. Criar tabela de administradores
CREATE TABLE IF NOT EXISTS hub_admins (
    email TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Ativar RLS (Row Level Security)
ALTER TABLE hub_admins ENABLE ROW LEVEL SECURITY;

-- Permitir que qualquer usuário autenticado consulte a tabela para validar seu próprio e-mail
CREATE POLICY "Allow authenticated read admins" ON hub_admins
    FOR SELECT TO authenticated USING (true);

-- Permitir que apenas administradores cadastrem novos administradores
CREATE POLICY "Allow admin manage admins" ON hub_admins
    FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM hub_admins WHERE email = auth.jwt() ->> 'email'));

-- Seed inicial de administradores
INSERT INTO hub_admins (email) VALUES
    ('jaimeengelmann@gmail.com'),
    ('rafaelcalvetti@gmail.com')
ON CONFLICT DO NOTHING;


-- 2. Atualizar políticas RLS das tabelas existentes para usar a nova tabela dinâmica

-- 2.1 STATUS DO SISTEMA
DROP POLICY IF EXISTS "Allow all insert status" ON hub_system_status;
DROP POLICY IF EXISTS "Allow all update status" ON hub_system_status;

CREATE POLICY "Allow all insert status" ON hub_system_status
    FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM hub_admins WHERE email = auth.jwt() ->> 'email'));

CREATE POLICY "Allow all update status" ON hub_system_status
    FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM hub_admins WHERE email = auth.jwt() ->> 'email'));


-- 2.2 FRASES DO DIA (QUOTES)
DROP POLICY IF EXISTS "Allow insert quotes" ON hub_quotes;
DROP POLICY IF EXISTS "Allow update quotes" ON hub_quotes;
DROP POLICY IF EXISTS "Allow delete quotes" ON hub_quotes;

CREATE POLICY "Allow insert quotes" ON hub_quotes
    FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM hub_admins WHERE email = auth.jwt() ->> 'email'));

CREATE POLICY "Allow update quotes" ON hub_quotes
    FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM hub_admins WHERE email = auth.jwt() ->> 'email'));

CREATE POLICY "Allow delete quotes" ON hub_quotes
    FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM hub_admins WHERE email = auth.jwt() ->> 'email'));


-- 2.3 ECOSYSTEM FEED (PULSO DO ECOSSISTEMA)
DROP POLICY IF EXISTS "Allow insert feed" ON hub_feed;
DROP POLICY IF EXISTS "Allow update feed" ON hub_feed;

CREATE POLICY "Allow insert feed" ON hub_feed
    FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM hub_admins WHERE email = auth.jwt() ->> 'email'));

CREATE POLICY "Allow update feed" ON hub_feed
    FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM hub_admins WHERE email = auth.jwt() ->> 'email'));


-- 2.4 HUB SETTINGS (CONFIGURAÇÕES DINÂMICAS DOS CARDS)
DROP POLICY IF EXISTS "Allow upsert settings" ON hub_settings;
DROP POLICY IF EXISTS "Allow update settings" ON hub_settings;

CREATE POLICY "Allow upsert settings" ON hub_settings
    FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM hub_admins WHERE email = auth.jwt() ->> 'email'));

CREATE POLICY "Allow update settings" ON hub_settings
    FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM hub_admins WHERE email = auth.jwt() ->> 'email'));


-- 2.5 ENQUETES (POLLS)
DROP POLICY IF EXISTS "Allow insert polls" ON hub_polls;
DROP POLICY IF EXISTS "Allow insert options" ON hub_poll_options;

CREATE POLICY "Allow insert polls" ON hub_polls
    FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM hub_admins WHERE email = auth.jwt() ->> 'email'));

CREATE POLICY "Allow insert options" ON hub_poll_options
    FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM hub_admins WHERE email = auth.jwt() ->> 'email'));


-- 2.6 GALERIA DE FOTOS (PHOTOS)
DROP POLICY IF EXISTS "Allow insert photos" ON hub_photos;

CREATE POLICY "Allow insert photos" ON hub_photos
    FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM hub_admins WHERE email = auth.jwt() ->> 'email'));


-- 2.7 RESOURCES (LINKS ÚTEIS)
DROP POLICY IF EXISTS "Allow insert resources" ON resources;
DROP POLICY IF EXISTS "Allow delete resources" ON resources;
DROP POLICY IF EXISTS "Allow update resources" ON resources;

CREATE POLICY "Allow insert resources" ON resources
    FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM hub_admins WHERE email = auth.jwt() ->> 'email'));

CREATE POLICY "Allow delete resources" ON resources
    FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM hub_admins WHERE email = auth.jwt() ->> 'email'));

CREATE POLICY "Allow update resources" ON resources
    FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM hub_admins WHERE email = auth.jwt() ->> 'email'));
