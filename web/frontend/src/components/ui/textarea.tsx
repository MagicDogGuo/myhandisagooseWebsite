import * as React from 'react';

import { cn } from '@/lib/utils';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'border-chrome-indigo bg-surface text-ink placeholder:text-ink-soft/70 field-sizing-content min-h-28 w-full rounded-sm border px-3 py-2 text-sm outline-none transition-[box-shadow,filter] disabled:cursor-not-allowed disabled:opacity-50',
        'focus-visible:ring-signal focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
        'aria-invalid:border-games-red aria-invalid:ring-games-red/30',
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
