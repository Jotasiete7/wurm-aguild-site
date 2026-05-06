# HUB2 — Portal Central do Ecossistema A Guilda
> **Wurm Online · A Guilda · Portal v2**

## O que é este projeto

O **HUB2** é o dashboard central do ecossistema de ferramentas d'A Guilda para Wurm Online. Ele serve como ponto de entrada único para todos os membros, exibindo o estado ao vivo de cada ferramenta do ecossistema e permitindo interações comunitárias (enquetes, galeria de fotos, ordens de serviço).

**URL de produção:** em configuração (Cloudflare Pages)  
**Admin panel:** `<url>/admin` · senha definida em `AdminPage.tsx`

---

## Stack Técnico

| Camada | Tecnologia |
|--------|-----------|
| Framework | Vite + React 18 + TypeScript |
| Estilo | Tailwind CSS v4 (`@tailwindcss/vite`) + CSS Modules |
| Banco de Dados | Supabase (mesmo projeto do Analytics e Badges) |
| Roteamento | `react-router-dom` v6 |
| Ícones | `lucide-react` |
| Deploy | Cloudflare Pages (a configurar) |

---

## Design System

O HUB2 segue **rigorosamente** o design system compartilhado do ecossistema A Guilda. Não inventar cores, fontes ou espaçamentos fora desse sistema.

### Tokens principais (definidos em `src/index.css`)

```css
--color-wurm-bg: #050505;        /* fundo global */
--color-wurm-panel: #0a0a0a;     /* painéis/cards */
--color-wurm-border: #262626;    /* bordas */
--color-wurm-accent: #d4b483;    /* dourado principal */
--color-wurm-accent-dim: #8a7453; /* dourado escuro */
--color-wurm-text: #e5e5e5;      /* texto principal */
--color-wurm-muted: #737373;     /* texto secundário */
```

### Fontes (Google Fonts, carregadas em `index.html`)
- **Inter** → corpo de texto, UI
- **JetBrains Mono** → dados, metadados, labels, contadores
- **Playfair Display** → títulos de seção, quotes, headings

### Componente base: `ToolWidget`

Todos os cards do Bento Grid são criados com `src/components/ecosystem/ToolWidget.tsx`.

```tsx
<ToolWidget
  title="Nome"
  subtitle="Subtítulo"
  icon={LucideIcon}
  href="https://..."
  status="active" // 'active' | 'maintenance' | 'coming-soon'
  accentColor="#d4b483" // opcional, sobrescreve o dourado padrão
  className="md:col-span-2" // para ajustar o grid
>
  {/* conteúdo interno do widget */}
</ToolWidget>
```

---

## Estrutura de Pastas

