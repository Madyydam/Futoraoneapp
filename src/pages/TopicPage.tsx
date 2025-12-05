import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { MessageSquare, ThumbsUp, Share2 } from "lucide-react";

const TopicPage = () => {
    const { topic } = useParams();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="sticky top-0 z-10 bg-card border-b border-border p-4 flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">#{topic}</h1>
                    <p className="text-xs text-muted-foreground">{Math.floor(Math.random() * 5000) + 1000} posts</p>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card className="bg-card border-border hover:border-primary transition-all cursor-pointer">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-purple-500" />
                                    <span className="text-sm font-semibold">User_{Math.floor(Math.random() * 1000)}</span>
                                    <span className="text-xs text-muted-foreground">• {i * 15}m ago</span>
                                </div>

                                <h3 className="font-bold mb-2">
                                    {topic === "ChatGPT-5" ? [
                                        "Is ChatGPT-5 really coming next month?",
                                        "How to optimize prompts for the new model",
                                        "Comparing GPT-4 vs GPT-5 leaked specs",
                                        "The impact of AI on coding jobs",
                                        "Best use cases for the new API"
                                    ][i - 1] :
                                        topic === "ReactJS" ? [
                                            "Why I switched from Vue to React",
                                            "Understanding React Server Components",
                                            "Best state management library in 2025?",
                                            "React Performance Optimization Tips",
                                            "Building a design system with Radix UI"
                                        ][i - 1] :
                                            `Discussion about #${topic} ${i}`}
                                </h3>

                                <p className="text-sm text-muted-foreground mb-3">
                                    Here are some thoughts and questions I have regarding the recent updates.
                                    What do you guys think about the new features?
                                </p>

                                <div className="flex items-center gap-4 text-muted-foreground text-xs">
                                    <Button variant="ghost" size="sm" className="h-8 gap-1">
                                        <ThumbsUp className="w-3 h-3" /> {Math.floor(Math.random() * 500)}
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-8 gap-1">
                                        <MessageSquare className="w-3 h-3" /> {Math.floor(Math.random() * 100)}
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-8 gap-1">
                                        <Share2 className="w-3 h-3" /> Share
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <BottomNav />
        </div>
    );
};

export default TopicPage;
