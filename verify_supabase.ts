
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gzhvqprdrtudyokhgxlj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6aHZxcHJkcnR1ZHlva2hneGxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3NTQ2MTUsImV4cCI6MjA4MzMzMDYxNX0.aSJIhfViQsb0dBjb5bOup49GCrQBt93uSkZySZAXcNo';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function check() {
    console.log("Checking Supabase Connection...");

    // 1. Check sso_clients (Public Read Policy should allow this)
    const { data: clients, error: clientError } = await supabase.from('sso_clients').select('*');
    if (clientError) {
        console.error("❌ Error accessing sso_clients:", clientError.message);
    } else {
        console.log("✅ sso_clients accessible. Count:", clients.length);
        console.log("Clients:", clients);
    }

    // 2. Check recipes (Public Read Verified)
    const { data: recipes, error: recipeError } = await supabase.from('recipes').select('*').limit(1);
    if (recipeError) {
        console.error("❌ Error accessing recipes:", recipeError.message);
        if (recipeError.message.includes('relation "public.recipes" does not exist')) {
            console.error("⚠️ Table 'recipes' likely missing. Run recipes_setup.sql!");
        }
    } else {
        console.log("✅ recipes table accessible.");
    }
}

check();
