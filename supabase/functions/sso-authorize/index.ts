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
        // Get environment variables
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
        const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        console.log('Environment check:', {
            hasUrl: !!supabaseUrl,
            hasAnonKey: !!anonKey,
            hasServiceKey: !!serviceKey
        });

        const authHeader = req.headers.get('Authorization');
        console.log('Auth header present:', !!authHeader);

        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (!anonKey) {
            return new Response(JSON.stringify({ error: 'Missing SUPABASE_ANON_KEY env var' }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Validate user JWT using service_role_key for privileged operations
        // This fixes the 401 error - service role has permission to validate user sessions
        const supabaseServiceRole = createClient(supabaseUrl!, serviceKey!, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        // Extract token without "Bearer " prefix
        const token = authHeader.replace('Bearer ', '').trim();

        console.log('Token length:', token.length);
        console.log('Token preview:', token.substring(0, 50) + '...');

        const { data: { user }, error: authError } = await supabaseServiceRole.auth.getUser(token);

        if (authError) {
            console.error('Auth validation error:', authError);
            return new Response(JSON.stringify({
                error: 'Authentication failed',
                details: authError.message
            }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (!user) {
            return new Response(JSON.stringify({ error: 'No user found' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        console.log('User authenticated:', user.id);

        // Create service role client for database operations
        const supabase = createClient(supabaseUrl!, serviceKey!);

        const { client_id, user_id, redirect_uri } = await req.json();

        if (!client_id || !user_id) {
            throw new Error('Missing client_id or user_id');
        }

        if (user_id !== user.id) {
            return new Response(JSON.stringify({ error: 'User ID mismatch' }), {
                status: 403,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Verify client
        const { data: client, error: clientError } = await supabase
            .from('sso_clients')
            .select('*')
            .eq('client_id', client_id)
            .eq('is_active', true)
            .single();

        if (clientError || !client) {
            console.error('Client error:', clientError);
            return new Response(JSON.stringify({ error: 'Invalid client' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Verify redirect URI
        if (redirect_uri && !client.redirect_uris.includes(redirect_uri)) {
            return new Response(JSON.stringify({ error: 'Invalid redirect_uri' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Generate code
        const code = crypto.randomUUID();

        // Get session info from the validated token
        // The token we validated is the access_token
        // Note: For security, we store the token temporarily for handover to satellite
        const { error: codeError } = await supabase
            .from('sso_codes')
            .insert({
                code,
                user_id,
                client_id,
                access_token: token, // Use the validated token
                refresh_token: null, // Don't store refresh_token for security
                expires_at: new Date(Date.now() + 30 * 1000).toISOString()
            });

        if (codeError) {
            console.error('Code generation error:', codeError);
            throw codeError;
        }

        return new Response(JSON.stringify({ code }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error: any) {
        console.error('Handler error:', error);
        return new Response(JSON.stringify({
            error: 'Internal server error',
            message: error?.message || String(error)
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});
