import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { BottomNav } from "@/components/BottomNav";
import { useState } from "react";

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const initialQuery = searchParams.get("q") || "";
    const [query, setQuery] = useState(initialQuery);
    const navigate = useNavigate();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/search?q=${encodeURIComponent(query)}`);
        }
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="sticky top-0 z-10 bg-card border-b border-border p-4 space-y-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <form onSubmit={handleSearch} className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="pl-9"
                            placeholder="Search..."
                        />
                    </form>
                </div>
            </div>

            <div className="p-4">
                <h2 className="text-lg font-semibold mb-4">Results for "{initialQuery}"</h2>

                {/* Placeholder for results */}
                <div className="space-y-4">
                    <div className="p-4 border rounded-lg bg-card">
                        <p className="text-muted-foreground text-center">No results found.</p>
                    </div>
                </div>
            </div>

            <BottomNav />
        </div>
    );
};

export default SearchResults;
