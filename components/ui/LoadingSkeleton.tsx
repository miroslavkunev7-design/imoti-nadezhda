interface SkeletonProps {
  className?: string
}

function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded bg-[rgba(255,255,255,0.05)] ${className}`}
    />
  )
}

export function PropertyCardSkeleton() {
  return (
    <div className="glass-card overflow-hidden">
      <Skeleton className="w-full aspect-[4/3]" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-6 w-28 mt-2" />
      </div>
    </div>
  )
}

export function CityCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden aspect-[4/3]">
      <Skeleton className="w-full h-full" />
    </div>
  )
}

export function NeighborhoodCardSkeleton() {
  return (
    <div className="glass-card overflow-hidden">
      <Skeleton className="w-full aspect-video" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-8 w-28 mt-3" />
      </div>
    </div>
  )
}

export default Skeleton
