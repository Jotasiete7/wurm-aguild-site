-- ============================================================
-- ECOSSISTEMA A GUILDA — MASTER SCHEMA PORTAL V2
-- Execute este script no SQL Editor do seu Supabase Dashboard
-- Este script é 100% idempotente (pode ser executado várias vezes).
-- ============================================================

-- 1. STATUS DO SISTEMA
CREATE TABLE IF NOT EXISTS hub_system_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'alert')),
    is_active BOOLEAN DEFAULT true,
    author TEXT DEFAULT 'Admin',
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE hub_system_status ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active status" ON hub_system_status;
DROP POLICY IF EXISTS "Allow all insert status" ON hub_system_status;
DROP POLICY IF EXISTS "Allow all update status" ON hub_system_status;

CREATE POLICY "Public read active status" ON hub_system_status
    FOR SELECT USING (is_active = true);

CREATE POLICY "Allow all insert status" ON hub_system_status
    FOR INSERT TO authenticated WITH CHECK (auth.jwt() ->> 'email' IN ('jaimeengelmann@gmail.com', 'rafaelcalvetti@gmail.com'));

CREATE POLICY "Allow all update status" ON hub_system_status
    FOR UPDATE TO authenticated USING (auth.jwt() ->> 'email' IN ('jaimeengelmann@gmail.com', 'rafaelcalvetti@gmail.com'));


-- 2. FRASES DO DIA (QUOTES)
CREATE TABLE IF NOT EXISTS hub_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    text_pt TEXT NOT NULL,
    text_en TEXT,
    author TEXT DEFAULT 'A Guilda',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE hub_quotes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active quotes" ON hub_quotes;
DROP POLICY IF EXISTS "Allow insert quotes" ON hub_quotes;
DROP POLICY IF EXISTS "Allow update quotes" ON hub_quotes;
DROP POLICY IF EXISTS "Allow delete quotes" ON hub_quotes;

CREATE POLICY "Public read active quotes" ON hub_quotes
    FOR SELECT USING (is_active = true);

CREATE POLICY "Allow insert quotes" ON hub_quotes
    FOR INSERT TO authenticated WITH CHECK (auth.jwt() ->> 'email' IN ('jaimeengelmann@gmail.com', 'rafaelcalvetti@gmail.com'));

CREATE POLICY "Allow update quotes" ON hub_quotes
    FOR UPDATE TO authenticated USING (auth.jwt() ->> 'email' IN ('jaimeengelmann@gmail.com', 'rafaelcalvetti@gmail.com'));

CREATE POLICY "Allow delete quotes" ON hub_quotes
    FOR DELETE TO authenticated USING (auth.jwt() ->> 'email' IN ('jaimeengelmann@gmail.com', 'rafaelcalvetti@gmail.com'));

-- Seed de Frases Iniciais
INSERT INTO hub_quotes (text_pt, text_en, author) VALUES
    ('A Guilda não é um grupo — é uma cultura.', 'The Guild is not a group — it is a culture.', 'A Guilda'),
    ('Todo recurso é compartilhado. Toda vitória é coletiva.', 'Every resource is shared. Every victory is collective.', 'Codex da Guilda'),
    ('Construímos devagar. Construímos para durar.', 'We build slowly. We build to last.', 'Jotasiete'),
    ('O mapa não é o território — explore com cuidado.', 'The map is not the territory — explore carefully.', 'Provérbio Wurm')
ON CONFLICT DO NOTHING;


-- 3. ECOSYSTEM FEED (PULSO DO ECOSSISTEMA)
CREATE TABLE IF NOT EXISTS hub_feed (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('update', 'event', 'alert', 'article', 'maintenance', 'badge')),
    title_pt TEXT NOT NULL,
    title_en TEXT,
    description_pt TEXT NOT NULL,
    description_en TEXT,
    link TEXT,
    post_date TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE hub_feed ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active feed" ON hub_feed;
DROP POLICY IF EXISTS "Allow insert feed" ON hub_feed;
DROP POLICY IF EXISTS "Allow update feed" ON hub_feed;

CREATE POLICY "Public read active feed" ON hub_feed
    FOR SELECT USING (is_active = true);

CREATE POLICY "Allow insert feed" ON hub_feed
    FOR INSERT TO authenticated WITH CHECK (auth.jwt() ->> 'email' IN ('jaimeengelmann@gmail.com', 'rafaelcalvetti@gmail.com'));

CREATE POLICY "Allow update feed" ON hub_feed
    FOR UPDATE TO authenticated USING (auth.jwt() ->> 'email' IN ('jaimeengelmann@gmail.com', 'rafaelcalvetti@gmail.com'));


-- 4. HUB SETTINGS (CONFIGURAÇÕES DINÂMICAS DOS CARDS)
CREATE TABLE IF NOT EXISTS hub_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE hub_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read settings" ON hub_settings;
DROP POLICY IF EXISTS "Allow upsert settings" ON hub_settings;
DROP POLICY IF EXISTS "Allow update settings" ON hub_settings;

CREATE POLICY "Public read settings" ON hub_settings
    FOR SELECT USING (true);

CREATE POLICY "Allow upsert settings" ON hub_settings
    FOR INSERT TO authenticated WITH CHECK (auth.jwt() ->> 'email' IN ('jaimeengelmann@gmail.com', 'rafaelcalvetti@gmail.com'));

CREATE POLICY "Allow update settings" ON hub_settings
    FOR UPDATE TO authenticated USING (auth.jwt() ->> 'email' IN ('jaimeengelmann@gmail.com', 'rafaelcalvetti@gmail.com'));

