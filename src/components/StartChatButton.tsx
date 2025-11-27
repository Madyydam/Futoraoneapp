import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useStartChat } from "@/hooks/useStartChat";

interface StartChatButtonProps {
  userId: string;
  currentUserId: string | undefined;
}

export const StartChatButton = ({ userId, currentUserId }: StartChatButtonProps) => {
  const { startChat, loading } = useStartChat();

  if (!currentUserId || currentUserId === userId) {
    return null;
  }

  return (
    <Button
      onClick={() => startChat(userId, currentUserId)}
      disabled={loading}
      variant="outline"
      size="sm"
      className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
    >
      <MessageCircle className="w-4 h-4 mr-2" />
      Message
    </Button>
  );
};
