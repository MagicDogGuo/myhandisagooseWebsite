import * as React from 'react';

import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'border-chrome-indigo bg-surface text-ink placeholder:text-ink-soft/70 h-11 w-full min-w-0 rounded-sm border px-3 py-2 text-sm outline-none transition-[box-shadow,filter] disabled:cursor-not-allowed disabled:opacity-50 sm:h-9',
        'focus-visible:ring-signal focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
        'aria-invalid:border-games-red aria-invalid:ring-games-red/30',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
