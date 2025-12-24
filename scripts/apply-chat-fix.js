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

async function applyChatFix() {
    console.log('🔧 Applying Chat RLS fix to conversation_participants table...\n');

    const sqlQueries = [
        // Fix recursive policy
        `DROP POLICY IF EXISTS "Users can view participants of their conversations" ON public.conversation_participants;`,
        `CREATE POLICY "Users can view conversation participants" ON public.conversation_participants FOR SELECT USING (true);`
    ];

    for (const query of sqlQueries) {
        console.log(`Executing: ${query}`);
        const { error } = await supabase.rpc('exec_sql', { query });

        if (error) {
            console.error(`❌ Error: ${error.message}`);
        } else {
            console.log('✅ Success');
        }
    }

    console.log('\n✨ Chat RLS fix applied! Please refresh your app.');
}

applyChatFix().catch(console.error);
