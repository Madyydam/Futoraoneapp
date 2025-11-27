import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useStartChat = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const startChat = async (userId: string, currentUserId: string) => {
        if (!currentUserId || currentUserId === userId) return;

        setLoading(true);

        try {
            // Check if conversation already exists
            const { data: existingParticipations } = await supabase
                .from("conversation_participants")
                .select("conversation_id")
                .eq("user_id", currentUserId);

            if (existingParticipations) {
                for (const participation of existingParticipations) {
                    const { data: otherParticipant } = await supabase
                        .from("conversation_participants")
                        .select("user_id")
                        .eq("conversation_id", participation.conversation_id)
                        .eq("user_id", userId)
                        .single();

                    if (otherParticipant) {
                        navigate(`/messages/${participation.conversation_id}`);
                        setLoading(false);
                        return;
                    }
                }
            }

            // Create new conversation with client-side ID to bypass RLS select restriction
            const newConversationId = crypto.randomUUID();

            const { error: createError } = await supabase
                .from("conversations")
                .insert({ id: newConversationId });

            if (createError) throw createError;

            // Add participants
            const { error: participantsError } = await supabase
                .from("conversation_participants")
                .insert([
                    { conversation_id: newConversationId, user_id: currentUserId },
                    { conversation_id: newConversationId, user_id: userId }
                ]);

            if (participantsError) throw participantsError;

            navigate(`/messages/${newConversationId}`);
        } catch (error) {
            console.error("Error starting chat:", error);
            toast({
                title: "Error",
                description: "Failed to start conversation. Please try again.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return { startChat, loading };
};
