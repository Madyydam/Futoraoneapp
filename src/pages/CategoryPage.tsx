import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, Users } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

interface Post {
    id: string;
    content: string;
    created_at: string;
    profiles: {
        username: string;
        full_name: string;
        avatar_url: string | null;
        is_verified?: boolean;
    };
    likes: { id: string }[];
    comments: { id: string }[];
}

// Category-specific example posts as fallback
const CATEGORY_DEMO_POSTS: { [key: string]: any[] } = {
    "AI & ML": [
        {
            id: "ai-1",
            title: "Building a Neural Network from Scratch",
            content: "Just finished implementing backpropagation manually. Understanding the math behind it makes neural networks much less magical. 🧠",
            author: "Aarav Sharma",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav",
            likes: 234,
            comments: 45
        },
        {
            id: "ai-2",
            title: "The Future of LLMs in 2025",
            content: "Exploring how large language models are evolving. The multimodal capabilities are game-changing!",
            author: "Priya Patel",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
            likes: 189,
            comments: 32
        },
        {
            id: "ai-3",
            title: "Optimizing Transformer Models",
            content: "Reduced model inference time by 40% using quantization and pruning techniques. Sharing my findings!",
            author: "Rohan Mehta",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan",
            likes: 312,
            comments: 58
        }
    ],
    "Web Dev": [
        {
            id: "web-1",
            title: "Modern React Patterns",
            content: "Server Components in React 19 are revolutionary. No more client-side waterfalls! ⚡",
            author: "Ananya Singh",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya",
            likes: 456,
            comments: 67
        },
        {
            id: "web-2",
            title: "Next.js 15 Features",
            content: "The new caching strategies in Next.js 15 are incredible. Performance gains everywhere!",
            author: "Kabir Reddy",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kabir",
            likes: 378,
            comments: 54
        },
        {
            id: "web-3",
            title: "CSS Grid vs Flexbox",
            content: "Finally created a guide on when to use Grid vs Flexbox. Understanding both is key to modern layouts!",
            author: "Diya Malhotra",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Diya",
            likes: 267,
            comments: 41
        }
    ]
};

