import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type ChromeShellProps = {
  children: ReactNode;
  className?: string;
};

export function ChromeShell({ children, className }: ChromeShellProps) {
  return (
    <div className={cn('px-2 py-3 sm:px-4 sm:py-4', className)}>
      <div className="chrome-shell overflow-hidden rounded-md">{children}</div>
    </div>
  );
}
