import { useState } from 'react';
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
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-canvas-dark text-on-dark sticky top-0 z-40">
      <div className="band-inner flex h-12 items-center justify-between gap-4 px-6 md:px-12">
        <NavLink
          to="/"
          className="font-display text-on-dark text-lg tracking-[0.1px]"
          onClick={() => setOpen(false)}
        >
          My Hand Is A Goose
        </NavLink>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-1 md:flex"
        >
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={'end' in link ? link.end : false}
              className={({ isActive }) =>
                cn(
                  'rounded-full px-3 py-1.5 text-[18px] font-medium tracking-[0.4px] transition-colors',
                  isActive
                    ? 'text-on-dark'
                    : 'text-body-dark hover:text-on-dark',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          className="text-on-dark flex size-11 items-center justify-center md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="sr-only">{open ? 'Close' : 'Menu'}</span>
          <span aria-hidden className="flex flex-col gap-1.5">
            <span
              className={cn(
                'bg-on-dark block h-0.5 w-5 transition-transform',
                open && 'translate-y-2 rotate-45',
              )}
            />
            <span
              className={cn(
                'bg-on-dark block h-0.5 w-5 transition-opacity',
                open && 'opacity-0',
              )}
            />
            <span
              className={cn(
                'bg-on-dark block h-0.5 w-5 transition-transform',
                open && '-translate-y-2 -rotate-45',
              )}
            />
          </span>
        </button>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="border-hairline-dark border-t px-6 py-4 md:hidden"
        >
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={'end' in link ? link.end : false}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'block rounded-md px-3 py-3 text-base font-medium',
                      isActive ? 'bg-surface-dark-card text-on-dark' : 'text-body-dark',
                    )
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
