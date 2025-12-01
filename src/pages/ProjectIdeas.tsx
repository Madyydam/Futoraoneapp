
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Sparkles, Lightbulb, Rocket, Code, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const ProjectIdeas = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [skills, setSkills] = useState("");
    const [generatedIdea, setGeneratedIdea] = useState<any>(null);

    const generateIdea = () => {
        setLoading(true);
        // Simulate AI generation delay
        setTimeout(() => {
            const ideas = [
                {
                    title: "AI-Powered Personal Finance Tracker",
                    description: "A smart finance app that categorizes expenses automatically using NLP and predicts future spending habits.",
                    techStack: ["React Native", "Python (FastAPI)", "TensorFlow Lite", "PostgreSQL"],
                    difficulty: "Intermediate",
                    features: ["Receipt scanning", "Budget forecasting", "Investment recommendations"]
                },
                {
                    title: "Decentralized Social Media Dashboard",
                    description: "A privacy-focused dashboard aggregating feeds from Bluesky, Mastodon, and Nostr in one place.",
                    techStack: ["Next.js", "GraphQL", "Solidity (optional)", "IPFS"],
                    difficulty: "Advanced",
                    features: ["Unified feed", "Cross-posting", "Self-hosted data"]
                },
                {
                    title: "Real-time Collaborative Code Editor",
                    description: "A browser-based code editor allowing multiple users to edit files simultaneously with video chat.",
                    techStack: ["React", "Node.js", "Socket.io", "WebRTC", "Monaco Editor"],
                    difficulty: "Advanced",
                    features: ["Syntax highlighting", "Live cursor tracking", "Integrated video call"]
                },
                {
                    title: "Smart Home Energy Optimizer",
                    description: "IoT dashboard to monitor and optimize energy consumption of smart devices to save costs.",
                    techStack: ["Vue.js", "Go", "InfluxDB", "MQTT"],
                    difficulty: "Intermediate",
                    features: ["Real-time usage graphs", "Anomaly detection", "Automated scheduling"]
                },
                {
                    title: "Gamified Habit Tracker",
                    description: "An RPG-style habit tracker where completing tasks levels up your character and unlocks items.",
                    techStack: ["Flutter", "Firebase", "Unity (optional for assets)"],
                    difficulty: "Beginner",
                    features: ["Character customization", "Quest system", "Social leaderboards"]
                }
            ];

            const randomIdea = ideas[Math.floor(Math.random() * ideas.length)];
            setGeneratedIdea(randomIdea);
            setLoading(false);
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-yellow-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                <Button
                    variant="ghost"
                    onClick={() => navigate("/ai-tools")}
                    className="mb-8 text-gray-400 hover:text-white hover:bg-white/10"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to AI Tools
                </Button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center justify-center p-3 mb-6 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                        <Lightbulb className="w-6 h-6 text-yellow-400 mr-2" />
                        <span className="text-yellow-200 font-medium">AI Project Generator</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-orange-200 to-red-200">
                        Build Something Amazing
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Stuck in a rut? Let our AI generate unique, portfolio-worthy project ideas tailored to your interests.
                    </p>
                </motion.div>

                <Card className="bg-white/5 border-white/10 backdrop-blur-xl mb-8">
                    <CardContent className="p-8">
                        <div className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="flex-1 w-full">
                                <Label className="text-gray-300 mb-2 block">Your Skills / Interests (Optional)</Label>
                                <Input
                                    placeholder="e.g. React, Python, Blockchain, AI..."
                                    value={skills}
                                    onChange={(e) => setSkills(e.target.value)}
                                    className="bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus:border-yellow-500/50"
                                />
                            </div>
                            <Button
                                onClick={generateIdea}
                                disabled={loading}
                                className="w-full md:w-auto bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold py-6 px-8 shadow-lg shadow-orange-500/20 transition-all duration-300 hover:scale-105"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5 mr-2" />
                                        Generate Idea
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {generatedIdea && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring" }}
                    >
                        <Card className="bg-gradient-to-br from-gray-900 to-black border-white/10 overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500" />
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-3xl font-bold text-white mb-2">
                                        {generatedIdea.title}
                                    </CardTitle>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${generatedIdea.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                                            generatedIdea.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                                                'bg-red-500/20 text-red-400'
                                        }`}>
                                        {generatedIdea.difficulty}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <p className="text-lg text-gray-300 leading-relaxed">
                                    {generatedIdea.description}
                                </p>

                                <div>
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                                        <Code className="w-4 h-4 mr-2" /> Recommended Tech Stack
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {generatedIdea.techStack.map((tech: string) => (
                                            <span key={tech} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-md text-sm text-cyan-300">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                                        <Rocket className="w-4 h-4 mr-2" /> Key Features
                                    </h3>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {generatedIdea.features.map((feature: string) => (
                                            <li key={feature} className="flex items-center text-gray-300">
                                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-2" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default ProjectIdeas;
