import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface VendorCardSkeletonProps {
  className?: string;
}

export function VendorCardSkeleton({ className }: VendorCardSkeletonProps) {
  return (
    <div className={cn('bg-card rounded-xl overflow-hidden border border-border', className)}>
      <div className="flex flex-row">
        <Skeleton className="w-[140px] md:w-[200px] aspect-[3/4] flex-shrink-0 rounded-none" />
        <div className="flex-1 p-3 md:p-4 flex flex-col gap-2 min-w-0">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-full mt-1" />
          <Skeleton className="h-3 w-full" />
          <div className="flex gap-2 mt-auto pt-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 flex-1 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function VendorCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <VendorCardSkeleton key={i} />
      ))}
    </div>
  );
}
