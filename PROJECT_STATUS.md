# Documentação Oficial do Projeto: Wurm Guild Site

## 1. Visão Geral

Este projeto é o Mural Digital e site institucional da guilda. Ele serve como hub central para:

- **Mural de Serviços**: Compra e venda de itens e serviços entre membros.
- **Recursos Operacionais**: Links rápidos para ferramentas externas (Wiki, Mapas, Planilhas).
- **Mapa Especial**: Sistema de pinos para coordenação geográfica em Harmony.

## 2. Tecnologias (Tech Stack)

- **Frontend**: React 19 + TypeScript + Vite.
- **Estilização**: CSS Modules / Vanilla CSS com design "Glassmorphism" (vidro fosco).
- **Banco de Dados**: Supabase (PostgreSQL).
- **Hospedagem (Deploy)**: Cloudflare Pages (Conectado ao GitHub `main`).
- **Ícones**: Lucide React.

## 3. Credenciais e Contas

**Importante**: Nunca armazene senhas neste arquivo ou no repositório.

- **Repositório GitHub**: [Jotasiete7/wurm-aguild-site](https://github.com/Jotasiete7/wurm-aguild-site)
- **Cloudflare Pages**: Vinculado à conta (dash.cloudflare.com). O deploy é automático ao dar push na branch `main`.
- **Supabase**: Projeto `wurm-guild`.
  - **URL do Banco**: Definida em `.env` (VITE_SUPABASE_URL).
  - **Chave Anônima**: Definida em `.env` (VITE_SUPABASE_ANON_KEY).
  - *Nota*: A chave anônima é segura para ficar no frontend, pois as regras de segurança (RLS) limitam o que ela pode fazer.

## 4. Decisões de Design & Arquitetura

### 4.1. Filosofia de UX: Infraestrutura Silenciosa

O site foi desenhado para ser uma ferramenta de trabalho, não uma rede social.

- **Minimalismo Operacional**: Sem ruído, sem onboarding longo, sem textos desnecessários.
- **Gateways de Intenção**: Botões e links deixam claro qual ação técnica será realizada (ex: "Ver mural" vs "Entrar").
- **Navegação Funcional**: O usuário deve entender em 5 segundos onde estão os Serviços, Recursos e Mapa.

### 4.2. Design Visual (Glassmorphism + Minimalismo)

Utiliza um tema escuro com transparências para manter o ar "premium", mas com redução drástica de elementos decorativos.

- **Cores**: Tons de verde sálvia (Sage) para ações, cinza para estrutura.
- **Tipografia**: Hierarquia clara, usando opacidade para guiar a leitura (menos importante = mais transparente).

### 4.2. Segurança e Permissões (Role-Based Access)

Ao invés de usar o sistema complexo de Auth do Supabase com emails, optamos por um **Auth Local Simplificado** para facilitar o uso pelos membros.

- **Auth Local**: O arquivo `AuthContext.tsx` contém a lógica de login local (senhas hardcoded para `jotasiete` e `calvos`).
- **Segurança no Banco (RLS)**:
  - O banco vê todos como usuários anônimos (`anon`).
  - Para proteger a escrita (criar/editar/apagar), criamos Políticas RLS (Row Level Security) que verificam se o campo `author` ou `provider` enviado é igual a `'jotasiete'` ou `'calvos'`.
  - Isso impede que usuários comuns (que enviam author='Anon') alterem dados.

### 4.3. Otimização de UI (Optimistic Updates)

Para evitar a sensação de lentidão, o frontend atualiza a tela **imediatamente** quando você cria ou edita algo, sem esperar a confirmação do servidor. Se o servidor falhar, ele reverte (ou avisa).

## 5. Como Manter e Operar

### Adicionar Novos Admins

1. Adicione o usuário e senha no `src/context/AuthContext.tsx`.
2. Adicione o nome do usuário nas Políticas RLS do Supabase (SQL Editor).

### Deploy

Basta commitar e dar push para a `main`. O Cloudflare Pages detecta e atualiza em ~1 minuto.
`git push origin main`

### Recuperação de Desastre

Se perder acesso a esta pasta, clone o repositório novamente:
`git clone [URL_DO_REPO]`
E crie o arquivo `.env` com as chaves do Supabase novamente.

## 6. Mapa do Código (Para Agentes/Devs)

Se você é uma IA ou Dev entrando agora, aqui está onde as coisas acontecem:

- **`src/`**: Raiz do código fonte.
  - **`components/Mural/`**: Onde vivem os widgets principais.
    - `ServicesBoard.tsx`: Mural de serviços (Compra/Venda). Lógica de CRUD complexa aqui.
    - `RecipeManagement.tsx`: **[NEW]** Aprovação de receitas pendentes (Admin).
    - `ResourcesBoard.tsx`: Links úteis (Wiki, Mapas). CRUD simples. **[UPDATED]** UI refinada com ícones, badges e animações.
    - `GuildMap.tsx`: Mapa interativo com pinos.
  - **`hooks/useSupabase.ts`**: O "cérebro" da comunicação com o banco. Abstrai SELECT/INSERT/UPDATE/DELETE e o Realtime. **Não edite sem cuidado.**
  - **`context/AuthContext.tsx`**: O sistema de login "fake". Se precisar adicionar um admin, é aqui.
  - **`types.ts`**: Tipagem central. Se mudar o banco, mude aqui primeiro.

## 7. Diretrizes de Desenvolvimento (Anti-Perda)

1. **Autenticação**: Não tente usar `supabase.auth.user()`. O usuário logado está em `useAuth()`.
2. **Segurança**: Ao criar/editar dados, você **DEVE** enviar o campo `author` ou `provider` com o username do `useAuth`. Sem isso, o RLS do banco vai bloquear (Erro 403).
3. **UI**: Mantenha o estilo "Glassmorphism" (`className="glass"`). Use ícones do `lucide-react`.

## 8. Próximos Passos: SSO (A Guilda ID)

Iniciamos o design do sistema de Single Sign-On para unificar o login entre o Hub e as ferramentas (Recipes, Mining).

- **Documento de Arquitetura**: Veja `SSO_ARCHITECTURE.md` na raiz.
- **Status**: Design aprovado. Implementação pendente.
- **Objetivo**: Permitir que satélites usem "Login com A Guilda". (Authorization Code Flow).
