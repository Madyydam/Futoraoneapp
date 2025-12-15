import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Crown, TrendingUp } from "lucide-react";
import { CartoonLoader } from "@/components/CartoonLoader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { subDays, isAfter, parseISO } from "date-fns";

interface LeaderboardEntry {
    user_id: string;
    total_wins: number;
    total_losses: number;
    username: string;
    avatar_url: string | null;
    full_name: string;
    last_active_at?: string;
}

const GameLeaderboard = ({ currentUserId }: { currentUserId?: string }) => {
    const [loading, setLoading] = useState(true);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [timeFilter, setTimeFilter] = useState<"all" | "week" | "month">("all");
    const [userRank, setUserRank] = useState<number | null>(null);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        setLoading(true);

        // Note: This RPC now returns last_active_at
        const { data, error } = await supabase.rpc('get_overall_leaderboard');

        if (error) {
            console.error("Error fetching leaderboard:", error);
            setLoading(false);
            return;
        }

        const formattedData: LeaderboardEntry[] = (data || []).map((item: any) => ({
            user_id: item.user_id,
            total_wins: item.total_wins,
            total_losses: item.total_losses,
            username: item.username,
            avatar_url: item.avatar_url,
            full_name: item.full_name,
            last_active_at: item.last_active_at
        }));

        setLeaderboard(formattedData);
        setLoading(false);
    };

    const filteredLeaderboard = useMemo(() => {
        if (timeFilter === "all") return leaderboard;

        const now = new Date();
        const cutoffDate = timeFilter === "week" ? subDays(now, 7) : subDays(now, 30);

        return leaderboard.filter(entry => {
            if (!entry.last_active_at) return false; // If never active, don't show in time-based views
            return isAfter(parseISO(entry.last_active_at), cutoffDate);
        });
    }, [leaderboard, timeFilter]);

    // Recalculate rank for current user based on filtered list
    useEffect(() => {
        if (currentUserId) {
            const rank = filteredLeaderboard.findIndex(p => p.user_id === currentUserId);
            setUserRank(rank !== -1 ? rank + 1 : null);
        }
    }, [currentUserId, filteredLeaderboard]);


    const Podium = ({ entry, rank }: { entry: LeaderboardEntry; rank: number }) => (
        <div className={cn(
            "flex flex-col items-center justify-end p-4 rounded-t-2xl bg-gradient-to-b border-t border-x border-white/10 relative",
            rank === 1 ? "h-64 sm:h-80 w-1/3 z-10 from-yellow-500/10 to-transparent" :
                rank === 2 ? "h-48 sm:h-64 w-1/3 -mr-2 from-slate-400/10 to-transparent" :
                    "h-40 sm:h-52 w-1/3 -ml-2 from-amber-700/10 to-transparent"
        )}>
            {rank === 1 && <Crown className="w-8 h-8 text-yellow-500 mb-2 animate-bounce-slow" />}
            <Avatar className={cn(
                "border-4 mb-3",
                rank === 1 ? "w-20 h-20 sm:w-24 sm:h-24 border-yellow-500" :
                    rank === 2 ? "w-16 h-16 sm:w-20 sm:h-20 border-slate-400" :
                        "w-16 h-16 sm:w-20 sm:h-20 border-amber-700"
            )}>
                <AvatarImage src={entry.avatar_url || undefined} />
                <AvatarFallback>{entry.username[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>

            <div className="text-center">
                <p className="font-bold text-sm sm:text-base truncate max-w-[100px] sm:max-w-full">
                    {entry.full_name.split(' ')[0]}
                </p>
                <p className="text-xs sm:text-sm text-primary font-bold mt-1">{entry.total_wins} Wins</p>
            </div>

            <div className="absolute -bottom-6 flex items-center justify-center w-8 h-8 rounded-full bg-card border border-border font-bold text-sm z-20 shadow-md">
                {rank}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Trophy className="text-primary fill-current" /> Global Game Leaderboard
                    </h2>
                    <p className="text-muted-foreground text-sm">Top performers across the community</p>
                </div>

                <Tabs defaultValue="all" value={timeFilter} onValueChange={(v: any) => setTimeFilter(v)} className="w-full md:w-auto">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="week">This Week</TabsTrigger>
                        <TabsTrigger value="month">Month</TabsTrigger>
                        <TabsTrigger value="all">All Time</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <Card className="w-full bg-card/60 backdrop-blur-xl border-border overflow-hidden">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="h-64 flex items-center justify-center">
                            <CartoonLoader />
                        </div>
                    ) : filteredLeaderboard.length === 0 ? (
                        <div className="text-center py-16 px-4">
                            <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold">No Active Champions</h3>
                            <p className="text-muted-foreground text-sm max-w-xs mx-auto mt-2">
                                {timeFilter === 'all'
                                    ? "Be the first to claim victory!"
                                    : "No players active in this period. Play now to reach the top!"}
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Podium for Top 3 */}
                            {filteredLeaderboard.length >= 3 && (
                                <div className="flex items-end justify-center px-4 pt-8 pb-12 bg-gradient-to-b from-primary/5 to-transparent">
                                    {filteredLeaderboard[1] && <Podium entry={filteredLeaderboard[1]} rank={2} />}
                                    {filteredLeaderboard[0] && <Podium entry={filteredLeaderboard[0]} rank={1} />}
                                    {filteredLeaderboard[2] && <Podium entry={filteredLeaderboard[2]} rank={3} />}
                                </div>
                            )}

                            {/* List for Rest */}
                            <div className="px-4 pb-4 space-y-2 max-h-[400px] overflow-y-auto mt-4">
                                {filteredLeaderboard.slice(filteredLeaderboard.length >= 3 ? 3 : 0).map((entry, idx) => {
                                    const rank = idx + (filteredLeaderboard.length >= 3 ? 4 : 1);
                                    return (
                                        <div key={entry.user_id} className="flex items-center gap-4 p-3 rounded-xl bg-card border border-border/50 hover:bg-muted/50 transition-colors">
                                            <span className="w-8 text-center font-bold text-muted-foreground">{rank}</span>
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={entry.avatar_url || undefined} />
                                                <AvatarFallback>{entry.username[0]?.toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <p className="font-semibold">{entry.full_name}</p>
                                                <p className="text-xs text-muted-foreground flex items-center gap-2">
                                                    @{entry.username}
                                                    <span className="w-1 h-1 bg-muted-foreground rounded-full" />
                                                    {((entry.total_wins / ((entry.total_wins + entry.total_losses) || 1)) * 100).toFixed(0)}% Win Rate
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span className="block font-bold text-foreground">{entry.total_wins}</span>
                                                <span className="text-[10px] text-muted-foreground uppercase">Wins</span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Fixed User Rank Footer */}
                            {currentUserId && userRank && (
                                <div className="sticky bottom-0 p-4 bg-background/80 backdrop-blur-md border-t border-border flex items-center gap-4">
                                    <span className="w-8 text-center font-bold text-primary">{userRank}</span>
                                    <div className="flex-1 font-semibold text-sm">Your Global Rank</div>
                                    <Button variant="ghost" size="sm" className="gap-2">
                                        View Stats <TrendingUp className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default GameLeaderboard;
