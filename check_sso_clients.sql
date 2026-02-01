-- Verificar se o cliente recipes_tool existe
SELECT *
FROM sso_clients
WHERE client_id = 'recipes_tool';
-- Ver todos os clientes cadastrados
SELECT *
FROM sso_clients;