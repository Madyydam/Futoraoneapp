import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const PostSkeleton = () => {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-20 w-full mb-4" />
      <Skeleton className="h-48 w-full rounded-xl mb-4" />
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-20" />
      </div>
    </Card>
  );
};
