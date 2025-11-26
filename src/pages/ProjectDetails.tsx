import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, Share2, Github, Globe } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { Badge } from "@/components/ui/badge";

const ProjectDetails = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();

    // Mock data - in a real app, fetch project by ID
    const project = {
        title: projectId ? decodeURIComponent(projectId) : "Project Title",
        author: "Author Name",
        description: "This is a detailed description of the project. It solves a major problem in the tech industry using advanced algorithms and a user-friendly interface.",
        tech: ["React", "TypeScript", "Node.js"],
        likes: 120,
        github: "https://github.com",
        demo: "https://demo.com"
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="sticky top-0 z-10 bg-card border-b border-border p-4 flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <h1 className="text-xl font-bold text-foreground truncate">{project.title}</h1>
            </div>

            <div className="p-4 space-y-6">
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <span className="text-muted-foreground">Project Preview Image</span>
                </div>

                <div>
                    <h2 className="text-2xl font-bold mb-2">{project.title}</h2>
                    <p className="text-muted-foreground mb-4">by {project.author}</p>
                    <div className="flex gap-2 flex-wrap mb-4">
                        {project.tech.map(t => (
                            <Badge key={t} variant="secondary">{t}</Badge>
                        ))}
                    </div>
                    <p className="text-foreground leading-relaxed">{project.description}</p>
                </div>

                <div className="flex gap-4">
                    <Button className="flex-1 gap-2">
                        <Globe className="w-4 h-4" /> Live Demo
                    </Button>
                    <Button variant="outline" className="flex-1 gap-2">
                        <Github className="w-4 h-4" /> Source Code
                    </Button>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                    <Button variant="ghost" className="gap-2">
                        <Heart className="w-5 h-5" /> {project.likes} Likes
                    </Button>
                    <Button variant="ghost" className="gap-2">
                        <Share2 className="w-5 h-5" /> Share
                    </Button>
                </div>
            </div>

            <BottomNav />
        </div>
    );
};

export default ProjectDetails;
