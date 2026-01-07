
import { createClient } from '@supabase/supabase-js';

// Use environment variables for credentials (preferred)
// Fallback to hardcoded values for production builds where env vars might not be injected
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gzhvqprdrtudyokhgxlj.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_B3Gpy22WDnp9PIXP99hvKA_KDy79Qmx';

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Variáveis de ambiente do Supabase não configuradas! Verifique .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
