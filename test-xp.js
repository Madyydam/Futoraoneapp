import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTriggers() {
    const { data, error } = await supabase.from('posts').select('*').limit(1); // Test connection
    if (error) {
        fs.writeFileSync('trigger-output.json', JSON.stringify({ error }, null, 2));
        return;
    }

    const { data: triggers, error: triggerError } = await supabase.rpc('get_table_triggers', { table_name: 'posts' });
    // If no RPC, try querying via management or just check if give_xp works.

    // Let's actually test give_xp directly.
    const { data: profile } = await supabase.from('profiles').select('id, xp').limit(1).single();
    if (profile) {
        console.log('Testing give_xp for user:', profile.id, 'current xp:', profile.xp);
        const { error: xpError } = await supabase.rpc('give_xp', { user_id: profile.id, amount: 10 });
        if (xpError) {
            fs.writeFileSync('trigger-output.json', JSON.stringify({ xpError }, null, 2));
        } else {
            const { data: updatedProfile } = await supabase.from('profiles').select('xp').eq('id', profile.id).single();
            fs.writeFileSync('trigger-output.json', JSON.stringify({
                success: true,
                before: profile.xp,
                after: updatedProfile.xp
            }, null, 2));
        }
    }
}
checkTriggers();
