import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, UserPlus, Share2, AtSign } from "lucide-react";
import { motion } from "framer-motion";
import { BottomNav } from "@/components/BottomNav";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import type { User } from "@supabase/supabase-js";

const Notifications = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });
  }, [navigate]);

  const notifications = [
    {
      id: 1,
      type: "like",
      user: "Sarah Chen",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      action: "liked your post",
      content: "AI Image Generator progress update",
      time: "2 hours ago",
      icon: Heart,
      iconColor: "text-red-500",
    },
    {
      id: 2,
      type: "comment",
      user: "Mike Johnson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
      action: "commented on your project",
      content: '"This is amazing! Can you share the code?"',
      time: "5 hours ago",
      icon: MessageCircle,
      iconColor: "text-blue-500",
    },
    {
      id: 3,
      type: "follow",
      user: "Emma Davis",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
      action: "started following you",
      content: "",
      time: "1 day ago",
      icon: UserPlus,
      iconColor: "text-green-500",
    },
    {
      id: 4,
      type: "share",
      user: "Alex Rodriguez",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
      action: "shared your project",
      content: "Blockchain Voting System",
      time: "2 days ago",
      icon: Share2,
      iconColor: "text-purple-500",
    },
    {
      id: 5,
      type: "like",
      user: "Jessica Kim",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica",
      action: "liked your comment",
      content: 'on "Real-time Chat App"',
      time: "3 days ago",
      icon: Heart,
      iconColor: "text-red-500",
    },
    {
      id: 6,
      type: "mention",
      user: "David Lee",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
      action: "mentioned you in a comment",
      content: "on AI Discussion thread",
      time: "4 days ago",
      icon: AtSign,
      iconColor: "text-blue-500",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b border-border p-4">
        <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
      </div>

      <div className="p-4 space-y-3">
        {notifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="cursor-pointer hover:border-primary transition-all bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={notification.avatar} />
                      <AvatarFallback className="bg-muted text-muted-foreground">
                        {notification.user[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 bg-background rounded-full p-1`}>
                      <notification.icon className={notification.iconColor} size={14} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground">
                      <span className="font-semibold">{notification.user}</span>{" "}
                      <span className="text-muted-foreground">{notification.action}</span>
                    </p>
                    {notification.content && (
                      <p className="text-sm text-muted-foreground mt-1">{notification.content}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                  </div>
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

export default Notifications;
