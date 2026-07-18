import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

function Badge({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      data-slot="badge"
      className={cn(
        'bevel-chip label-chrome inline-flex items-center rounded-xs border border-carbon/20 bg-amber px-2 py-0.5 text-carbon',
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
