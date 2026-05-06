-- ============================================================
-- HUB2 — Tabelas da Fase 2
-- Execute no Supabase SQL Editor
-- ============================================================

-- ── ENQUETES ────────────────────────────────────────────────
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

-- RLS
ALTER TABLE hub_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_poll_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active polls" ON hub_polls FOR SELECT USING (is_active = true);
CREATE POLICY "Public read poll options" ON hub_poll_options FOR SELECT USING (true);
CREATE POLICY "Public read votes" ON hub_poll_votes FOR SELECT USING (true);
CREATE POLICY "Public insert votes" ON hub_poll_votes FOR INSERT WITH CHECK (true);

-- ── GALERIA DE FOTOS ────────────────────────────────────────
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

-- RLS
ALTER TABLE hub_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_photo_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read visible photos" ON hub_photos FOR SELECT USING (is_visible = true);
CREATE POLICY "Public insert photo votes" ON hub_photo_votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read photo votes" ON hub_photo_votes FOR SELECT USING (true);

-- ── RPC: votar em foto (atômico + dedup por IP) ─────────────
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

-- ── RPC: votar em enquete (atômico + dedup por IP) ──────────
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
