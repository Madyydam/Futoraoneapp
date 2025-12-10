import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

// Cache for mutual followers data
const mutualFollowersCache = new Map<string, { count: number, timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useMutualFollowers = (currentUserId: string | undefined, profileUserId: string | undefined) => {
  const [mutualCount, setMutualCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchMutualFollowers = useCallback(async () => {
    if (!currentUserId || !profileUserId || currentUserId === profileUserId) {
      setMutualCount(0);
      setLoading(false);
      return;
    }

    // Create cache key
    const cacheKey = `${currentUserId}-${profileUserId}`;

    // Check cache first
    const cached = mutualFollowersCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setMutualCount(cached.count);
      setLoading(false);
      return;
    }

    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      // OPTIMIZED: Use a single query with better filtering
      // Get followers who follow both users in one go
      const { data, error } = await supabase
        .from("follows")
        .select("follower_id")
        .in("following_id", [currentUserId, profileUserId]);

      if (error) {
        console.error("Error fetching mutual followers:", error);
        setLoading(false);
        return;
      }

      // Count how many followers appear twice (they follow both users)
      const followerCounts = new Map<string, number>();
      data?.forEach(({ follower_id }) => {
        followerCounts.set(follower_id, (followerCounts.get(follower_id) || 0) + 1);
      });

      // Mutual followers are those who follow both users
      const mutuals = Array.from(followerCounts.values()).filter((count) => count === 2).length;

      setMutualCount(mutuals);

      // Store in cache
      mutualFollowersCache.set(cacheKey, {
        count: mutuals,
        timestamp: Date.now()
      });

      setLoading(false);
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error("Error fetching mutual followers:", error);
      }
      setLoading(false);
    }
  }, [currentUserId, profileUserId]);

  useEffect(() => {
    fetchMutualFollowers();

    // Cleanup function to abort ongoing requests
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchMutualFollowers]);

  return { mutualCount, loading, refetch: fetchMutualFollowers };
};

// Export function to clear cache if needed (e.g., after follow/unfollow)
export const clearMutualFollowersCache = () => {
  mutualFollowersCache.clear();
};
