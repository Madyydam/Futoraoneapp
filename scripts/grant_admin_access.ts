
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase URL or Service Role Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function grantAdminAccess() {
    const email = 'madhurdhadve@gmail.com';
    console.log(`Granting admin access to ${email}...`);

    // 1. Find the user ID
    // Note: auth.users is not directly queryable via client usually unless using admin api
    // But we can check profiles table if we assume profile exists (which we fixed earlier)

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

    if (profileError || !profile) {
        console.error("Profile not found:", profileError);

        // Fallback: Try to find by listing users if profile lookup by email failed (rare but possible if RLS blocks or something, though service role should bypass)
        const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
        if (authError) {
            console.error("Auth list users failed:", authError);
            return;
        }

        const user = users.find(u => u.email === email);
        if (!user) {
            console.error("User not found in Auth system.");
            return;
        }

        console.log(`Found user in Auth: ${user.id}. Updating profile...`);

        const { error: updateError } = await supabase
            .from('profiles')
            .update({ is_admin: true, is_verified: true })
            .eq('id', user.id);

        if (updateError) console.error("Update failed:", updateError);
        else console.log("Admin access granted successfully (via Auth ID match).");

        return;
    }

    // 2. Update the profile
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ is_admin: true, is_verified: true })
        .eq('id', profile.id);

    if (updateError) {
        console.error('Error updating profile:', updateError);
    } else {
        console.log(`Successfully granted admin access to ${email}`);
    }
}

grantAdminAccess();
