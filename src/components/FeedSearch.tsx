import { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Post {
    id: string;
    content: string;
    profiles: {
        username: string;
        full_name: string;
    };
}

interface FeedSearchProps {
    posts: Post[];
    onFilteredPostsChange: (filteredPosts: Post[]) => void;
}

export const FeedSearch = ({ posts, onFilteredPostsChange }: FeedSearchProps) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredPosts = useMemo(() => {
        if (!searchQuery.trim()) {
            return posts;
        }

        const query = searchQuery.toLowerCase();
        return posts.filter((post) => {
            const contentMatch = post.content.toLowerCase().includes(query);
            const usernameMatch = post.profiles.username.toLowerCase().includes(query);
            const nameMatch = post.profiles.full_name.toLowerCase().includes(query);
            return contentMatch || usernameMatch || nameMatch;
        });
    }, [posts, searchQuery]);

    // Update parent component whenever filtered posts change
    useEffect(() => {
        onFilteredPostsChange(filteredPosts);
    }, [filteredPosts, onFilteredPostsChange]);

    const handleClear = () => {
        setSearchQuery('');
    };

    return (
        <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
                type="text"
                placeholder="Search posts, users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
            />
            {searchQuery && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                    onClick={handleClear}
                >
                    <X className="w-4 h-4" />
                </Button>
            )}
            {searchQuery && (
                <p className="text-xs text-muted-foreground mt-2">
                    Found {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'}
                </p>
            )}
        </div>
    );
};
