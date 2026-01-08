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
- **Hospedagem (Deploy)**: Netlify (Conectado ao GitHub `main`).
- **Ícones**: Lucide React.

## 3. Credenciais e Contas
**Importante**: Nunca armazene senhas neste arquivo ou no repositório.

- **Repositório GitHub**: Privado/Organização da Guilda.
- **Netlify**: Vinculado à conta do Jotasiete. O deploy é automático ao dar push na branch `main`.
- **Supabase**: Projeto `wurm-guild`.
    - **URL do Banco**: Definida em `.env` (VITE_SUPABASE_URL).
    - **Chave Anônima**: Definida em `.env` (VITE_SUPABASE_ANON_KEY).
    - *Nota*: A chave anônima é segura para ficar no frontend, pois as regras de segurança (RLS) limitam o que ela pode fazer.

## 4. Decisões de Design & Arquitetura

### 4.1. Design Visual (Glassmorphism)
O site utiliza um tema escuro com transparências (glassmorphism) para manter uma estética moderna e "premium".
- **Cores Principais**: Tons de verde sálvia (Sage) para ações positivas e acentos.
- **Componentes**: Fundo escuro com "noise" (ruído) sutil e bordas semitransparentes.

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
Basta commitar e dar push para a `main`. O Netlify detecta e atualiza em ~1 minuto.
`git push origin main`

### Recuperação de Desastre
Se perder acesso a esta pasta, clone o repositório novamente:
`git clone [URL_DO_REPO]`
E crie o arquivo `.env` com as chaves do Supabase novamente.
