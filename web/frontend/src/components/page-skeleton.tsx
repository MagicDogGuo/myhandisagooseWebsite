import { ChromeShell } from '@/components/layout/chrome-shell';
import { Skeleton } from '@/components/ui/skeleton';

export function PageSkeleton() {
  return (
    <ChromeShell>
      <div className="flex w-full flex-col gap-3 p-5">
        <div className="section-label-bar rounded-sm">Loading</div>
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="mt-2 h-40 w-full" />
      </div>
    </ChromeShell>
  );
}
