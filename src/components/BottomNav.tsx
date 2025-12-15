import React, { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Home, Search, Plus, MessageCircle, User as UserIcon } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const BottomNav = React.memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userId, setUserId] = useState<string>();
  const unreadCount = useUnreadMessages(userId);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id);
    });
  }, []);

  const isActive = useCallback((path: string) => {
    if (path === "/explore" && location.pathname === "/tech-reels") return true;
    return location.pathname === path;
  }, [location.pathname]);

  const handleNavigate = useCallback((path: string) => navigate(path), [navigate]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-lg border-t border-border z-50 shadow-2xl text-foreground">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-around relative">
        {/* Animated indicator */}
        <motion.div
          className="absolute bottom-1 h-1 bg-primary rounded-full"
          initial={false}
          animate={{
            left: isActive("/feed") ? "10%" :
              isActive("/explore") ? "27%" :
                isActive("/messages") ? "63%" :
                  isActive("/profile") ? "80%" : "10%",
            width: "10%"
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />

        <motion.div whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.1 }}>
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-2xl transition-all ${isActive("/feed") ? "text-primary" : "hover:bg-muted/50"}`}
            onClick={() => handleNavigate("/feed")}
          >
            <Home className={`w-6 h-6 ${isActive("/feed") ? "fill-primary" : ""}`} />
          </Button>
        </motion.div>

        <motion.div whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.1 }}>
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-2xl transition-all ${isActive("/explore") ? "text-primary" : "hover:bg-muted/50"}`}
            onClick={() => handleNavigate("/explore")}
          >
            <Search className={`w-6 h-6 ${isActive("/explore") ? "fill-primary" : ""}`} />
          </Button>
        </motion.div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.div whileTap={{ scale: 0.85 }} whileHover={{ scale: 1.05 }}>
              <Button
                size="icon"
                className="gradient-primary text-white rounded-full shadow-lg scale-110 hover:shadow-xl transition-shadow"
              >
                <Plus className="w-6 h-6" />
              </Button>
            </motion.div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="mb-4">
            <DropdownMenuItem onClick={() => handleNavigate("/create-post")} className="gap-2 cursor-pointer">
              <span className="font-medium">Create Post</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNavigate("/create-story")} className="gap-2 cursor-pointer">
              <span className="font-medium">Create Reel</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="relative">
          <motion.div whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.1 }}>
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-2xl transition-all ${isActive("/messages") ? "text-primary" : "hover:bg-muted/50"}`}
              onClick={() => handleNavigate("/messages")}
            >
              <MessageCircle className={`w-6 h-6 ${isActive("/messages") ? "fill-primary" : ""}`} />
            </Button>
          </motion.div>
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1"
            >
              <Badge className="h-5 min-w-5 flex items-center justify-center p-0 text-xs bg-red-500 text-white border-2 border-background animate-pulse">
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            </motion.div>
          )}
        </div>

        <motion.div whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.1 }}>
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-2xl transition-all ${isActive("/profile") ? "text-primary" : "hover:bg-muted/50"}`}
            onClick={() => handleNavigate("/profile")}
          >
            <UserIcon className={`w-6 h-6 ${isActive("/profile") ? "fill-primary" : ""}`} />
          </Button>
        </motion.div>
      </div>
    </nav>
  );
});
