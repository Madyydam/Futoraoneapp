import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing Supabase credentials in .env file');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function applyMigration() {
    console.log('🔧 Applying RLS fix migration...');

    try {
        // Drop the problematic recursive policy
        const { error: dropError } = await supabase.rpc('exec_sql', {
            sql: `
        drop policy if exists "Users can view participants of their conversations" on public.conversation_participants;
        
        create policy "Users can view conversation participants"
          on public.conversation_participants for select
          using (true);
      `
        });

        if (dropError) {
            // If rpc doesn't work, try direct SQL execution
            console.log('⚠️  RPC method failed, trying alternative approach...');

            // Try using the REST API directly
            const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_SERVICE_KEY,
                    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
                },
                body: JSON.stringify({
                    sql: `
            drop policy if exists "Users can view participants of their conversations" on public.conversation_participants;
            
            create policy "Users can view conversation participants"
              on public.conversation_participants for select
              using (true);
          `
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        }

        console.log('✅ Migration applied successfully!');
        console.log('✨ You can now send messages in the app!');
    } catch (error) {
        console.error('❌ Error applying migration:', error);
        console.log('\n📝 Manual steps required:');
        console.log('Please contact Lovable support or run this SQL manually:');
        console.log(`
drop policy if exists "Users can view participants of their conversations" on public.conversation_participants;

create policy "Users can view conversation participants"
  on public.conversation_participants for select
  using (true);
    `);
    }
}

applyMigration();
