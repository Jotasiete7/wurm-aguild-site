
import { createClient } from '@supabase/supabase-js';

// Use environment variables for credentials (preferred)
// Fallback to hardcoded values for production builds where env vars might not be injected
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gzhvqprdrtudyokhgxlj.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6aHZxcHJkcnR1ZHlva2hneGxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3NTQ2MTUsImV4cCI6MjA4MzMzMDYxNX0.aSJIhfViQsb0dBjb5bOup49GCrQBt93uSkZySZAXcNo';

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Variáveis de ambiente do Supabase não configuradas! Verifique .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