-- Seed de Configurações Iniciais da Galeria
INSERT INTO hub_settings (key, value) VALUES
    ('gallery_card_title_pt', 'Fotografia de Deeds'),
    ('gallery_card_title_en', 'Deed Photography'),
    ('gallery_card_subtitle_pt', 'Concurso da Comunidade'),
    ('gallery_card_subtitle_en', 'Community Contest')
ON CONFLICT DO NOTHING;


-- 5. ENQUETES (POLLS)
CREATE TABLE IF NOT EXISTS hub_polls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_pt TEXT NOT NULL,
    question_en TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hub_poll_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID REFERENCES hub_polls(id) ON DELETE CASCADE,
    label_pt TEXT NOT NULL,
    label_en TEXT NOT NULL,
    sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS hub_poll_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID REFERENCES hub_polls(id) ON DELETE CASCADE,
    option_id UUID REFERENCES hub_poll_options(id) ON DELETE CASCADE,
    ip_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(poll_id, ip_hash)
);

ALTER TABLE hub_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_poll_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active polls" ON hub_polls;
DROP POLICY IF EXISTS "Public read poll options" ON hub_poll_options;
DROP POLICY IF EXISTS "Public read votes" ON hub_poll_votes;
DROP POLICY IF EXISTS "Public insert votes" ON hub_poll_votes;
DROP POLICY IF EXISTS "Allow insert polls" ON hub_polls;
DROP POLICY IF EXISTS "Allow insert options" ON hub_poll_options;

CREATE POLICY "Public read active polls" ON hub_polls FOR SELECT USING (is_active = true);
CREATE POLICY "Public read poll options" ON hub_poll_options FOR SELECT USING (true);
CREATE POLICY "Public read votes" ON hub_poll_votes FOR SELECT USING (true);
CREATE POLICY "Public insert votes" ON hub_poll_votes FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow insert polls" ON hub_polls FOR INSERT TO authenticated WITH CHECK (auth.jwt() ->> 'email' IN ('jaimeengelmann@gmail.com', 'rafaelcalvetti@gmail.com'));
CREATE POLICY "Allow insert options" ON hub_poll_options FOR INSERT TO authenticated WITH CHECK (auth.jwt() ->> 'email' IN ('jaimeengelmann@gmail.com', 'rafaelcalvetti@gmail.com'));


-- 6. GALERIA DE FOTOS (PHOTOS)
CREATE TABLE IF NOT EXISTS hub_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT NOT NULL,
    title TEXT,
    author_name TEXT,
    deed_name TEXT,
    event_tag TEXT DEFAULT 'Concurso 2026',
    votes INT DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hub_photo_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    photo_id UUID REFERENCES hub_photos(id) ON DELETE CASCADE,
    ip_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(photo_id, ip_hash)
);

ALTER TABLE hub_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_photo_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read visible photos" ON hub_photos;
DROP POLICY IF EXISTS "Public insert photo votes" ON hub_photo_votes;
DROP POLICY IF EXISTS "Public read photo votes" ON hub_photo_votes;
DROP POLICY IF EXISTS "Allow insert photos" ON hub_photos;

CREATE POLICY "Public read visible photos" ON hub_photos FOR SELECT USING (is_visible = true);
CREATE POLICY "Public insert photo votes" ON hub_photo_votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read photo votes" ON hub_photo_votes FOR SELECT USING (true);

CREATE POLICY "Allow insert photos" ON hub_photos FOR INSERT TO authenticated WITH CHECK (auth.jwt() ->> 'email' IN ('jaimeengelmann@gmail.com', 'rafaelcalvetti@gmail.com'));


-- 7. FUNÇÕES RPC (VOTAÇÃO SEGURA)
DROP FUNCTION IF EXISTS vote_photo(UUID, TEXT);
DROP FUNCTION IF EXISTS vote_poll(UUID, UUID, TEXT);

CREATE OR REPLACE FUNCTION vote_photo(p_photo_id UUID, p_ip_hash TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO hub_photo_votes (photo_id, ip_hash) VALUES (p_photo_id, p_ip_hash);
    UPDATE hub_photos SET votes = votes + 1 WHERE id = p_photo_id;
    RETURN jsonb_build_object('success', true);
EXCEPTION WHEN unique_violation THEN
    RETURN jsonb_build_object('success', false, 'reason', 'already_voted');
END;
$$;

CREATE OR REPLACE FUNCTION vote_poll(p_poll_id UUID, p_option_id UUID, p_ip_hash TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO hub_poll_votes (poll_id, option_id, ip_hash)
    VALUES (p_poll_id, p_option_id, p_ip_hash);
    RETURN jsonb_build_object('success', true);
EXCEPTION WHEN unique_violation THEN
    RETURN jsonb_build_object('success', false, 'reason', 'already_voted');
END;
$$;


-- 8. POLÍTICAS DE SEGURANÇA PARA A TABELA RESOURCES (LINKS ÚTEIS)
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read resources" ON resources;
DROP POLICY IF EXISTS "Allow insert resources" ON resources;
DROP POLICY IF EXISTS "Allow delete resources" ON resources;
DROP POLICY IF EXISTS "Allow update resources" ON resources;

CREATE POLICY "Public read resources" ON resources FOR SELECT USING (true);
CREATE POLICY "Allow insert resources" ON resources FOR INSERT TO authenticated WITH CHECK (auth.jwt() ->> 'email' IN ('jaimeengelmann@gmail.com', 'rafaelcalvetti@gmail.com'));
CREATE POLICY "Allow delete resources" ON resources FOR DELETE TO authenticated USING (auth.jwt() ->> 'email' IN ('jaimeengelmann@gmail.com', 'rafaelcalvetti@gmail.com'));
CREATE POLICY "Allow update resources" ON resources FOR UPDATE TO authenticated USING (auth.jwt() ->> 'email' IN ('jaimeengelmann@gmail.com', 'rafaelcalvetti@gmail.com'));