const CategoryPage = () => {
    const { category } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<'trending' | 'new' | 'top'>('trending');

    useEffect(() => {
        fetchCategoryPosts();
    }, [category, activeFilter]);

    const fetchCategoryPosts = async () => {
        setLoading(true);
        try {
            // Try to fetch real posts (you can add category tags to posts table later)
            const { data, error } = await supabase
                .from('posts')
                .select(`
                    id,
                    content,
                    created_at,
                    profiles(username, full_name, avatar_url, is_verified),
                    likes(id),
                    comments(id)
                `)
                .order(
                    activeFilter === 'new' ? 'created_at' :
                        activeFilter === 'top' ? 'created_at' : 'created_at',
                    { ascending: false }
                )
                .limit(10);

            if (error) throw error;

            // Filter by content (basic keyword matching until we add category tags)
            const categoryKeywords: { [key: string]: string[] } = {
                "AI & ML": ["AI", "ML", "machine learning", "neural", "model", "GPT", "LLM"],
                "Web Dev": ["React", "Next", "Vue", "Angular", "CSS", "HTML", "JavaScript", "TypeScript"],
                "Cybersecurity": ["security", "encryption", "hack", "vulnerability", "penetration"],
                "Cloud": ["AWS", "Azure", "GCP", "cloud", "serverless", "kubernetes"],
                "Robotics": ["robot", "arduino", "sensor", "automation", "IoT"],
                "Blockchain": ["blockchain", "crypto", "Web3", "Solidity", "smart contract"],
                "Mobile Dev": ["mobile", "iOS", "Android", "React Native", "Flutter"],
                "Data Science": ["data", "analytics", "visualization", "pandas", "numpy"]
            };

            const keywords = categoryKeywords[category || ""] || [];
            const filtered = data?.filter(post =>
                keywords.some(keyword =>
                    post.content.toLowerCase().includes(keyword.toLowerCase())
                )
            ) || [];

            setPosts(filtered);
        } catch (error) {
            console.error("Error fetching category posts:", error);
            toast({
                title: "Using demo content",
                description: "Showing example posts for this category",
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePostClick = (postId: string) => {
        // Navigate to post detail or show expanded view
        toast({
            title: "Opening post",
            description: "Post details coming soon!",
        });
    };

    // Get demo posts for current category
    const demoPosts = CATEGORY_DEMO_POSTS[category || ""] || [];
    const displayPosts = posts.length > 0 ? posts : demoPosts;

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-card border-b border-border backdrop-blur-lg">
                <div className="p-4 flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-foreground capitalize">{category}</h1>
                        <p className="text-sm text-muted-foreground">
                            {displayPosts.length} {displayPosts.length === 1 ? 'post' : 'posts'}
                        </p>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="px-4 pb-3 flex gap-2">
                    <Button
                        variant={activeFilter === 'trending' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setActiveFilter('trending')}
                        className="gap-1"
                    >
                        <TrendingUp className="w-4 h-4" />
                        Trending
                    </Button>
                    <Button
                        variant={activeFilter === 'new' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setActiveFilter('new')}
                    >
                        New
                    </Button>
                    <Button
                        variant={activeFilter === 'top' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setActiveFilter('top')}
                    >
                        Top
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
                {loading ? (
                    // Loading skeleton
                    Array(3).fill(0).map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-muted" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-muted rounded w-1/3" />
                                        <div className="h-3 bg-muted rounded w-1/4" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-4 bg-muted rounded" />
                                    <div className="h-4 bg-muted rounded w-5/6" />
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : displayPosts.length === 0 ? (
                    <Card className="bg-card border-border">
                        <CardContent className="p-12 text-center">
                            <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                            <p className="text-muted-foreground">
                                Be the first to post about {category}!
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    displayPosts.map((post, index) => {
                        // Handle both real posts and demo posts
                        const isRealPost = 'profiles' in post;
                        const author = isRealPost ? post.profiles.full_name : (post as any).author;
                        const username = isRealPost ? post.profiles.username : (post as any).author.replace(/\s+/g, '').toLowerCase();
                        const avatar = isRealPost ? post.profiles.avatar_url : (post as any).avatar;
                        const content = isRealPost ? post.content : (post as any).content;
                        const title = isRealPost ? content.split('\n')[0] : (post as any).title;
                        const likes = isRealPost ? post.likes?.length || 0 : (post as any).likes;
                        const comments = isRealPost ? post.comments?.length || 0 : (post as any).comments;

                        return (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card
                                    className="bg-card border-2 border-black/20 dark:border-border hover:border-primary transition-all cursor-pointer hover:shadow-lg"
                                    onClick={() => handlePostClick(post.id)}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="w-10 h-10">
                                                    <AvatarImage src={avatar || undefined} />
                                                    <AvatarFallback className="bg-primary/10 text-primary">
                                                        {author?.[0]?.toUpperCase() || 'U'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold text-sm">{author}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {isRealPost ? new Date(post.created_at).toLocaleDateString() : '2 hours ago'}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge variant="secondary" className="text-xs">
                                                {category}
                                            </Badge>
                                        </div>

                                        <h3 className="font-bold text-base mb-2 line-clamp-2">
                                            {title}
                                        </h3>

                                        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                                            {content}
                                        </p>

                                        <div className="flex items-center gap-6 text-muted-foreground text-sm">
                                            <span className="flex items-center gap-1.5 hover:text-red-500 transition-colors">
                                                ❤️ {likes}
                                            </span>
                                            <span className="flex items-center gap-1.5 hover:text-blue-500 transition-colors">
                                                💬 {comments}
                                            </span>
                                            <span className="flex items-center gap-1.5 hover:text-orange-500 transition-colors">
                                                🔥 {Math.floor(Math.random() * 20) + 1}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })
                )}
            </div>

            <BottomNav />
        </div>
    );
};

export default CategoryPage;
