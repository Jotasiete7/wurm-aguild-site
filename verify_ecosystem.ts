
import { createClient } from '@supabase/supabase-js';

// Load from .env.local logic simulation
const SUPABASE_URL = 'https://gzhvqprdrtudyokhgxlj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6aHZxcHJkcnR1ZHlva2hneGxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3NTQ2MTUsImV4cCI6MjA4MzMzMDYxNX0.aSJIhfViQsb0dBjb5bOup49GCrQBt93uSkZySZAXcNo';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkTable(tableName: string, publicReadExpected: boolean = false) {
    process.stdout.write(`Checking '${tableName}'... `);

    // Attempt to select 1 row
    const { data, error } = await supabase.from(tableName).select('count', { count: 'exact', head: true });

    if (!error) {
        process.stdout.write(`✅ EXISTS (Accessible)\n`);
        return { name: tableName, status: 'OK', accessible: true };
    }

    // Analyse error
    // Postgres Error 42P01: relation "public.tablename" does not exist
    if (error.code === '42P01' || error.message.includes('does not exist')) {
        process.stdout.write(`❌ MISSING (Needs SQL)\n`);
        return { name: tableName, status: 'MISSING', accessible: false };
    }

    // RLS Error (401/403) means table EXISTS but is protected
    if (error.code === '42501' || error.code === 'PGRST301') {
        process.stdout.write(`🔒 EXISTS (Protected by RLS)\n`);
        return { name: tableName, status: 'OK_PROTECTED', accessible: false };
    }

    console.log(`\n   ❓ Unknown Error: ${error.code} - ${error.message}`);
    return { name: tableName, status: 'ERROR', error: error.message };
}

async function verifyEcosystem() {
    console.log("--- 🌍 A Guilda Ecosystem Verification ---\n");

    const results = [];

    // 1. SSO Infrastructure
    console.log("[SSO Core]");
    results.push(await checkTable('sso_clients', true));
    results.push(await checkTable('sso_codes', false));
    results.push(await checkTable('profiles', false));

    // 2. Apps
    console.log("\n[Apps Data]");
    results.push(await checkTable('recipes', true)); // Public verified read

    // 3. Hub Legacy/Features
    console.log("\n[Hub Features]");
    results.push(await checkTable('services', true));
    results.push(await checkTable('map_pins', true));
    results.push(await checkTable('resources', true));

    // 4. Verify Registered Clients
    console.log("\n[Configuration Check]");
    const { data: clients } = await supabase.from('sso_clients').select('*');
    if (clients && clients.length > 0) {
        console.log(`✅ sso_clients populated. Found ${clients.length} apps:`);
        clients.forEach(c => console.log(`   - ${c.client_name} (ID: ${c.client_id})`));
    } else {
        if (results.find(r => r.name === 'sso_clients')?.status === 'OK') {
            console.log("⚠️ sso_clients is empty! (Did you run the INSERT command?)");
        }
    }

    console.log("\n--- Summary ---");
    const missing = results.filter(r => r.status === 'MISSING');
    if (missing.length > 0) {
        console.log("❌ The following tables are MISSING:");
        missing.forEach(m => console.log(`   - ${m.name}`));
        console.log("\nAction Plan:");
        console.log("1. Run 'recipes_setup.sql' for recipes.");
        console.log("2. Run '20240131_init_sso.sql' for SSO tables (if missing).");
    } else {
        console.log("✅ All Database Tables Verified!");
    }
}

verifyEcosystem();
