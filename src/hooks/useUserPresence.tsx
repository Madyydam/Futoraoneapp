import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

export const useUserPresence = (userId: string | undefined) => {
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const updatePresence = async (online: boolean) => {
      const { data: existingPresence } = await supabase
        .from("user_presence")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (existingPresence) {
        await supabase
          .from("user_presence")
          .update({
            is_online: online,
            last_seen: new Date().toISOString(),
          })
          .eq("user_id", userId);
      } else {
        await supabase.from("user_presence").insert({
          user_id: userId,
          is_online: online,
          last_seen: new Date().toISOString(),
        });
      }
    };

    // Fetch initial presence
    const fetchPresence = async () => {
      const { data } = await supabase
        .from("user_presence")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (data) {
        setIsOnline(data.is_online);
        setLastSeen(data.last_seen);
      }
    };

    fetchPresence();

    // Subscribe to presence changes
    const channel = supabase
      .channel(`presence-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_presence",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.new) {
            const newData = payload.new as any;
            setIsOnline(newData.is_online);
            setLastSeen(newData.last_seen);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { isOnline, lastSeen };
};


export const useCurrentUserPresence = () => {
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let mounted = true;

    const setupPresence = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user || !mounted) return;

      setCurrentUserId(user.id);

      // Helper to update presence
      const updatePresence = async (isOnline: boolean) => {
        const { data: existingPresence } = await supabase
          .from("user_presence")
          .select("id")
          .eq("user_id", user.id)
          .single();

        const timestamp = new Date().toISOString();

        if (existingPresence) {
          await supabase
            .from("user_presence")
            .update({ is_online: isOnline, last_seen: timestamp })
            .eq("user_id", user.id);
        } else {
          await supabase
            .from("user_presence")
            .insert({ user_id: user.id, is_online: isOnline, last_seen: timestamp });
        }
      };

      // Set initial online status
      await updatePresence(true);

      // Heartbeat every 30 seconds
      interval = setInterval(() => {
        if (mounted) updatePresence(true);
      }, 30000);
    };

    setupPresence();

    return () => {
      mounted = false;
      if (interval) clearInterval(interval);

      // Attempt to set offline on unmount (best effort)
      if (currentUserId) {
        supabase
          .from("user_presence")
          .update({
            is_online: false,
            last_seen: new Date().toISOString(),
          })
          .eq("user_id", currentUserId)
          .then(() => { });
      }
    };
  }, []); // Empty dependency array as intended

  return { currentUserId };
};
