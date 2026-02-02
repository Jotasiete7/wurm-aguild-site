import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // Get environment variables
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        console.log('Environment check:', {
            hasUrl: !!supabaseUrl,
            hasServiceKey: !!serviceKey
        });

        // Validate authorization header
        const authHeader = req.headers.get('Authorization');
        console.log('Auth header present:', !!authHeader);

        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (!serviceKey) {
            return new Response(JSON.stringify({ error: 'Server configuration error' }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Create service role client for all operations
        const supabase = createClient(supabaseUrl!, serviceKey!);

        // Extract and rigorously clean the token
        // Remove "Bearer " (case-insensitive), trim whitespace, and remove any surrounding quotes
        const token = authHeader
            .replace(/[Bb]earer\s+/, '')
            .trim()
            .replace(/^["'](.+)["']$/, '$1');

        console.log('Token validation - length:', token.length);
        console.log('Token validation - starts with:', token.substring(0, 15) + '...');
        console.log('Token validation - ends with:', '...' + token.substring(token.length - 15));

        // Validate the user's JWT token using service role privileges
        // CRITICAL: Pass the token explicitly as parameter to getUser()
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError) {
            console.error('Auth validation error:', authError);
            return new Response(JSON.stringify({
                error: 'Authentication failed',
                details: authError.message,
                code: authError.code
            }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (!user) {
            console.error('No user returned from auth validation');
            return new Response(JSON.stringify({ error: 'No user found' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        console.log('✅ User authenticated successfully:', user.id);

        // Parse request body
        const { client_id, user_id, redirect_uri } = await req.json();

        // Validate required fields
        if (!client_id || !user_id) {
            console.error('Missing required fields:', { client_id: !!client_id, user_id: !!user_id });
            return new Response(JSON.stringify({ error: 'Missing client_id or user_id' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Verify the user_id matches the authenticated user
        if (user_id !== user.id) {
            console.error('User ID mismatch:', { provided: user_id, authenticated: user.id });
            return new Response(JSON.stringify({ error: 'User ID mismatch' }), {
                status: 403,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Verify the SSO client exists and is active
        const { data: client, error: clientError } = await supabase
            .from('sso_clients')
            .select('*')
            .eq('client_id', client_id)
            .eq('is_active', true)
            .single();

        if (clientError || !client) {
            console.error('Invalid client:', clientError);
            return new Response(JSON.stringify({ error: 'Invalid or inactive client' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        console.log('✅ Client verified:', client.client_name);

        // Verify redirect URI if provided
        if (redirect_uri && !client.redirect_uris.includes(redirect_uri)) {
            console.error('Invalid redirect_uri:', redirect_uri);
            console.error('Allowed redirect URIs:', client.redirect_uris);
            return new Response(JSON.stringify({
                error: 'Invalid redirect_uri',
                allowed_uris: client.redirect_uris
            }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Generate authorization code
        const code = crypto.randomUUID();
        console.log('Generated authorization code:', code);

        // Store the authorization code with the user's token
        // Code expires in 5 minutes for security
        const { error: codeError } = await supabase
            .from('sso_codes')
            .insert({
                code,
                user_id: user.id,
                client_id,
                access_token: token, // Store the validated token for exchange
                refresh_token: null, // Don't store refresh token for security
                expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
                used: false
            });

        if (codeError) {
            console.error('Failed to store authorization code:', codeError);
            return new Response(JSON.stringify({
                error: 'Failed to generate authorization code',
                details: codeError.message
            }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        console.log('✅ Authorization code stored successfully');

        // Return the authorization code
        return new Response(JSON.stringify({ code }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error: any) {
        console.error('❌ Unexpected error in sso-authorize:', error);
        return new Response(JSON.stringify({
            error: 'Internal server error',
            message: error?.message || String(error)
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});
