
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // Needs to be set in .env
const ONESIGNAL_APP_ID = process.env.VITE_ONESIGNAL_APP_ID;
const ONESIGNAL_REST_API_KEY = process.env.VITE_ONESIGNAL_REST_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
    console.error('Missing environment variables. Please set VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, VITE_ONESIGNAL_APP_ID, and VITE_ONESIGNAL_REST_API_KEY.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function sendDigest() {
    console.log('Starting digest send...');

    // 1. Fetch users with digest_mode enabled
    const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, one_signal_player_id, last_digest_at')
        .eq('digest_mode', true)
        .not('one_signal_player_id', 'is', null);

    if (usersError) {
        console.error('Error fetching users:', usersError);
        return;
    }

    console.log(`Found ${users.length} users with digest mode enabled.`);

    for (const user of users) {
        // 2. Fetch unread notifications since last digest
        const lastDigest = user.last_digest_at || new Date(0).toISOString();

        const { data: notifications, error: notifError } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_read', false)
            .gt('created_at', lastDigest);

        if (notifError) {
            console.error(`Error fetching notifications for user ${user.id}:`, notifError);
            continue;
        }

        if (!notifications || notifications.length === 0) {
            console.log(`No new notifications for user ${user.id}`);
            continue;
        }

        // 3. Create summary message
        const likeCount = notifications.filter(n => n.type === 'like').length;
        const commentCount = notifications.filter(n => n.type === 'comment').length;
        const followCount = notifications.filter(n => n.type === 'follow').length;
        const otherCount = notifications.length - likeCount - commentCount - followCount;

        let message = "Here is your daily summary:\n";
        if (likeCount > 0) message += `• ${likeCount} new likes\n`;
        if (commentCount > 0) message += `• ${commentCount} new comments\n`;
        if (followCount > 0) message += `• ${followCount} new followers\n`;
        if (otherCount > 0) message += `• ${otherCount} other notifications\n`;

        console.log(`Sending digest to user ${user.id}: ${message}`);

        // 4. Send OneSignal notification
        try {
            const response = await fetch("https://onesignal.com/api/v1/notifications", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                    "Authorization": `Basic ${ONESIGNAL_REST_API_KEY}`
                },
                body: JSON.stringify({
                    app_id: ONESIGNAL_APP_ID,
                    include_player_ids: [user.one_signal_player_id],
                    contents: { en: message },
                    headings: { en: "FutoraOne Daily Digest" }
                })
            });

            const result = await response.json();
            console.log('Notification sent:', result);

            // 5. Update last_digest_at
            await supabase
                .from('profiles')
                .update({ last_digest_at: new Date().toISOString() })
                .eq('id', user.id);

        } catch (error) {
            console.error(`Error sending push to user ${user.id}:`, error);
        }
    }

    console.log('Digest send complete.');
}

sendDigest();
