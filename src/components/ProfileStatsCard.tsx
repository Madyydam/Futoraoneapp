import { Card, CardContent } from "@/components/ui/card";
import { Heart, MessageCircle, FileText, Target } from "lucide-react";
import { motion } from "framer-motion";

interface StatsCardProps {
  postsCount: number;
  likesReceived: number;
  commentsReceived: number;
  projectsCount: number;
}

export const ProfileStatsCard = ({ postsCount, likesReceived, commentsReceived, projectsCount }: StatsCardProps) => {
  const stats = [
    {
      label: "Posts",
      value: postsCount,
      icon: FileText,
      color: "text-blue-500",
    },
    {
      label: "Likes",
      value: likesReceived,
      icon: Heart,
      color: "text-red-500",
    },
    {
      label: "Comments",
      value: commentsReceived,
      icon: MessageCircle,
      color: "text-green-500",
    },
    {
      label: "Projects",
      value: projectsCount,
      icon: Target,
      color: "text-purple-500",
    },
  ];

  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/50">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex-1 text-center group cursor-pointer hover:bg-muted/50 rounded-lg p-2 transition-all"
            >
              <div className="flex flex-col items-center gap-1">
                <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.color} group-hover:scale-110 transition-transform`} />
                <p className="text-lg sm:text-xl font-bold text-foreground">{stat.value}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wide">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
