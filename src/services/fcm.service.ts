/**
 * Firebase Cloud Messaging (FCM) Service
 * Handles push notification registration and token management
 */

import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { supabase } from '@/integrations/supabase/client';

// Firebase configuration - Replace with your Firebase project credentials
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
let messaging: any = null;

try {
    messaging = getMessaging(app);
} catch (error) {
    console.log('FCM not supported in this environment:', error);
}

/**
 * Request notification permission and get FCM token
 * @returns FCM token or null
 */
export const requestNotificationPermission = async (): Promise<string | null> => {
    try {
        // Check if browser supports notifications
        if (!('Notification' in window)) {
            console.log('This browser does not support notifications');
            return null;
        }

        // Request permission
        const permission = await Notification.requestPermission();

        if (permission !== 'granted') {
            console.log('Notification permission denied');
            return null;
        }

        // Get FCM token
        if (!messaging) {
            console.log('Messaging not initialized');
            return null;
        }

        const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
        const token = await getToken(messaging, { vapidKey });

        console.log('FCM Token obtained:', token);
        return token;

    } catch (error) {
        console.error('Error getting FCM token:', error);
        return null;
    }
};

/**
 * Save FCM token to user profile in Supabase
 * @param userId User ID
 * @param fcmToken FCM token
 */
export const saveFCMToken = async (userId: string, fcmToken: string): Promise<void> => {
    try {
        const { error } = await supabase
            .from('profiles')
            .update({ fcm_token: fcmToken })
            .eq('id', userId);

        if (error) {
            console.error('Error saving FCM token:', error);
            throw error;
        }

        console.log('FCM token saved successfully');
    } catch (error) {
        console.error('Error in saveFCMToken:', error);
        throw error;
    }
};

/**
 * Initialize FCM and setup message listener
 * @param userId Current user ID
 */
export const initializeFCM = async (userId: string): Promise<void> => {
    try {
        // Request permission and get token
        const token = await requestNotificationPermission();

        if (token) {
            // Save token to database
            await saveFCMToken(userId, token);

            // Listen for foreground messages
            if (messaging) {
                onMessage(messaging, (payload) => {
                    console.log('Foreground message received:', payload);

                    // Show notification
                    if (payload.notification) {
                        new Notification(payload.notification.title || 'FutoraOne', {
                            body: payload.notification.body,
                            icon: '/icon-192.png',
                        });
                    }
                });
            }
        }
    } catch (error) {
        console.error('Error initializing FCM:', error);
    }
};

/**
 * Check if notifications are enabled
 */
export const areNotificationsEnabled = (): boolean => {
    if (!('Notification' in window)) {
        return false;
    }
    return Notification.permission === 'granted';
};

/**
 * Remove FCM token from user profile
 * @param userId User ID
 */
export const removeFCMToken = async (userId: string): Promise<void> => {
    try {
        const { error } = await supabase
            .from('profiles')
            .update({ fcm_token: null })
            .eq('id', userId);

        if (error) {
            console.error('Error removing FCM token:', error);
            throw error;
        }

        console.log('FCM token removed successfully');
    } catch (error) {
        console.error('Error in removeFCMToken:', error);
        throw error;
    }
};