```
portal-v2/
├── public/
│   ├── logo-sm.webp              # Logo d'A Guilda
│   └── data/
│       └── ecosystem-feed.json  # Feed de atividades (editado manualmente)
├── src/
│   ├── App.tsx                   # Rotas: / e /admin
│   ├── index.css                 # Design tokens + Tailwind
│   ├── main.tsx
│   ├── contexts/
│   │   └── LanguageContext.tsx   # PT/EN — useLanguage() hook
│   ├── lib/
│   │   └── supabase.ts           # Cliente Supabase (anon key)
│   ├── services/                 # Camada de dados — NUNCA acessar supabase direto dos componentes
│   │   ├── hubAnalytics.ts       # Último artigo + contagem do Analytics
│   │   ├── hubBadges.ts          # Últimas badges + contagem
│   │   ├── hubGallery.ts         # Fotos do concurso de Deeds
│   │   ├── hubMural.ts           # Ordens abertas (services) + Recursos públicos
│   │   ├── hubPolls.ts           # Enquetes + votação com fingerprint dedup
│   │   ├── hubQuotes.ts          # Quote do Dia (rotação por dia do ano)
│   │   └── hubStatus.ts          # Banner de Status do Sistema
│   ├── components/
│   │   ├── SystemStatusBanner.tsx  # Banner global no topo da página
│   │   ├── ecosystem/
│   │   │   ├── EcosystemFeed.tsx   # Feed de atividades (lê ecosystem-feed.json)
│   │   │   ├── ServicesGrid.tsx    # Grid legado (substituído pelos widgets)
│   │   │   ├── SystemsGrid.tsx     # Grid legado (substituído pelos widgets)
│   │   │   └── ToolWidget.tsx      # Card base do Bento Grid ← componente central
│   │   └── widgets/              # Um widget por ferramenta/feature
│   │       ├── AnalyticsWidget.tsx   # Último artigo do Analytics
│   │       ├── BadgesWidget.tsx      # Thumbnails das últimas badges
│   │       ├── GalleryWidget.tsx     # Galeria de Deeds + Lightbox
│   │       ├── MuralWidget.tsx       # Ordens de compra/venda abertas
│   │       ├── PollWidget.tsx        # Enquete ativa com votação
│   │       ├── QuoteWidget.tsx       # Quote do Dia
│   │       └── ResourcesWidget.tsx   # Links de recursos públicos
│   ├── pages/
│   │   ├── HomePage.tsx          # Layout Bento Grid principal
│   │   ├── HomePage.module.css
│   │   └── Admin/
│   │       └── AdminPage.tsx     # Painel administrativo
│   └── ecossistema-guilda/       # Header/layout compartilhado do ecossistema
│       ├── layout/
│       │   ├── Header.tsx        # AgHeader — header padrão d'A Guilda
│       │   └── Header.module.css
│       ├── modules/
│       │   ├── EcosystemMenu.tsx # Menu dropdown do ecossistema
│       │   └── LanguageSwitch.tsx
│       ├── theme/
│       │   └── theme.css         # Variáveis CSS --ag-* do header
│       └── package.json
├── .env.local                    # VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY (não commitado)
├── vite.config.ts                # Alias @ecossistema-guilda → ./src/ecossistema-guilda
└── tsconfig.app.json             # paths alias + ignoreDeprecations: "6.0"
```

---

## Banco de Dados (Supabase)

**Projeto:** `gzhvqprdrtudyokhgxlj` (compartilhado com Analytics e Badges)

### Tabelas existentes (herdadas de outros projetos)

| Tabela | Projeto de origem | Usado no HUB |
|--------|-------------------|--------------|
| `articles` | Analytics | Widget Analytics |
| `badges` | Guilda Badges | Widget Badges |
| `services` | live-site-check | Widget Mural |
| `resources` | live-site-check | Widget Recursos |

### Tabelas novas do HUB2 (criar via SQL abaixo)

| Tabela | Propósito |
|--------|-----------|
| `hub_polls` | Enquetes ativas |
| `hub_poll_options` | Opções de cada enquete |
| `hub_poll_votes` | Votos (dedup por fingerprint) |
| `hub_photos` | Fotos do concurso de Deeds |
| `hub_photo_votes` | Votos nas fotos |
| `hub_system_status` | Banner global de status |
| `hub_quotes` | Pool de frases do Quote do Dia |

### SQLs para executar (em ordem)

1. `docs/sql/hub2_phase2.sql` — Enquetes + Galeria + RPCs atômicas
2. `docs/sql/hub2_system_status.sql` — Status do Sistema
3. `docs/sql/hub2_quotes.sql` — Quotes (já inclui 4 frases seed)

---

## Variáveis de Ambiente

Crie `.env.local` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://gzhvqprdrtudyokhgxlj.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key do projeto>
VITE_ADMIN_PASSWORD=<senha_do_admin>
```

> ⚠️ Nunca commitar `.env.local`. Está no `.gitignore`.

Para deploy no Cloudflare Pages, configurar as mesmas variáveis no dashboard do projeto.

---

## Sistema de Linguagem (PT/EN)

Todos os textos visíveis ao usuário devem usar o hook `useLanguage()`:

```tsx
const { lang, t } = useLanguage();
// t('English text', 'Texto em português')
```

O `lang` também é passado para o `AgHeader` e para o `EcosystemMenu`.

---

## Como o Header é integrado

O header padrão é o `AgHeader` (alias de `Header` de `@ecossistema-guilda/layout/Header`).

```tsx
import { Header as AgHeader } from '@ecossistema-guilda/layout/Header';
import { LanguageSwitch } from '@ecossistema-guilda/modules/LanguageSwitch';
import agStyles from '@ecossistema-guilda/layout/Header.module.css';

