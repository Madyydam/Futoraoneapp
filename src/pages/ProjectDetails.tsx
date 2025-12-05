import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, Share2, Github, Globe, Code, MessageSquare, Users, Star, GitFork } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";

const ProjectDetails = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();

    // Mock data - in a real app, fetch project by ID
    const project = {
        title: projectId ? decodeURIComponent(projectId) : "Project Title",
        author: "Saanvi Iyer",
        description: "This is a detailed description of the project. It solves a major problem in the tech industry using advanced algorithms and a user-friendly interface. The system is built with scalability in mind, utilizing microservices architecture and real-time data processing.",
        longDescription: "Features include real-time collaboration, AI-powered suggestions, and seamless integration with popular dev tools. The backend is powered by Rust for performance, while the frontend uses the latest React features.",
        tech: ["React", "TypeScript", "Node.js", "TailwindCSS", "Supabase"],
        likes: 342,
        forks: 45,
        stars: 128,
        github: "https://github.com",
        demo: "https://demo.com",
        contributors: [
            { name: "Saanvi Iyer", role: "Owner" },
            { name: "Arjun Kapoor", role: "Maintainer" },
            { name: "Priya Patel", role: "Contributor" }
        ]
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-card/80 backdrop-blur-md border-b border-border p-4 flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <h1 className="text-xl font-bold text-foreground truncate flex-1">{project.title}</h1>
                <Button variant="ghost" size="icon">
                    <Share2 className="w-5 h-5" />
                </Button>
            </div>

            <div className="p-4 space-y-6">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    <div className="aspect-video bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-border shadow-sm">
                        <div className="text-center p-6">
                            <Code className="w-16 h-16 mx-auto text-primary mb-4 opacity-80" />
                            <h2 className="text-2xl font-bold text-foreground">{project.title}</h2>
                            <p className="text-muted-foreground">A revolutionary tech project</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10 border-2 border-background">
                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${project.author}`} />
                                <AvatarFallback>{project.author[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold text-sm">{project.author}</p>
                                <p className="text-xs text-muted-foreground">Created 2 days ago</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="h-8 gap-1">
                                <Star className="w-3 h-3" /> {project.stars}
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 gap-1">
                                <GitFork className="w-3 h-3" /> {project.forks}
                            </Button>
                        </div>
                    </div>
                </motion.div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="w-full grid grid-cols-3 mb-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="code">Code</TabsTrigger>
                        <TabsTrigger value="discussion">Discussion</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-6"
                        >
                            <section>
                                <h3 className="font-semibold mb-2 flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-primary" /> About
                                </h3>
                                <p className="text-muted-foreground leading-relaxed text-sm">
                                    {project.description} {project.longDescription}
                                </p>
                            </section>

                            <section>
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <Code className="w-4 h-4 text-primary" /> Tech Stack
                                </h3>
                                <div className="flex gap-2 flex-wrap">
                                    {project.tech.map((t, i) => (
                                        <Badge key={t} variant="secondary" className="px-3 py-1">
                                            {t}
                                        </Badge>
                                    ))}
                                </div>
                            </section>

                            <section>
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <Users className="w-4 h-4 text-primary" /> Contributors
                                </h3>
                                <div className="flex -space-x-2 overflow-hidden">
                                    {project.contributors.map((c, i) => (
                                        <Avatar key={i} className="inline-block border-2 border-background w-8 h-8">
                                            <AvatarFallback className="bg-muted text-xs">{c.name[0]}</AvatarFallback>
                                        </Avatar>
                                    ))}
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-background bg-muted text-[10px] font-medium text-muted-foreground">
                                        +5
                                    </div>
                                </div>
                            </section>

                            <div className="flex gap-3 pt-2">
                                <Button className="flex-1 gap-2 shadow-lg shadow-primary/20">
                                    <Globe className="w-4 h-4" /> Live Demo
                                </Button>
                                <Button variant="outline" className="flex-1 gap-2">
                                    <Github className="w-4 h-4" /> Source Code
                                </Button>
                            </div>
                        </motion.div>
                    </TabsContent>

                    <TabsContent value="code">
                        <Card>
                            <CardContent className="p-6 text-center text-muted-foreground">
                                <Code className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>Source code preview not available</p>
                                <Button variant="link" className="mt-2">View on GitHub</Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="discussion">
                        <Card>
                            <CardContent className="p-6 text-center text-muted-foreground">
                                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>No discussions yet</p>
                                <Button variant="link" className="mt-2">Start a discussion</Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            <BottomNav />
        </div>
    );
};

export default ProjectDetails;
