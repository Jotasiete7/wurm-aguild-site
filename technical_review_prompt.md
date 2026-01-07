# Projeto: Wurm Guild Site (A Guilda)

**Objetivo:** Uma aplicação web leve para gestão interna de uma guilda do jogo Wurm Online. Foca em compartilhamento de recursos (Mural de Serviços) e mapeamento colaborativo (Mapa Especial).

## Tech Stack
- **Frontend:** React (Vite), TypeScript, CSS Modules (Vanilla/Glassmorphism design).
- **Backend/DB:** Supabase (PostgreSQL + Realtime).
- **Hosting:** Netlify (CI/CD via GitHub).
- **Gerenciamento de Estado:** `useState` + React Context (`AuthContext`).

## Arquitetura e Decisões Chave
1.  **Autenticação Simplificada (`AuthContext.tsx`):**
    -   Não usa o Auth do Supabase oficial para evitar fricção de cadastro de email.
    -   Usa um sistema "Mock" com usuários e senhas hardcoded (`jotasiete`, `calvos`) no código cliente, persistindo a sessão via `localStorage`.
    -   *Motivo:* É uma ferramenta interna amigável para amigos próximos, segurança de nível "militar" não era o foco inicial, mas sim a facilidade de acesso.

2.  **Sincronização em Tempo Real (`useSupabase.ts`):**
    -   Custom hook genérico que se inscreve no canal `postgres_changes` do Supabase.
    -   Implementa **Optimistic Updates** (atualiza a UI antes da resposta do servidor) para criar sensação de app nativo.
    -   Gerencia CRUD básico (Create, Update, Delete).

3.  **Componentes Principais:**
    -   `Mural.tsx`: Container principal das ferramentas.
    -   `ServicesBoard.tsx`: Quadro de "Oferta e Demanda" (Compra/Venda). Usa tabela `services`.
    -   `GuildMap.tsx`: Sistema de pinos arrastáveis sobre uma imagem de mapa. Usa tabela `map_pins`.
    -   `GuildArea.tsx`: Tela de Login/Dashboard do admin.

## Tabelas do Banco (Supabase)
- **`services`**: `id` (uuid), `created_at`, `title`, `description`, `price`, `provider`, `type` (service/material), `intent` (buy/sell), `status` (open/in_progress), `assigned_to`.
- **`map_pins`**: `id`, `x`, `y`, `label`, `type` (clay/ore/etc), `author`.

## Pontos de Interesse para Code Review
Gostaria de uma análise sobre:
1.  **Segurança do Auth:** Sei que hardcoded não é ideal. Existe uma forma simples de usar o Auth do Supabase "anônimo" mas mantendo essa facilidade de "senha da guilda" compartilhada?
2.  **Performance do Hook:** O `useSupabase` pode estar criando listeners duplicados em re-renders rápidos? A lógica de "Optimistic Update" vs "Realtime Event" está robusta contra condições de corrida?
3.  **Estrutura do Projeto:** Como melhorar a organização dos arquivos dado que o projeto está crescendo (novas features de mapa vindo aí)?
4.  **Typescript:** Alguma melhoria na tipagem dos dados `ServiceItem` e `MapPin` para evitar o uso excessivo de `any` no hook genérico?
