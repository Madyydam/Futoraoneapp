import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testDeletion() {
    const targetPostId = 'TARGET_POST_ID_HERE'; // I should get one from listing
    const targetUserId = '1268349c-e3da-4d38-a58f-cad8de4c0d2c';

    console.log('Fetching a sample post to delete...');
    const { data: posts, error: fetchError } = await supabase
        .from('posts')
        .select('id, user_id, content')
        .limit(1);

    if (fetchError || !posts.length) {
        console.error('Error fetching posts:', fetchError);
        return;
    }

    const post = posts[0];
    console.log(`Attempting to delete post ${post.id} (Author: ${post.user_id}) as Admin...`);

    // We can't easily impersonate a user with Service Role key in a way that respects RLS 
    // unless we use a different approach. Service Role bypasses RLS.
    // To test RLS, we'd need a JWT for the user.

    // Actually, let's just check the is_admin status of the user one more time.
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, is_admin')
        .eq('id', targetUserId)
        .single();

    if (profileError) {
        console.error('Error fetching profile:', profileError);
    } else {
        console.log('Current Admin Status:', profile);
    }
}

testDeletion();
