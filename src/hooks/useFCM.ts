/**
 * React Hook for Firebase Cloud Messaging
 * Initialize FCM when user logs in
 */

import { useEffect } from 'react';
import { initializeFCM } from '@/services/fcm.service';
import type { User } from '@supabase/supabase-js';

export const useFCM = (user: User | null) => {
    useEffect(() => {
        if (user) {
            // Initialize FCM and request permission
            initializeFCM(user.id).catch(error => {
                console.error('Failed to initialize FCM:', error);
            });
        }
    }, [user]);
};
