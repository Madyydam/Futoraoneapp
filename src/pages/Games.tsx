import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Grid,
    Gamepad2,
    Brain,
    Scissors,
    CircleDot,
    ArrowLeft,
} from "lucide-react";
import { motion } from "framer-motion";
import GameLeaderboard from "@/components/GameLeaderboard";

const games = [
    {
        id: "dots-and-boxes",
        title: "Dots & Boxes",
        description: "Strategy: Claim the most boxes to win.",
        icon: <Grid className="w-10 h-10 md:w-12 md:h-12 text-white" />,
        gradient: "from-blue-500 to-indigo-600",
        shadow: "shadow-blue-500/30",
        path: "/games/dots-and-boxes",
        difficulty: "Medium",
        dotColor: "bg-yellow-400"
    },
    {
        id: "tic-tac-toe",
        title: "Tic Tac Toe",
        description: "Classic: The timeless game of X's and O's.",
        icon: <Gamepad2 className="w-10 h-10 md:w-12 md:h-12 text-white" />,
        gradient: "from-emerald-400 to-teal-600",
        shadow: "shadow-emerald-500/30",
        path: "/games/tic-tac-toe",
        difficulty: "Easy",
        dotColor: "bg-pink-400"
    },
    {
        id: "memory-match",
        title: "Memory Match",
        description: "Focus: Test your memory finding pairs.",
        icon: <Brain className="w-10 h-10 md:w-12 md:h-12 text-white" />,
        gradient: "from-violet-500 to-purple-600",
        shadow: "shadow-violet-500/30",
        path: "/games/memory-match",
        difficulty: "Hard",
        dotColor: "bg-cyan-400"
    },
    {
        id: "rock-paper-scissors",
        title: "Rock Paper Scissors",
        description: "Luck: Quick battle of mind games.",
        icon: <Scissors className="w-10 h-10 md:w-12 md:h-12 text-white" />,
        gradient: "from-pink-500 to-rose-600",
        shadow: "shadow-pink-500/30",
        path: "/games/rock-paper-scissors",
        difficulty: "Easy",
        dotColor: "bg-blue-400"
    },
    {
        id: "connect-four",
        title: "Connect Four",
        description: "Strategy: Connect 4 discs to win.",
        icon: <CircleDot className="w-10 h-10 md:w-12 md:h-12 text-white" />,
        gradient: "from-orange-400 to-red-600",
        shadow: "shadow-orange-500/30",
        path: "/games/connect-four",
        difficulty: "Medium",
        dotColor: "bg-purple-400"
    }
];

const Games = React.memo(() => {
    const navigate = useNavigate();
    const [userId, setUserId] = useState<string | undefined>(undefined);

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            setUserId(data.user?.id);
        });
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 pb-32">
            <div className="max-w-7xl mx-auto space-y-12">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full">
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                            Game Zone <Gamepad2 className="w-8 h-8 md:w-10 md:h-10 text-primary animate-bounce-slow" />
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 md:mt-2 text-base md:text-lg mobile:text-sm">
                            Immersive games to challenge your friends
                        </p>
                    </div>
                </div>

                {/* Leaderboard Section (Now at the top) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative"
                >
                    {/* Decorative background for leaderboard */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-[2rem] -m-4 blur-xl" />
                    <div className="relative bg-card/50 backdrop-blur-sm rounded-[2rem] border border-border p-6 shadow-xl">
                        <GameLeaderboard currentUserId={userId} />
                    </div>
                </motion.div>

                {/* Game Grid */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Gamepad2 className="text-primary" /> All Games
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {games.map((game, index) => (
                            <motion.div
                                key={game.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -5 }}
                                onClick={() => navigate(game.path)}
                                className="group cursor-pointer"
                            >
                                <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white dark:bg-slate-900 rounded-[2rem] relative flex flex-col">
                                    <div className={`h-40 bg-gradient-to-br ${game.gradient} relative flex items-center justify-center p-6`}>
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg border border-white/30 group-hover:scale-110 transition-transform">
                                            {game.icon}
                                        </div>
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col">
                                        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{game.title}</h3>
                                        <p className="text-slate-500 text-sm flex-1">{game.description}</p>
                                        <div className="mt-4 flex items-center justify-between text-xs font-semibold uppercase text-muted-foreground">
                                            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{game.difficulty}</span>
                                            <span className="group-hover:translate-x-1 transition-transform">Play &rarr;</span>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
});

export default Games;
