
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/BottomNav";
import GameLeaderboard from "@/components/GameLeaderboard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LeaderboardFull = () => {
    const navigate = useNavigate();
    const [userId, setUserId] = useState<string | undefined>(undefined);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setUserId(user.id);
        };
        getUser();
    }, []);

    return (
        <div className="min-h-screen bg-background pb-20 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-primary" onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-5 h-5 mr-2" /> Back
                </Button>

                <GameLeaderboard currentUserId={userId} isWidget={false} />
            </div>

            <BottomNav />
        </div>
    );
};

export default LeaderboardFull;
