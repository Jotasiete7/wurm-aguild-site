# 🚨 Security Debt: Autenticação do Painel Admin

## Situação Atual (Beta / Testes)
Atualmente, o **Painel Admin** do HUB2 (Ecosystem Dashboard) utiliza uma verificação estática de senha via front-end (`VITE_ADMIN_PASSWORD`). 
Por conta disso, as requisições de inserção e atualização de dados no Supabase (como adicionar fotos na Galeria, criar enquetes e alterar frases do dia) são feitas utilizando a *chave pública (anon key)*.

Para que isso funcione, as políticas de segurança (Row Level Security - RLS) do Supabase para tabelas como `hub_photos`, `hub_quotes` e `hub_polls` estão permitindo a role `anon` realizar `INSERT` e `UPDATE`.

## Falha de Segurança Conhecida
- Qualquer usuário com conhecimentos técnicos pode descobrir a URL da API do Supabase e a *anon key* (que são públicas por natureza no front-end).
- Sendo a role `anon` autorizada a inserir dados, scripts maliciosos poderiam enviar fotos, enquetes ou frases indesejadas diretamente para o banco de dados sem precisar da senha de Admin do front-end.

## Próximos Passos (Para Produção)
Esta abordagem deve ser substituída antes do lançamento oficial do HUB2 ou assim que a fase de testes local acabar.

1. **Implementar Supabase Auth:** Configurar o `supabase.auth.signInWithPassword()` para criar uma sessão real.
2. **Contas de Administrador:** Criar uma tabela de `admins` e um usuário de teste (ex: `admin@aguilda.com`).
3. **Refatorar Políticas (RLS):** Alterar todas as regras de `INSERT`/`UPDATE` das tabelas do HUB para restringir o acesso apenas a `TO authenticated` (ou roles específicas de admin).
4. **Remover a senha do Front-end:** O arquivo `.env.local` não deverá mais conter o `VITE_ADMIN_PASSWORD`, e a validação ocorrerá 100% no servidor (Supabase).

*Este arquivo serve como contexto e lembrete para as próximas sessões de desenvolvimento.*
