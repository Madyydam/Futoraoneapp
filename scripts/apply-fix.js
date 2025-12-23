import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load env vars
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runfix() {
    const migrationPath = path.join(__dirname, '../supabase/migrations/20251222_fix_signup_trigger.sql');
    console.log(`Resource: ${migrationPath}`);

    if (!fs.existsSync(migrationPath)) {
        console.error('File not found!');
        return;
    }

    const sql = fs.readFileSync(migrationPath, 'utf8');
    console.log('Applying Fix...');

    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
        console.error('❌ Error applying fix:', error);
    } else {
        console.log('✅ Fix Applied Successfully! Signup should work now.');
    }
}

runfix();
