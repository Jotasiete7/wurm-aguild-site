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
| **Market Observatory** | 🟢 Online | [wurm-market-observatory.pages.dev](https://wurm-market-observatory.pages.dev) | [Jotasiete7/Wurm-Market-Observatory](https://github.com/Jotasiete7/Wurm-Market-Observatory) | Supabase `grkqxztxxelebdflhnlv` (Healthy) |
| **Historical Archive** | 🟢 Online | [wurm-online-historical-archive.pages.dev](https://wurm-online-historical-archive.pages.dev) | [Jotasiete7/Wurm-Online-Historical-Archive](https://github.com/Jotasiete7/Wurm-Online-Historical-Archive) | Supabase `grkqxztxxelebdflhnlv` (`raw_logs`, Storage) |
| **Auction House Helper** | 🔵 Em breve | [wurm-auction-helper.pages.dev](https://wurm-auction-helper.pages.dev) | [Jotasiete7/wurm-auction-helper](https://github.com/Jotasiete7/wurm-auction-helper) | Em desenvolvimento |

---

## 🎯 2. Arquitetura de Bancos de Dados (2 Projetos Ativos)

Atualmente a conta utiliza os 2 slots ativos permitidos no plano gratuito do Supabase:
1. **Projeto 1 (`gzhvqprdrtudyokhgxlj` — `wurm-guild`):**
   * HUB Central (`wurm-aguild-site`)
   * Cooking & Recipes (`wurm-recipe-tool`)
   * Ecosystem Analytics (`wurm-analytics-journal`)
   * Guilda Badges & Conquistas (`wurm-aguilda-badges`)
2. **Projeto 2 (`grkqxztxxelebdflhnlv` — `Wurm Online Historical Archive`):**
   * Historical Archive (`wurm-online-historical-archive`)
   * Market Observatory (`wurm-market-observatory`)
   * Bucket de Storage `logs-archive` e tabela `raw_logs`

---

## 🗄️ 3. Repositórios Descontinuados / Arquivados
*(Não fazem parte do Hub)*

* `TortaApp-V2` — Descontinuado / Prototipagem antiga de inteligência de mercado.
* `tortaapp` — Versão original em Python do TortaApp (arquivado).
* `aguildadump1` — Resquício / dump antigo de preços NFI.
