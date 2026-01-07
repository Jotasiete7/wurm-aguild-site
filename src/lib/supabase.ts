
import { createClient } from '@supabase/supabase-js';

// Use environment variables for credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Variáveis de ambiente do Supabase não configuradas! Verifique .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
