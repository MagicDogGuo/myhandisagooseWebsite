import { Skeleton } from '@/components/ui/skeleton';

export function PageSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-6">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="mt-4 h-40 w-full" />
    </div>
  );
}
