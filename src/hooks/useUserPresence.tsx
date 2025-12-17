import { useUserPresenceContext } from "@/contexts/UserPresenceContext";

export const useUserPresence = (userId: string | undefined) => {
  const { onlineUsers } = useUserPresenceContext();

  if (!userId) {
    return { isOnline: false, lastSeen: null };
  }

  const userData = onlineUsers[userId];

  return {
    isOnline: userData?.is_online ?? false,
    lastSeen: userData?.last_seen ?? null,
  };
};

export const useCurrentUserPresence = () => {
  // This functionality is now handled by the UserPresenceProvider
  // Keeping this hook as a no-op or for backward compatibility if needed
  return { currentUserId: undefined };
};
