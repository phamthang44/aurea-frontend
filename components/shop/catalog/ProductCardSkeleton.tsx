export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col space-y-3 animate-pulse">
      {/* Image Skeleton */}
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-muted/30 rounded-lg border border-border/50">
        <div className="absolute inset-0 bg-muted" />
      </div>

      {/* Info Skeleton */}
      <div className="flex flex-col space-y-2">
        <div className="h-3 w-20 bg-muted rounded" />
        <div className="h-4 w-full bg-muted rounded" />
        <div className="h-4 w-3/4 bg-muted rounded" />
        <div className="h-5 w-24 bg-muted rounded mt-1" />
      </div>
    </div>
  );
}

