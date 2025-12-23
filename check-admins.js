const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAdmins() {
    const { data, error } = await supabase
        .from('profiles')
        .select('id, username, is_admin')
        .eq('is_admin', true);

    if (error) {
        console.error('Error fetching admins:', error);
        return;
    }

    console.log('Admins list:');
    console.table(data);
}

checkAdmins();
