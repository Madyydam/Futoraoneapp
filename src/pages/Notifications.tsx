import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, UserPlus, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { BottomNav } from "@/components/BottomNav";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { formatDistanceToNow } from "date-fns";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { CartoonLoader } from "@/components/CartoonLoader";

interface Notification {
  id: string;
  type: string;
  created_at: string;
  is_read: boolean;
  post_id: string | null;
  actor: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
    is_verified?: boolean | null;
  } | null;
  post?: {
    content: string;
  } | null;
}

const Notifications = () => {
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchNotifications(session.user.id);
      }
    });
  }, [navigate]);

  const fetchNotifications = async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("notifications")
      .select(`
        *,
        actor:profiles!notifications_actor_id_fkey(id, username, full_name, avatar_url, is_verified),
        post:posts(content)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data) {
      setNotifications(data as unknown as Notification[]);
    }
    setLoading(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return Heart;
      case "comment":
        return MessageCircle;
      case "follow":
        return UserPlus;
      case "profile_view":
        return Eye;
      default:
        return Heart;
    }
  };

  const getNotificationText = (notif: Notification) => {
    switch (notif.type) {
      case "like":
        return "liked your post";
      case "comment":
        return "commented on your post";
      case "follow":
        return "started following you";
      case "profile_view":
        return "viewed your profile";
      default:
        return "interacted with you";
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case "like":
        return "text-red-500";
      case "comment":
        return "text-blue-500";
      case "follow":
        return "text-green-500";
      case "profile_view":
        return "text-purple-500";
      default:
        return "text-muted-foreground";
    }
  };

  const handleNotificationClick = async (notif: Notification) => {
    // Mark as read
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notif.id);

    // Navigate based on notification type
    if (notif.type === "follow" && notif.actor) {
      navigate(`/user/${notif.actor.id}`);
    } else if (notif.post_id) {
      navigate(`/feed`); // Navigate to feed where the post is
    }
  };


  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-muted/30 to-background pb-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header with slide-in */}
      <motion.div
        className="sticky top-0 z-10 bg-card/80 backdrop-blur-lg border-b border-border p-3 sm:p-4 shadow-sm"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold gradient-text">Notifications</h1>
          {notifications.length > 0 && (
            <span className="text-xs text-muted-foreground">{notifications.filter(n => !n.is_read).length} unread</span>
          )}
        </div>
      </motion.div>

      <div className="max-w-2xl mx-auto p-3 sm:p-4 space-y-3">
        {loading ? (
          <CartoonLoader />
        ) : notifications.length === 0 ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <Card className="bg-card/60 backdrop-blur-sm border-border/50">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-muted/30 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Heart className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-medium">No notifications yet</p>
                <p className="text-xs text-muted-foreground mt-1">We'll notify you when something happens</p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          notifications.map((notification, index) => {
            const Icon = getNotificationIcon(notification.type);
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: 50, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{
                  delay: index * 0.05,
                  type: "spring",
                  stiffness: 200,
                  damping: 20
                }}
                whileHover={{ scale: 1.02, x: -4 }}
                className="group"
              >
                <Card
                  className={`cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all duration-300 bg-card/60 backdrop-blur-sm border ${!notification.is_read
                      ? "border-primary/30 bg-primary/5 shadow-md shadow-primary/5"
                      : "border-border/50"
                    }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none rounded-lg" />

                  <CardContent className="p-3 sm:p-4 relative z-10">
                    <div className="flex items-start gap-3">
                      <motion.div
                        className="relative shrink-0"
                        whileHover={{ scale: 1.1 }}
                      >
                        <Avatar className="h-10 w-10 sm:h-12 sm:w-12 ring-2 ring-primary/10">
                          <AvatarImage src={notification.actor?.avatar_url || undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-foreground">
                            {notification.actor?.username[0]?.toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <motion.div
                          className="absolute -bottom-1 -right-1 bg-card rounded-full p-1.5 shadow-sm ring-2 ring-background"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.05 + 0.2 }}
                        >
                          <Icon className={getIconColor(notification.type)} size={12} />
                        </motion.div>
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm sm:text-base text-foreground">
                          <span className="font-semibold inline-flex items-center gap-1 hover:text-primary transition-colors">
                            {notification.actor?.full_name || "Someone"}
                            <VerifiedBadge isVerified={notification.actor?.is_verified} size={14} />
                          </span>{" "}
                          <span className="text-muted-foreground">{getNotificationText(notification)}</span>
                        </p>
                        {notification.post?.content && (
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 line-clamp-2 italic bg-muted/30 px-2 py-1 rounded-md">
                            "{notification.post.content}"
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </p>
                          {!notification.is_read && (
                            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      <BottomNav />
    </motion.div>
  );
};

export default React.memo(Notifications);
