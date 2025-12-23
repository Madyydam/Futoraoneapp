import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyXP() {
    console.log("Verifying XP Triggers...");

    // Get a random user to test with
    const { data: profile } = await supabase
        .from('profiles')
        .select('id, xp, level, username')
        .limit(1)
        .single();

    if (!profile) {
        console.error("No profiles found to test with.");
        return;
    }

    console.log(`Testing with user: ${profile.username} (ID: ${profile.id})`);
    console.log(`Initial XP: ${profile.xp}, Level: ${profile.level}`);

    // Insert a dummy post
    console.log("Inserting a dummy post...");
    const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
            user_id: profile.id,
            content: 'Verification post ' + new Date().toISOString()
        })
        .select()
        .single();

    if (postError) {
        console.error("Error inserting post:", postError.message);
        return;
    }

    // Wait 1 second for trigger to settle
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check profile again
    const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('xp, level')
        .eq('id', profile.id)
        .single();

    console.log(`Final XP: ${updatedProfile.xp}, Level: ${updatedProfile.level}`);

    if (updatedProfile.xp > profile.xp) {
        console.log("✅ XP Trigger Works! XP increased by", updatedProfile.xp - profile.xp);
    } else {
        console.log("❌ XP Trigger Failed. XP did not increase.");
    }

    // Cleanup
    await supabase.from('posts').delete().eq('id', post.id);
}

verifyXP();
