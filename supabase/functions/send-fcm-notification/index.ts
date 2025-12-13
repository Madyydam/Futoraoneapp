/**
 * Supabase Edge Function to send FCM notifications
 * This keeps Firebase server key secure on the backend
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const FIREBASE_SERVER_KEY = Deno.env.get('FIREBASE_SERVER_KEY');
const FCM_ENDPOINT = 'https://fcm.googleapis.com/fcm/send';

interface NotificationRequest {
    tokens: string[];
    title: string;
    body: string;
    data?: Record<string, any>;
}

interface FCMResponse {
    success: number;
    failure: number;
    results: any[];
}

serve(async (req) => {
    try {
        // Only allow POST requests
        if (req.method !== 'POST') {
            return new Response(
                JSON.stringify({ error: 'Method not allowed' }),
                { status: 405, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Check authentication
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(
                JSON.stringify({ error: 'Missing authorization header' }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Parse request body
        const { tokens, title, body, data = {} }: NotificationRequest = await req.json();

        // Validate input
        if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
            return new Response(
                JSON.stringify({ error: 'Invalid tokens array' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        if (!title || !body) {
            return new Response(
                JSON.stringify({ error: 'Title and body are required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Check if Firebase server key is configured
        if (!FIREBASE_SERVER_KEY) {
            console.error('FIREBASE_SERVER_KEY not configured');
            return new Response(
                JSON.stringify({ error: 'Server configuration error' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Send notifications to all tokens
        const results: FCMResponse[] = [];

        for (const token of tokens) {
            try {
                const fcmPayload = {
                    to: token,
                    notification: {
                        title,
                        body,
                        sound: 'default',
                        badge: 1,
                    },
                    data: {
                        ...data,
                        click_action: 'FLUTTER_NOTIFICATION_CLICK',
                    },
                    priority: 'high',
                };

                const response = await fetch(FCM_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `key=${FIREBASE_SERVER_KEY}`,
                    },
                    body: JSON.stringify(fcmPayload),
                });

                const result = await response.json();
                results.push(result);

                console.log(`Notification sent to token: ${token.substring(0, 20)}...`, result);
            } catch (error) {
                console.error(`Error sending to token ${token.substring(0, 20)}...`, error);
                results.push({
                    success: 0,
                    failure: 1,
                    results: [{ error: error.message }],
                });
            }
        }

        // Calculate totals
        const totalSuccess = results.reduce((sum, r) => sum + (r.success || 0), 0);
        const totalFailure = results.reduce((sum, r) => sum + (r.failure || 0), 0);

        return new Response(
            JSON.stringify({
                message: 'Notifications processed',
                total: tokens.length,
                success: totalSuccess,
                failure: totalFailure,
                results,
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );

    } catch (error) {
        console.error('Error in send-fcm-notification:', error);
        return new Response(
            JSON.stringify({
                error: 'Internal server error',
                details: error.message
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
});
