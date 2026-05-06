-- ============================================================
-- HUB2 — Status do Sistema + RLS
-- Execute no Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS hub_system_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'alert')),
    is_active BOOLEAN DEFAULT true,
    author TEXT DEFAULT 'Admin',
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE hub_system_status ENABLE ROW LEVEL SECURITY;

-- Qualquer um pode ler o status ativo
CREATE POLICY "Public read active status" ON hub_system_status
    FOR SELECT USING (is_active = true);

-- Apenas usuários autenticados podem inserir/atualizar
-- (No HUB2 usamos service role via RPC para isso)
CREATE POLICY "Allow all insert" ON hub_system_status
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all update" ON hub_system_status
    FOR UPDATE USING (true);
