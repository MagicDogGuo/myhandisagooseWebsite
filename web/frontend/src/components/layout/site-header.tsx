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
    <header className="sticky top-0 z-40">
      <div className="halftone-carbon border-b border-black/40">
        <div className="mx-auto flex max-w-[85rem] items-center justify-between gap-3 px-3 py-2 sm:px-4">
          <NavLink
            to="/"
            aria-label="My Hand Is A Goose home"
            className="inline-flex shrink-0 items-center gap-2 rounded-full border-2 border-primary bg-surface p-0.5 pr-3"
            onClick={() => setOpen(false)}
          >
            <img
              src="/icon.png"
              alt=""
              width={36}
              height={36}
              className="size-9 rounded-full object-cover"
              decoding="async"
            />
            <span className="text-sm font-black tracking-tight text-primary">
              GOOSE
            </span>
          </NavLink>

          <nav
            aria-label="Primary"
            className="hidden flex-wrap items-center gap-1 md:flex"
          >
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={'end' in link ? link.end : false}
                className={({ isActive }) =>
                  cn(
                    'text-nav-chrome rounded-xs px-2.5 py-1.5 transition-colors',
                    isActive
                      ? 'bg-amber text-carbon'
                      : 'text-nav-gold hover:bg-white/10 hover:text-amber',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            className="bevel-chip label-chrome min-h-11 rounded-xs bg-amber px-3 text-carbon md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>

      <div className="border-b border-chrome-indigo bg-sky">
        <div className="text-ink text-micro-chrome mx-auto flex max-w-[85rem] flex-wrap gap-x-3 gap-y-1 px-3 py-1.5 font-bold tracking-[0.5px] uppercase sm:px-4">
          <span>Meta Quest</span>
          <span className="text-chrome-indigo" aria-hidden>
            |
          </span>
          <span>VR Physics Comedy</span>
          <span className="text-chrome-indigo" aria-hidden>
            |
          </span>
          <span>Steal Bread · Nest Goslings</span>
        </div>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="halftone-carbon border-b border-black/40 md:hidden"
        >
          <div className="mx-auto flex max-w-[85rem] flex-col gap-1 px-3 py-3">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={'end' in link ? link.end : false}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'label-chrome min-h-11 rounded-xs px-3 py-3',
                    isActive
                      ? 'bg-amber text-carbon'
                      : 'text-nav-gold hover:bg-white/10',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
