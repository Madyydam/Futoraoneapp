import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

interface UserPresence {
    is_online: boolean;
    last_seen: string;
}

interface UserPresenceContextType {
    onlineUsers: Record<string, UserPresence>;
}

const UserPresenceContext = createContext<UserPresenceContextType | undefined>(undefined);

export const UserPresenceProvider = ({ children }: { children: ReactNode }) => {
    const [onlineUsers, setOnlineUsers] = useState<Record<string, UserPresence>>({});

    useEffect(() => {
        // Subscribe to ALL changes in user_presence table
        // This reduces the number of WebSocket connections to 1, instead of N per user card.

        // Initial fetch of online users could be added here if needed, 
        // but typically we just rely on updates or fetch specific ones via standard queries.
        // For now, we will rely on Realtime to populate this cache.

        const channel = supabase
            .channel("global-presence")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "user_presence",
                },
                (payload) => {
                    if (payload.new) {
                        const newData = payload.new as any;
                        const userId = newData.user_id;

                        setOnlineUsers((prev) => ({
                            ...prev,
                            [userId]: {
                                is_online: newData.is_online,
                                last_seen: newData.last_seen,
                            },
                        }));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // Use a separate effect to handle the CURRENT user's heartbeat
    useEffect(() => {
        let interval: NodeJS.Timeout;
        let mounted = true;

        const setupHeartbeat = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user || !mounted) return;

            const updatePresence = async (isOnline: boolean) => {
                const timestamp = new Date().toISOString();

                // Upsert is cleaner than check-then-update
                const { error } = await supabase
                    .from("user_presence")
                    .upsert({
                        user_id: user.id,
                        is_online: isOnline,
                        last_seen: timestamp
                    }, { onConflict: 'user_id' });

                if (error) {
                    console.error("Error updating presence:", error);
                }
            };

            // Initial online set
            await updatePresence(true);

            // Heartbeat every 30 seconds
            interval = setInterval(() => {
                if (mounted) updatePresence(true);
            }, 30000);

            // Cleanup function for when user logs out or app unmounts (best effort)
            return () => {
                if (mounted && user) {
                    // We can't async await here reliably, but we try
                    supabase.from("user_presence").upsert({
                        user_id: user.id,
                        is_online: false,
                        last_seen: new Date().toISOString()
                    }).then(() => { });
                }
            };
        };

        const cleanupPromise = setupHeartbeat();

        return () => {
            mounted = false;
            if (interval) clearInterval(interval);
            // cleanupPromise could be handled but useEffect cleanup is synchronous
        };
    }, []);

    return (
        <UserPresenceContext.Provider value={{ onlineUsers }}>
            {children}
        </UserPresenceContext.Provider>
    );
};

export const useUserPresenceContext = () => {
    const context = useContext(UserPresenceContext);
    if (context === undefined) {
        throw new Error("useUserPresenceContext must be used within a UserPresenceProvider");
    }
    return context;
};
