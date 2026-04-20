import { Skeleton, SkeletonCircle, SkeletonList } from "@/components/ui/skeleton";

export function NutritionSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Calorie ring + macros */}
      <div className="rounded-2xl bg-card border border-border/40 p-6">
        <div className="flex items-center gap-6">
          <SkeletonCircle className="w-32 h-32 shrink-0" />
          <div className="flex-1 space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-1.5" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-10" />
                </div>
                <Skeleton className="h-1 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Water */}
      <div className="rounded-2xl bg-card border border-border/40 p-5 space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="flex gap-1.5">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-2 flex-1 rounded-full" />
          ))}
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1 rounded-xl" />
          <Skeleton className="h-10 flex-1 rounded-xl" />
        </div>
      </div>

      {/* Meals */}
      <div>
        <Skeleton className="h-5 w-28 mb-3" />
        <SkeletonList count={4} />
      </div>
    </div>
  );
}
