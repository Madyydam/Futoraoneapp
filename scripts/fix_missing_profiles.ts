
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

async function fixMissingProfiles() {
    console.log('Starting profile fix...');

    // 1. Get all users from auth
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError) {
        console.error('Error fetching users:', usersError);
        return;
    }

    console.log(`Found ${users.length} users in auth.`);

    // 2. Get all profiles
    const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email');

    if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
    }

    console.log(`Found ${profiles.length} profiles.`);

    // 3. Find missing profiles
    const profileIds = new Set(profiles.map(p => p.id));
    const missingUsers = users.filter(u => !profileIds.has(u.id));

    console.log(`Found ${missingUsers.length} users without profiles.`);

    if (missingUsers.length === 0) {
        console.log('All users have profiles. No action needed.');
        return;
    }

    // 4. Create missing profiles
    for (const user of missingUsers) {
        console.log(`Creating profile for user: ${user.email} (${user.id})`);

        const username = user.user_metadata?.username || user.email?.split('@')[0] || 'user';
        const fullName = user.user_metadata?.full_name || user.user_metadata?.name || username;
        const avatarUrl = user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`;

        const { error: insertError } = await supabase
            .from('profiles')
            .insert({
                id: user.id,
                email: user.email,
                username: username, // Note: You might need to handle uniqueness conflicts here if valid usernames duplicate
                full_name: fullName,
                avatar_url: avatarUrl
            });

        if (insertError) {
            console.error(`Failed to create profile for ${user.email}:`, insertError);
            // Fallback: Try with random suffix if username conflict
            if (insertError.code === '23505') { // unique_violation
                const newUsername = `${username}_${Math.floor(Math.random() * 1000)}`;
                console.log(`Retrying with username: ${newUsername}`);
                const { error: retryError } = await supabase
                    .from('profiles')
                    .insert({
                        id: user.id,
                        email: user.email,
                        username: newUsername,
                        full_name: fullName,
                        avatar_url: avatarUrl
                    });
                if (retryError) console.error("Retry failed:", retryError);
            }
        } else {
            console.log(`Successfully created profile for ${user.email}`);
        }
    }

    console.log('Profile fix completed.');
}

fixMissingProfiles();
