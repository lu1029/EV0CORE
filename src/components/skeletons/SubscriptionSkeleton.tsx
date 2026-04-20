import { Skeleton } from "@/components/ui/skeleton";

export function SubscriptionSkeleton() {
  return (
    <div className="rounded-2xl bg-card border border-border/40 p-5 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
      <Skeleton className="h-10 w-full rounded-xl" />
    </div>
  );
}

export function PremiumPlansSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-3 animate-fade-in">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="rounded-2xl bg-card border border-border/40 p-4 space-y-3"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-2 w-24" />
          <div className="space-y-2 pt-2">
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-2 w-5/6" />
            <Skeleton className="h-2 w-4/6" />
          </div>
        </div>
      ))}
    </div>
  );
}
