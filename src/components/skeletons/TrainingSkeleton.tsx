import { Skeleton, SkeletonList } from "@/components/ui/skeleton";

export function TrainingSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-secondary rounded-xl">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-9 flex-1 rounded-lg" />
        ))}
      </div>

      {/* Hero stats */}
      <div className="grid grid-cols-2 gap-3">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="rounded-2xl bg-card border border-border/40 p-4 space-y-2"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-2 w-12" />
          </div>
        ))}
      </div>

      {/* Workout list */}
      <div>
        <Skeleton className="h-5 w-32 mb-3" />
        <SkeletonList count={4} />
      </div>
    </div>
  );
}
