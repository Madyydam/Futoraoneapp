import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const CategoryPage = () => {
    const { category } = useParams();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="sticky top-0 z-10 bg-card border-b border-border p-4 flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <h1 className="text-2xl font-bold text-foreground capitalize">{category}</h1>
            </div>

            <div className="p-4 space-y-6">
                <div className="flex items-center justify-between">
                    <p className="text-muted-foreground">Top results for {category}</p>
                    <Badge variant="outline" className="text-xs">
                        {Math.floor(Math.random() * 1000) + 500} results
                    </Badge>
                </div>

                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Card className="bg-card border-border hover:border-primary transition-all cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                {["A", "P", "R", "A", "K"][i - 1]}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">
                                                    {["Aarav Sharma", "Priya Patel", "Rohan Mehta", "Ananya Singh", "Kabir Reddy"][i - 1]}
                                                </p>
                                                <p className="text-xs text-muted-foreground">2 hours ago</p>
                                            </div>
                                        </div>
                                        <Badge variant="secondary" className="text-xs">
                                            {category}
                                        </Badge>
                                    </div>

                                    <h3 className="font-bold text-lg mb-2">
                                        {category === "AI & ML" ? [
                                            "Building a Neural Network from Scratch",
                                            "The Future of LLMs in 2025",
                                            "Optimizing Transformer Models",
                                            "Computer Vision with PyTorch",
                                            "AI Agents in Production"
                                        ][i - 1] :
                                            category === "Web Dev" ? [
                                                "Modern React Patterns",
                                                "Next.js 15 Features",
                                                "CSS Grid vs Flexbox",
                                                "WebAssembly Performance",
                                                "State Management in 2025"
                                            ][i - 1] :
                                                `Interesting project about ${category} #${i}`}
                                    </h3>

                                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                                        Just finished working on a new module for my open source project.
                                        It handles complex data processing and improves performance by 40%.
                                        Check out the repo for more details!
                                    </p>

                                    <div className="flex items-center gap-4 text-muted-foreground text-sm">
                                        <span className="flex items-center gap-1">
                                            ❤️ {Math.floor(Math.random() * 200) + 20}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            💬 {Math.floor(Math.random() * 50) + 5}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            🔥 {Math.floor(Math.random() * 10) + 1}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>

            <BottomNav />
        </div>
    );
};

export default CategoryPage;
