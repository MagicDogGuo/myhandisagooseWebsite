import { Skeleton } from '@/components/ui/skeleton';

export function PageSkeleton() {
  return (
    <div className="band-inner band-pad flex w-full max-w-3xl flex-col gap-4">
      <Skeleton className="h-10 w-48 rounded-md" />
      <Skeleton className="h-4 w-full rounded-md" />
      <Skeleton className="h-4 w-5/6 rounded-md" />
      <Skeleton className="mt-4 h-40 w-full rounded-md" />
    </div>
  );
}
