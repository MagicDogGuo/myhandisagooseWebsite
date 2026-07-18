import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

function Badge({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      data-slot="badge"
      className={cn(
        'bg-primary text-primary-foreground inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium tracking-wide',
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
