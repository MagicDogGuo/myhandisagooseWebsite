import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

function Badge({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      data-slot="badge"
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium tracking-wide',
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
