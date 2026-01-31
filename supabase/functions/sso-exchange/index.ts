import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { create, getNumericDate } from "https://deno.land/x/djwt@v2.8/mod.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const { code, client_id } = await req.json();

        if (!code || !client_id) {
            throw new Error('Missing code or client_id');
        }

        // 1. Fetch Code
        const { data: ssoCode, error: fetchError } = await supabase
            .from('sso_codes')
            .select('*, user_id')
            .eq('code', code)
            .eq('client_id', client_id)
            .single();

        if (fetchError || !ssoCode) {
            return new Response(JSON.stringify({ error: 'Invalid or expired code' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // 2. Validate Expiry and Usage
        if (ssoCode.used) {
            return new Response(JSON.stringify({ error: 'Code already used' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        if (new Date(ssoCode.expires_at) < new Date()) {
            return new Response(JSON.stringify({ error: 'Code expired' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // 3. Invalidate Code (Mark as used)
        const { error: matchError } = await supabase
            .from('sso_codes')
            .update({ used: true })
            .eq('code', code);

        if (matchError) {
            console.error('Error invalidating code:', matchError);
            // Proceeding anyway or failing? Failing is safer to prevent replay if update failed.
            throw new Error('Failed to invalidate code');
        }

        // 4. Fetch User Profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', ssoCode.user_id)
            .single();

        // Fetch Email from Auth Users (Admin required)
        const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(ssoCode.user_id);

        // 5. Generate Response (Custom JWT or Simple Payload)
        // We'll create a simple signed JWT if we have a secret, or just return the user data securely.
        // Ideally we use a JWT so the Satellite can verify it came from us.
        // Using Supabase JWT Secret if available, or a custom secret. 
        // For simplicity V1: We return the user object directly. The Secure Channel (TS/HTTPS) protects the transit.
        // The Satellite "trusts" the response because it called the edge function directly.

        const payload = {
            user: {
                id: ssoCode.user_id,
                username: profile?.username || 'Unknown',
                email: authUser?.user?.email,
                global_role: profile?.global_role || 'viewer',
                app_metadata: authUser?.user?.app_metadata,
                user_metadata: authUser?.user?.user_metadata
            },
            // We can add a short lived access_token here if we want the satellite to use it for RLS on the Hub directly,
            // but Satellites usually have their own DBs or just need Identity.
            // If Satellites need to access Hub DB, we'd need to mint a Supabase Token.
            expires_in: 3600
        };

        return new Response(JSON.stringify(payload), {
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
