import { NavLink } from 'react-router-dom';

import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/levels', label: 'Levels' },
  { to: '/polls', label: 'Polls' },
  { to: '/viewer', label: 'Viewer' },
  { to: '/press', label: 'Press' },
  { to: '/feedback', label: 'Feedback' },
] as const;

export function SiteHeader() {
  return (
    <header className="border-border/60 bg-background/80 sticky top-0 z-40 border-b backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <NavLink
          to="/"
          className="font-display text-foreground text-lg tracking-tight"
        >
          My Hand Is A Goose
        </NavLink>
        <nav aria-label="Primary" className="flex flex-wrap items-center gap-1 sm:gap-2">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={'end' in link ? link.end : false}
              className={({ isActive }) =>
                cn(
                  'rounded-md px-2.5 py-1.5 text-sm transition-colors',
                  isActive
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
