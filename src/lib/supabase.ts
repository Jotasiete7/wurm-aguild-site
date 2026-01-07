
import { createClient } from '@supabase/supabase-js';

// NOTA: Em produção, usar import.meta.env
const supabaseUrl = 'https://gzhvqprdrtudyokhgxlj.supabase.co';
// A chave fornecida parece curta/diferente do padrão JWT (ey...), mas vamos configurar.
// Se falhar, pediremos para verificar a chave 'anon key' no dashboard.
const supabaseKey = 'sb_publishable_B3Gpy22WDnp9PIXP99hvKA_KDy79Qmx';

export const supabase = createClient(supabaseUrl, supabaseKey);
