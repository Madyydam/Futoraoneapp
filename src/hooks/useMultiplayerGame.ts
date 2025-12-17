import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { toast } from 'sonner';

type GameState = any;

interface UseMultiplayerGameProps {
    gameId: string;
    roomId: string;
    initialState: GameState;
    onStateUpdate: (newState: GameState) => void;
    onPlayerJoin?: (payload: any) => void;
}

export const useMultiplayerGame = ({
    gameId,
    roomId,
    initialState,
    onStateUpdate,
    onPlayerJoin
}: UseMultiplayerGameProps) => {
    const [isConnected, setIsConnected] = useState(false);
    const [playerCount, setPlayerCount] = useState(0);
    const channelRef = useRef<RealtimeChannel | null>(null);
    const [myPlayerId, setMyPlayerId] = useState<string>('');

    useEffect(() => {
        if (!roomId) return;

        const setupChannel = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            setMyPlayerId(user.id);

            const channel = supabase.channel(`game_${gameId}_${roomId}`, {
                config: {
                    presence: {
                        key: user.id,
                    },
                },
            });

            channel
                .on('broadcast', { event: 'game_state' }, ({ payload }) => {
                    onStateUpdate(payload);
                })
                .on('presence', { event: 'sync' }, () => {
                    const state = channel.presenceState();
                    const count = Object.keys(state).length;
                    setPlayerCount(count);

                    if (onPlayerJoin) {
                        onPlayerJoin(state);
                    }
                })
                .subscribe((status) => {
                    if (status === 'SUBSCRIBED') {
                        setIsConnected(true);
                        channel.track({ user_id: user.id, online_at: new Date().toISOString() });
                    } else {
                        setIsConnected(false);
                    }
                });

            channelRef.current = channel;
        };

        setupChannel();

        return () => {
            channelRef.current?.unsubscribe();
        };
    }, [roomId, gameId]); // Removed onStateUpdate dependency to avoid re-subscribing

    const sendMove = useCallback((newState: GameState) => {
        channelRef.current?.send({
            type: 'broadcast',
            event: 'game_state',
            payload: newState,
        });
        // We also update local state immediately for responsiveness
        onStateUpdate(newState);
    }, [onStateUpdate]);

    return {
        isConnected,
        playerCount,
        sendMove,
        myPlayerId
    };
};
