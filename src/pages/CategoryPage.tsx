import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";

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

            <div className="p-4">
                <p className="text-muted-foreground">Showing content for {category}...</p>
                {/* Placeholder for content - in a real app, fetch posts by category here */}
                <div className="mt-8 text-center p-8 border rounded-lg bg-card">
                    <p>No posts found in this category yet.</p>
                </div>
            </div>

            <BottomNav />
        </div>
    );
};

export default CategoryPage;
