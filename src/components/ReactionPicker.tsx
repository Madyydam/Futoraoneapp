import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Reaction {
    id: string;
    emoji: string;
    user_id: string;
    profiles?: {
        username: string;
        full_name: string;
        avatar_url: string | null;
    };
}

interface ReactionPickerProps {
    postId: string;
    currentUserId: string | undefined;
    reactions: Reaction[];
    onReactionChange: () => void;
}

const EMOJIS = ['👍', '❤️', '🔥', '💡', '🎉'];

export const ReactionPicker = ({
    postId,
    currentUserId,
    reactions,
    onReactionChange,
}: ReactionPickerProps) => {
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
    const { toast } = useToast();

    // Count reactions by emoji
    const reactionCounts = EMOJIS.map((emoji) => ({
        emoji,
        count: reactions.filter((r) => r.emoji === emoji).length,
        users: reactions.filter((r) => r.emoji === emoji),
    }));

    // Check if current user reacted with specific emoji
    const hasUserReacted = (emoji: string) => {
        return reactions.some((r) => r.emoji === emoji && r.user_id === currentUserId);
    };

    const toggleReaction = async (emoji: string) => {
        if (!currentUserId || loading) return;

        setLoading(true);
        try {
            const existingReaction = reactions.find(
                (r) => r.emoji === emoji && r.user_id === currentUserId
            );

            if (existingReaction) {
                // Remove reaction
                const { error } = await supabase
                    .from("post_reactions")
                    .delete()
                    .eq("id", existingReaction.id);

                if (error) throw error;
            } else {
                // Add reaction
                const { error } = await supabase
                    .from("post_reactions")
                    .insert({ post_id: postId, user_id: currentUserId, emoji });

                if (error) throw error;
            }

            onReactionChange();
        } catch (error) {
            console.error("Error toggling reaction:", error);
            toast({
                title: "Error",
                description: "Failed to update reaction",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const showReactors = (emoji: string) => {
        const reactors = reactions.filter((r) => r.emoji === emoji);
        if (reactors.length > 0) {
            setSelectedEmoji(emoji);
            setModalOpen(true);
        }
    };

    const selectedReactors = selectedEmoji
        ? reactions.filter((r) => r.emoji === selectedEmoji)
        : [];

    return (
        <>
            <div className="flex flex-wrap gap-1 sm:gap-2 items-center mt-2">
                {reactionCounts.map(({ emoji, count }) => (
                    <Button
                        key={emoji}
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleReaction(emoji)}
                        onContextMenu={(e) => {
                            e.preventDefault();
                            showReactors(emoji);
                        }}
                        className={`h-8 px-2 sm:px-3 text-xs sm:text-sm transition-all hover:scale-110 ${hasUserReacted(emoji)
                                ? "bg-primary/10 border border-primary text-primary"
                                : "hover:bg-muted"
                            }`}
                        disabled={loading}
                    >
                        <span className="text-base sm:text-lg">{emoji}</span>
                        {count > 0 && (
                            <span className="ml-1 font-semibold text-xs sm:text-sm">
                                {count}
                            </span>
                        )}
                    </Button>
                ))}
            </div>

            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <span className="text-2xl">{selectedEmoji}</span>
                            <span>Reactions</span>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {selectedReactors.map((reactor) => (
                            <div
                                key={reactor.id}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                            >
                                <Avatar className="h-10 w-10">
                                    <AvatarImage
                                        src={reactor.profiles?.avatar_url || undefined}
                                        loading="lazy"
                                    />
                                    <AvatarFallback>
                                        {reactor.profiles?.username?.[0]?.toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm truncate">
                                        {reactor.profiles?.full_name}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        @{reactor.profiles?.username}
                                    </p>
                                </div>
                                <span className="text-xl">{selectedEmoji}</span>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};
