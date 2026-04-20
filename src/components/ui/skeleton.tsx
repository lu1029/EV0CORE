import { cn } from "@/lib/utils";

/**
 * Base skeleton block with soft shimmer.
 * Uses semantic tokens so it adapts to light/dark theme automatically.
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-muted/60 animate-skeleton-pulse",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:bg-gradient-to-r before:from-transparent before:via-foreground/[0.06] before:to-transparent",
        "before:animate-[shimmer_2s_ease-in-out_infinite]",
        className,
      )}
      {...props}
    />
  );
}

/** Card-shaped skeleton with internal lines — for list items, plan cards, etc. */
function SkeletonCard({ className, lines = 3 }: { className?: string; lines?: number }) {
  return (
    <div className={cn("rounded-2xl bg-card border border-border/40 p-5 space-y-3", className)}>
      <Skeleton className="h-4 w-1/3" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn("h-3", i === lines - 1 ? "w-2/3" : "w-full")} />
      ))}
    </div>
  );
}

/** Circular skeleton — avatars, ring stats. */
function SkeletonCircle({ className }: { className?: string }) {
  return <Skeleton className={cn("rounded-full", className)} />;
}

/** Pre-built skeleton for a list of items (workouts, meals). */
function SkeletonList({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("rounded-2xl bg-card border border-border/40 overflow-hidden", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn("px-5 py-4 space-y-2", i > 0 && "border-t border-border")}
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-3 w-12" />
          </div>
          <Skeleton className="h-3 w-3/4" />
          <div className="flex gap-3 pt-1">
            <Skeleton className="h-2 w-10" />
            <Skeleton className="h-2 w-10" />
            <Skeleton className="h-2 w-10" />
          </div>
        </div>
      ))}
    </div>
  );
}

export { Skeleton, SkeletonCard, SkeletonCircle, SkeletonList };
