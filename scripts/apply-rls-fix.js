// This script applies the RLS fix directly to your Supabase database
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyRLSFix() {
    console.log('🔧 Applying RLS fix to follows and profiles tables...\n');

    const sqlQueries = [
        // Fix follows table policies
        `DROP POLICY IF EXISTS "Users can view all follows" ON follows;`,
        `DROP POLICY IF EXISTS "Enable read access for all users" ON follows;`,
        `CREATE POLICY "Enable read access for all users" ON follows FOR SELECT USING (true);`,

        // Fix profiles table policies
        `DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;`,
        `CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);`
    ];

    for (const query of sqlQueries) {
        console.log(`Executing: ${query.substring(0, 50)}...`);
        const { error } = await supabase.rpc('exec_sql', { query });

        if (error) {
            console.error(`❌ Error: ${error.message}`);
        } else {
            console.log('✅ Success');
        }
    }

    console.log('\n✨ RLS fix applied! Please refresh your app.');
}

applyRLSFix().catch(console.error);
