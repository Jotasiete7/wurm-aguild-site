-- Add root URL to allowed redirect URIs on the Hub
-- Execute this on the 'wurm-guild' Supabase project (Hub)
update sso_clients
set redirect_uris = array_append(redirect_uris, 'https://wurm-recipes.pages.dev')
where client_id = 'recipes_tool'
    and not (
        'https://wurm-recipes.pages.dev' = any(redirect_uris)
    );
update sso_clients
set redirect_uris = array_append(redirect_uris, 'https://wurm-recipes.pages.dev/')
where client_id = 'recipes_tool'
    and not (
        'https://wurm-recipes.pages.dev/' = any(redirect_uris)
    );