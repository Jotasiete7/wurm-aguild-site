# 🗺️ Registro Interno do Ecossistema A Guilda
> Documento de referência operacional do ecossistema de ferramentas, repositórios e bancos de dados.  
> **Última atualização:** 27 de Setembro de 2026

---

## 📌 1. Tabela Mestra de Ferramentas & Serviços

| Ferramenta | Status | URL de Produção (Deploy) | Repositório GitHub | Banco de Dados / Backend |
| :--- | :---: | :--- | :--- | :--- |
| **Ecosystem Hub (Portal Central)** | 🟢 Online | [wurm-aguild-site.pages.dev](https://wurm-aguild-site.pages.dev/) | [Jotasiete7/wurm-aguild-site](https://github.com/Jotasiete7/wurm-aguild-site) | Supabase `gzhvqprdrtudyokhgxlj` |
| **Relic Appraiser** | 🟢 Online | [wurm-relic-appraiser.pages.dev](https://wurm-relic-appraiser.pages.dev) | [Jotasiete7/Wurm-Relic-appraiser](https://github.com/Jotasiete7/Wurm-Relic-appraiser) | Client-side / JSON data |
| **Cooking & Recipes** | 🟢 Online | [wurm-recipe-tool.pages.dev](https://wurm-recipe-tool.pages.dev) | [Jotasiete7/wurm-recipe-tool](https://github.com/Jotasiete7/wurm-recipe-tool) | Supabase `gzhvqprdrtudyokhgxlj` (416 receitas) |
| **Ecosystem Analytics** | 🟢 Online | [wurm-analytics-journal.pages.dev](https://wurm-analytics-journal.pages.dev) | [Jotasiete7/wurm-analytics-journal](https://github.com/Jotasiete7/wurm-analytics-journal) | Supabase `gzhvqprdrtudyokhgxlj` (`articles`, `likes`) |
| **Guilda Badges & Conquistas** | 🟢 Online | [wurm-aguilda-badges.pages.dev](https://wurm-aguilda-badges.pages.dev) | [Jotasiete7/wurm-aguilda-badges](https://github.com/Jotasiete7/wurm-aguilda-badges) | Supabase `gzhvqprdrtudyokhgxlj` (`badges`) |
| **Mining Calculator** | 🟢 Online | [wurm-mining-tool.pages.dev](https://wurm-mining-tool.pages.dev) | [Jotasiete7/wurm-mining-tool](https://github.com/Jotasiete7/wurm-mining-tool) | Client-side engine |
| **Carpentry Planner** | 🟢 Online | [wurm-carpentry-tool.pages.dev](https://wurm-carpentry-tool.pages.dev) | [Jotasiete7/wurm-carpentry-tool](https://github.com/Jotasiete7/wurm-carpentry-tool) | Client-side engine |
| **Prospect Mapper** | 🟢 Online | [wurm-prospect-tool.pages.dev](https://wurm-prospect-tool.pages.dev) | [Jotasiete7/wurm-prospect-tool](https://github.com/Jotasiete7) | LocalStorage / HTML5 Canvas |
| **Wall Decay & Upkeep** | 🟢 Online | [wurm-wall-decay-calculator.pages.dev](https://wurm-wall-decay-calculator.pages.dev) | [Jotasiete7/wurm-wall-decay-calculator](https://github.com/Jotasiete7) | Client-side formulas |
| **Liturgy & Priests** | 🟢 Online | [wurm-liturgy.pages.dev](https://wurm-liturgy.pages.dev) | [Jotasiete7/wurm-liturgy](https://github.com/Jotasiete7) | Client-side Priest DB |
| **Craft Pulse Timer** | 🟢 Online | [wurm-aguild-site.pages.dev/guildutilities/craft-pulse](https://wurm-aguild-site.pages.dev/guildutilities/craft-pulse) | Interno no Hub (`wurm-aguild-site`) | Web Audio API / Internal timer |
| **Market Observatory** | 🟡 Manutenção | [wurm-market-observatory.pages.dev](https://wurm-market-observatory.pages.dev) | [Jotasiete7/Wurm-Market-Observatory](https://github.com/Jotasiete7/Wurm-Market-Observatory) | ⚠️ Supabase atual está dormente |
| **Historical Archive** | 🟡 Manutenção | [wurm-online-historical-archive.pages.dev](https://wurm-online-historical-archive.pages.dev) | [Jotasiete7/Wurm-Online-Historical-Archive](https://github.com/Jotasiete7/Wurm-Online-Historical-Archive) | ⚠️ Supabase atual está dormente |
| **Auction House Helper** | 🔵 Em breve | [wurm-auction-helper.pages.dev](https://wurm-auction-helper.pages.dev) | [Jotasiete7/wurm-auction-helper](https://github.com/Jotasiete7/wurm-auction-helper) | Em desenvolvimento |

---

## 🎯 2. Próximos Capítulos — Plano de Ação

### 🟡 Market Observatory & Historical Archive
* **Cenário:** Ambas as ferramentas dependem de dados históricos de trocas e logs arqueológicos do Wurm Online.
* **Problema Identificado:** A instância do Supabase configurada nas variáveis de ambiente deles atualmente aponta para um projeto que entrou em estado dormente/pausado.
* **Passos para o Retorno:**
  1. Identificar a nova instância ativa do Supabase (ou migrar a estrutura de tabelas e dados para o Supabase principal `gzhvqprdrtudyokhgxlj`).
  2. Atualizar as variáveis de ambiente (`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`) no Cloudflare Pages dos dois projetos.
  3. No repositório `wurm-aguild-site`, alterar o status de ambos em `src/data/tools.ts` de `'maintenance'` de volta para `'active'`.

---

## 🗄️ 3. Repositórios Descontinuados / Arquivados
*(Não fazem parte do Hub)*

* `TortaApp-V2` — Descontinuado / Prototipagem antiga de inteligência de mercado.
* `tortaapp` — Versão original em Python do TortaApp (arquivado).
* `aguildadump1` — Resquício / dump antigo de preços NFI.
