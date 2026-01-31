import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // Extract and validate authorization header
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Create client with anon key to validate user JWT
        const userSupabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            {
                global: {
                    headers: { Authorization: authHeader }
                }
            }
        );

        // Verify the user is authenticated
        const { data: { user }, error: authError } = await userSupabase.auth.getUser();
        if (authError || !user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Create service role client for database operations
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const { client_id, user_id, redirect_uri, access_token, refresh_token } = await req.json();

        if (!client_id || !user_id) {
            throw new Error('Missing client_id or user_id');
        }

        // Verify user_id matches authenticated user
        if (user_id !== user.id) {
            return new Response(JSON.stringify({ error: 'User ID mismatch' }), {
                status: 403,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // 1. Verify Client
        const { data: client, error: clientError } = await supabase
            .from('sso_clients')
            .select('*')
            .eq('client_id', client_id)
            .eq('is_active', true)
            .single();

        if (clientError || !client) {
            console.error('Client error:', clientError);
            return new Response(JSON.stringify({ error: 'Invalid client' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // 2. Verify Redirect URI (Strict matching)
        // If redirect_uri is provided, it must be in the whitelist.
        if (redirect_uri) {
            const allowed = client.redirect_uris.includes(redirect_uri) ||
                client.redirect_uris.some(u => redirect_uri.startsWith(u));

            // Strict as per architecture:
            if (!client.redirect_uris.includes(redirect_uri)) {
                return new Response(JSON.stringify({ error: 'Invalid redirect_uri' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }
        }

        // 3. Generate Code
        const code = crypto.randomUUID(); // using standardized UUID

        const { error: codeError } = await supabase
            .from('sso_codes')
            .insert({
                code,
                user_id,
                client_id,
                access_token, // Store tokens
                refresh_token, // Store tokens
                expires_at: new Date(Date.now() + 30 * 1000).toISOString() // 30 seconds validity
            });

        if (codeError) {
            console.error('Code generation error:', codeError);
            throw codeError;
        }

        return new Response(JSON.stringify({ code }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        console.error('Handler error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
