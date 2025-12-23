import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
    const { data, error } = await supabase.from('profiles').select('*').limit(1);
    if (error) {
        fs.writeFileSync('schema-output.json', JSON.stringify({ error }, null, 2));
    } else {
        fs.writeFileSync('schema-output.json', JSON.stringify({
            columns: Object.keys(data[0] || {}),
            sample: data[0]
        }, null, 2));
    }
}
check();
