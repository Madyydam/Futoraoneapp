import { supabase } from "@/integrations/supabase/client";

const ONESIGNAL_REST_API_KEY = import.meta.env.VITE_ONESIGNAL_REST_API_KEY;
const ONESIGNAL_APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID;

export const sendPushNotification = async (userId: string, message: string) => {
    try {
        // 1. Get the user's OneSignal Player ID and digest preference from Supabase
        const { data: userProfile, error } = await supabase
            .from('profiles')
            .select('one_signal_player_id, digest_mode')
            .eq('id', userId)
            .single();

        const profile = userProfile as any;

        if (error || !profile?.one_signal_player_id) {
            console.log('User does not have a OneSignal Player ID');
            return;
        }

        // If digest mode is enabled, skip immediate push notification
        if (profile.digest_mode) {
            console.log('User has digest mode enabled. Skipping immediate push.');
            return;
        }

        // 2. Send notification via OneSignal REST API
        const response = await fetch("https://onesignal.com/api/v1/notifications", {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Authorization": `Basic ${ONESIGNAL_REST_API_KEY}`
            },
            body: JSON.stringify({
                app_id: ONESIGNAL_APP_ID,
                include_player_ids: [profile.one_signal_player_id],
                contents: { en: message },
                headings: { en: "FutoraOne" }
            })
        });

        const result = await response.json();
        console.log('Notification sent:', result);

    } catch (error) {
        console.error('Error sending push notification:', error);
    }
};