<AgHeader
  variant="default"
  currentToolId="portal-v2"  // identifica este site no menu do ecossistema
  LinkComponent={NavLink}     // react-router NavLink para SPA
  logo={<img src="/logo-sm.webp" ... />}
  extraModules={
    <LanguageSwitch lang={lang} onLanguageChange={(l: any) => setLang(l)} styles={agStyles} />
  }
/>
```

O alias `@ecossistema-guilda` aponta para `./src/ecossistema-guilda` (configurado em `vite.config.ts` e `tsconfig.app.json`).

---

## Admin Panel

**URL:** `/admin`  
**Senha:** definida na constante `ADMIN_PASSWORD` em `src/pages/Admin/AdminPage.tsx`

> Para produção, trocar por autenticação real (Discord OAuth está planejado).

### Funcionalidades do Admin

| Seção | O que faz |
|-------|-----------|
| **Status do Sistema** | Publica/limpa o banner global (info / aviso / alerta) |
| **Enquetes** | Cria enquetes bilíngues PT+EN com até 5 opções |
| **Fotos** | Adiciona fotos ao concurso de Deeds por URL |
| **Quotes** | Adiciona frases ao pool do Quote do Dia, ativa/desativa individualmente |

---

## Lógica de Votação (Anti-Duplo Voto)

Não há autenticação de usuário. O sistema usa um **fingerprint** gerado no browser:

```ts
// hash SHA-256 de: userAgent + resolução de tela + timezone
const raw = `${navigator.userAgent}|${screen.width}x${screen.height}|${timezone}`;
```

Este hash é enviado à RPC do Supabase (`vote_poll` / `vote_photo`) que tem `UNIQUE(poll_id, ip_hash)` — impedindo votos duplos sem guardar dados sensíveis.

---

## Quote do Dia — Lógica de Rotação

```ts
const dayOfYear = Math.floor((Date.now() - new Date(year, 0, 0)) / 86_400_000);
const index = dayOfYear % quotes.length;
// quote = quotes[index]
```

Cada dia exibe uma frase diferente, de forma determinística (todos os usuários veem a mesma frase no mesmo dia). Ao adicionar novas frases, a rotação muda automaticamente.

---

## Feed de Atividades (ecosystem-feed.json)

O arquivo `public/data/ecosystem-feed.json` é gerenciado **manualmente**. Schema:

```json
{
  "id": "unique-string",
  "date": "2026-05-06",
  "type": "article | badge | event | maintenance | alert",
  "title_pt": "Texto em português",
  "title_en": "English text",
  "description_pt": "...",
  "description_en": "...",
  "link": "https://... ou null"
}
```

---

## Rotas do Ecossistema (EcosystemMenu)

O `currentToolId="portal-v2"` identifica este projeto no menu dropdown do header. Para que apareça no menu das **outras ferramentas**, será necessário (quando o HUB estiver maduro) adicionar `portal-v2` ao array `ECOSYSTEM_TOOLS` em cada projeto do ecossistema.

> **Isolamento intencional:** O HUB2 não aparece no menu das outras ferramentas por ora. Será integrado quando estiver em produção estável.

---

## Comandos

```bash
npm install       # instalar dependências
npm run dev       # servidor de desenvolvimento (localhost:5173)
npm run build     # build de produção (valida TypeScript + Vite)
npm run preview   # preview do build local
```

---

## Próximos Passos Planejados

- [ ] Executar os 3 SQLs no Supabase para criar as tabelas do HUB2
- [ ] Integrar dados reais de Auctions (investigar tabelas do auction-helper)
- [ ] Integrar contador real de Receitas (investigar tabelas do recipes)
- [ ] Login via Discord OAuth (substituir senha simples do admin)
- [ ] Deploy no Cloudflare Pages + configurar variáveis de ambiente
- [ ] Adicionar HUB2 ao `ECOSYSTEM_TOOLS` das outras ferramentas

---

## Contexto de Desenvolvimento

Este projeto foi desenvolvido iterativamente com assistência de IA (Antigravity/Claude). O padrão de código, design system e integração com Supabase seguem os mesmos padrões dos projetos `analytics` e `guilda-badges` do ecossistema. Ao continuar o desenvolvimento, consultar esses projetos como referência de padrões estabelecidos.
