import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChatList } from "@/components/chat/ChatList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/BottomNav";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ChatPage() {
    const { id } = useParams();
    const [userId, setUserId] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                navigate("/auth");
            } else {
                setUserId(session.user.id);
            }
        });
    }, [navigate]);

    if (!userId) return null;

    return (
        <div className="min-h-screen bg-background pb-20 md:pb-0">
            <div className="max-w-6xl mx-auto h-screen md:py-6">
                <div className="grid grid-cols-1 md:grid-cols-3 h-full md:border rounded-xl overflow-hidden bg-card">
                    {/* Sidebar - Chat List */}
                    <div className={`${id ? 'hidden md:block' : 'block'} border-r h-full overflow-y-auto`}>
                        <div className="p-4 border-b flex items-center gap-2 md:hidden">
                            <Button variant="ghost" size="icon" onClick={() => navigate('/feed')}>
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <h1 className="font-bold text-lg">Messages</h1>
                        </div>
                        <ChatList currentUserId={userId} />
                    </div>

                    {/* Main Content - Chat Window */}
                    <div className={`${!id ? 'hidden md:flex' : 'flex'} col-span-2 flex-col h-full bg-background/50`}>
                        {id ? (
                            <ChatWindow conversationId={id} currentUserId={userId} />
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-muted-foreground">
                                <p>Select a conversation to start messaging</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <BottomNav />
        </div>
    );
}
