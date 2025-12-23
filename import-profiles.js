import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import csv from 'csv-parser';

// Your Supabase credentials
const SUPABASE_URL = 'https://sbzsgeokspmkewrmuqgi.supabase.co';
const SUPABASE_SERVICE_KEY = 'YOUR_SERVICE_ROLE_KEY_HERE'; // Get from Supabase Dashboard > Settings > API

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function importProfiles(csvFilePath) {
    const profiles = [];

    // Read CSV file
    fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
            profiles.push(row);
        })
        .on('end', async () => {
            console.log(`Importing ${profiles.length} profiles...`);

            for (const profile of profiles) {
                try {
                    // Step 1: Create auth user
                    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
                        email: profile.email,
                        email_confirm: true,
                        password: 'TempPassword123!', // They'll need to reset
                        user_metadata: {
                            username: profile.username,
                            full_name: profile.full_name
                        }
                    });

                    if (authError) {
                        console.error(`Failed to create auth user for ${profile.email}:`, authError.message);
                        continue;
                    }

                    // Step 2: Insert profile with the auth user's ID
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .insert({
                            id: authUser.user.id,
                            username: profile.username,
                            full_name: profile.full_name,
                            bio: profile.bio || '',
                            avatar_url: profile.avatar_url || null,
                            // Add other fields from your CSV
                        });

                    if (profileError) {
                        console.error(`Failed to create profile for ${profile.email}:`, profileError.message);
                    } else {
                        console.log(`✓ Imported ${profile.email}`);
                    }

                } catch (error) {
                    console.error(`Error importing ${profile.email}:`, error.message);
                }
            }

            console.log('Import complete!');
        });
}

// Usage: node import-profiles.js path/to/your/profiles.csv
const csvPath = process.argv[2] || 'profiles.csv';
importProfiles(csvPath);
