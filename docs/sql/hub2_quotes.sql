-- ============================================================
-- HUB2 — Quote do Dia
-- Execute no Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS hub_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    text_pt TEXT NOT NULL,
    text_en TEXT,
    author TEXT DEFAULT 'A Guilda',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE hub_quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active quotes" ON hub_quotes
    FOR SELECT USING (is_active = true);

CREATE POLICY "Allow insert quotes" ON hub_quotes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update quotes" ON hub_quotes
    FOR UPDATE USING (true);

-- Seed com algumas frases iniciais
INSERT INTO hub_quotes (text_pt, text_en, author) VALUES
    ('A Guilda não é um grupo — é uma cultura.', 'The Guild is not a group — it is a culture.', 'A Guilda'),
    ('Todo recurso é compartilhado. Toda vitória é coletiva.', 'Every resource is shared. Every victory is collective.', 'Codex da Guilda'),
    ('Construímos devagar. Construímos para durar.', 'We build slowly. We build to last.', 'Jotasiete'),
    ('O mapa não é o território — explore com cuidado.', 'The map is not the territory — explore carefully.', 'Provérbio Wurm');
