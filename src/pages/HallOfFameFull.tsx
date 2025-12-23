import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Trophy, Crown, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface LeaderboardUser {
    id: string;
    username: string;
    avatar_url: string | null;
    xp: number;
    level: number;
}

const HallOfFameFull = () => {
    const navigate = useNavigate();
    const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setCurrentUserId(user.id);

            // Fetch all users by XP
            const { data, error } = await supabase
                .from('profiles')
                .select('id, username, avatar_url, xp, level')
                .order('xp', { ascending: false })
                .limit(100);

            if (error) {
                console.error("Error fetching leaderboard:", error);
            } else {
                setLeaderboard(data || []);
            }

            setLoading(false);
        };

        fetchData();

        // Real-time subscription
        const channel = supabase
            .channel('xp-updates-hall-of-fame-full')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'profiles' },
                () => fetchData()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <div className="min-h-screen bg-background pb-20 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <Button
                    variant="ghost"
                    className="mb-4 pl-0 hover:bg-transparent hover:text-primary"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft className="w-5 h-5 mr-2" /> Back
                </Button>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                        <Trophy className="text-yellow-500" />
                        Hall of Fame Rankings
                    </h1>
                    <p className="text-muted-foreground">Top XP earners across the community</p>
                </div>

                <Card className="bg-card/60 backdrop-blur-xl border-border overflow-hidden">
                    <CardContent className="p-6">
                        {loading ? (
                            <div className="space-y-4">
                                {Array(10).fill(0).map((_, i) => (
                                    <div key={i} className="h-20 bg-muted/10 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : leaderboard.length === 0 ? (
                            <div className="text-center py-16">
                                <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold">No Champions Yet</h3>
                                <p className="text-muted-foreground text-sm mt-2">
                                    Be the first to earn XP!
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {leaderboard.map((user, index) => {
                                    const isCurrentUser = user.id === currentUserId;
                                    const rank = index + 1;

                                    return (
                                        <motion.div
                                            key={user.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${isCurrentUser
                                                    ? 'bg-primary/10 border-primary/50'
                                                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                                                }`}
                                        >
                                            <div className={`flex-shrink-0 w-10 text-center font-bold text-lg ${isCurrentUser ? 'text-primary' : 'text-muted-foreground'
                                                }`}>
                                                {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                                            </div>

                                            <Avatar className="w-12 h-12 border-2 border-primary/20">
                                                <AvatarImage src={user.avatar_url || undefined} />
                                                <AvatarFallback>{user.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                                            </Avatar>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h3 className={`font-semibold truncate ${isCurrentUser ? 'text-primary' : ''}`}>
                                                        {user.username || 'Anonymous'}
                                                        {isCurrentUser && " (You)"}
                                                    </h3>
                                                    {rank === 1 && <Crown className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                                                </div>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                    Level {user.level || 1}
                                                </p>
                                            </div>

                                            <div className="text-right">
                                                <div className="font-bold text-primary flex items-center gap-1 justify-end">
                                                    <Zap className="w-4 h-4 text-orange-500" />
                                                    {(user.xp || 0).toLocaleString()}
                                                </div>
                                                <div className="text-xs text-muted-foreground">XP</div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <BottomNav />
        </div>
    );
};

export default HallOfFameFull;
