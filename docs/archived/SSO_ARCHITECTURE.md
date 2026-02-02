# Arquitetura SSO Oficial – Ecossistema A Guilda

**Versão:** 1.0.0
**Status:** DRAFT
**Autor:** Antigravity (Senior Software Architect)

## 1. Visão Geral

Este documento define a arquitetura do **Sistema de Single Sign-On (SSO)** centralizado para o ecossistema "A Guilda". O objetivo é transformar o site principal (Hub) em um **Identity Provider (IdP)** seguro, fornecendo autenticação para aplicações satélites (Recipes, Mining, etc.) via **Authorization Code–Inspired Flow (Custom SSO)**, utilizando **Strict Validation** e **Supabase Edge Functions**.

---

## 2. Conceitos Fundamentais

1. **Identity Provider (IdP)**: O Hub (`live-site-check`) detém a base de usuários e a sessão "mestra".
2. **Service Provider (SP)**: Apps satélites (Recipes, Mining). Eles não têm banco de usuários próprio.
3. **Authorization Code–Inspired Flow (Custom SSO)**: O padrão ouro adaptado. O cliente recebe um código temporário e o troca por tokens no backend (ou via função segura). Não buscamos compatibilidade estrita com OAuth2, mas seguimos seus princípios de segurança.
4. **Security by Design**:
    * *Refresh Tokens* nunca chegam ao client-side dos satélites.
    * A sessão nos satélites é efêmera (curta duração), renovada validando a sessão no IdP.

---

## 3. Modelo de Dados (Supabase PostgreSQL)

O banco de dados do Hub será a fonte da verdade.

### 3.1. Tabelas Principais

#### `profiles` (Estendida)

Tabela mestre de usuários.

```sql
create type user_role as enum ('superadmin', 'admin', 'editor', 'viewer');

create table profiles (
  id uuid references auth.users not null primary key,
  username text unique not null,
  global_role user_role default 'viewer', -- Cargo "Cebola" (Layered)
  created_at timestamptz default now()
);
```

#### `sso_clients`

Whitelist de aplicações autorizadas a usar o SSO.

```sql
create table sso_clients (
  id uuid default gen_random_uuid() primary key,
  client_id text unique not null, 
  client_name text not null,
  redirect_uris text[] not null, -- Array de URIs permitidas (Strict Matching)
  is_active boolean default true
);

-- Exemplo de Insert
-- insert into sso_clients (client_id, client_name, redirect_uris) 
-- values ('recipes_tool', 'Wurm Recipes', ARRAY['https://wurm-recipes.pages.dev/auth/callback']);
```

#### `sso_codes`

Armazena códigos de autorização temporários (One-Time Password).

```sql
create table sso_codes (
  code text primary key, -- UUID ou Random String segura
  user_id uuid references auth.users not null,
  client_id text references sso_clients(client_id),
  expires_at timestamptz not null,
  used boolean default false,
  created_at timestamptz default now() -- Auditoria e Debug
);
```

---

## 4. Fluxo de Autenticação (Passo a Passo)

### Passo 1: Início (Satellite)

O usuário clica em "Login com A Guilda" no app Recipes.
O app redireciona o navegador para:
`https://hub.aguilda.com/sso/authorize?client_id=recipes_tool&redirect_uri=...&response_type=code`

### Passo 2: Verificação e Consentimento (Hub)

1. **Frontend do Hub** intercepta a rota `/sso/authorize`.
2. Verifica se o usuário já tem sessão Supabase ativa no Hub.
    * *Se não*: Exibe tela de Login.
    * *Se sim*: Prossegue.
3. Valida `client_id` e `redirect_uri` contra a tabela `sso_clients`.
4. Invoca **Edge Function** `generate-sso-code`.

### Passo 3: Geração do Código (Backend - Edge Function)

1. Gera um código aleatório seguro (`code`).
2. Salva em `sso_codes` com validade de 30 segundos.
3. Retorna o `code` para o Frontend do Hub.

### Passo 4: Redirecionamento (Hub -> Satellite)

O Hub redireciona o usuário de volta:
`https://wurm-recipes.pages.dev/auth/callback?code=CODE_123`

### Passo 5: Troca do Código (Satellite -> Hub)

1. O Satellite pega o `code`.
2. Chama **Edge Function** `exchange-sso-token` enviando `{ code, client_id }`.

### Passo 6: Validação e Token (Backend - Edge Function)

1. Busca o `code` no banco.
2. Verifica validade (tempo e se `used == false`).
3. Marca `code` como usado (`used = true`).
4. Gera um **Custom JWT** (assinado com a chave secreta do Supabase) contendo:
    * `sub`: user_id
    * `role`: global_role
    * `aud`: client_id
    * `exp`: 1 hora (Curta duração)
5. Retorna o JWT para o Satellite.
6. *Nota: Não retornamos Refresh Token. O Satellite deve confiar no JWT por 1h.*
    * **Renovação Silenciosa**: Satélites **NÃO** renovam tokens sozinhos. A renovação ocorre exclusivamente via redirect silencioso ao Hub para validar a sessão mestra.

---

## 5. Estrutura de Permissões (Modelo Cebola)

A validação de permissão deve ser hierárquica (Downstream inherit permissions).

1. **Superadmin**: Acesso total a tudo (Hub + Todos Satélites). Gerencia a própria Guilda.
2. **Admin (App Level)**: Administra conteúdo de um app específico (ex: Aprovar receitas).
3. **Editor**: Pode criar/editar conteúdo próprio (ex: Submeter receitas, postar no mural).
4. **Viewer**: Apenas leitura (Público autenticado).

**No Token (Claims):**

```json
{
  "sub": "user-uuid",
  "global_role": "superadmin",
  "app_role": "editor",     // Role específico para o contexto do app (se aplicável)
  "aud": "recipes_tool",
  "exp": 1710000000
}
```

---

## 6. Endpoints (Supabase Edge Functions)

Para garantir segurança, a lógica sensível sai do Client-side React e vai para o Server-side Deno.

### `POST /functions/v1/sso-authorize`

*Internal Use Only (chamado pelo Hub Frontend)*

* **Input**: `client_id`, `user_id` (Do Auth Context)
* **Process**: Valida cliente, cria registro em `sso_codes`.
* **Output**: `{ code }`

### `POST /functions/v1/sso-exchange`

*Public Access (chamado pelo Satellite)*

* **Input**: `{ code, client_id }`
* **Process**: Valida code, queima code, assina JWT.
* **Output**: `{ access_token, user_profile }`

---

## 7. Plano de Implementação

1. **Banco de Dados**: Rodar migrations para criar tabelas `sso_clients` e `sso_codes`.
2. **Edge Functions**: Configurar ambiente Deno e deployar funcoes `sso-authorize` e `sso-exchange`.
3. **Frontend Hub**:
    * Criar página `/sso/authorize`.
    * Lógica de loop de login/redirect.
4. **Frontend Satélites (Ex: Recipes)**:
    * Criar `AuthProvider` que suporta fluxo SSO ao invés de login direto.
    * Implementar rota `/auth/callback` para troca do código.

---

## 8. Segurança

* **Network**: Apenas HTTPS.
* **Mitigação de Replay**: Códigos de autorização são de uso único.
* **Mitigação de Phishing**: Whitelist estrita de `redirect_uris`.
* **Dados Sensíveis**: Claims do token são mínimos necessários.

---

Este documento serve como a especificação verdade para a implementação do sistema.
