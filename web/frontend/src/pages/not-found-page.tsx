import { Link, useLocation } from 'react-router-dom';

import { ChromeShell } from '@/components/layout/chrome-shell';
import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  const { pathname } = useLocation();

  return (
    <ChromeShell>
      <main className="px-3 py-6 sm:px-5 sm:py-8">
        <div className="section-label-bar rounded-t-sm">Error 404</div>
        <div className="bevel-inset animate-rise rounded-b-sm px-4 py-5 sm:px-5">
          <div className="bg-games-red/90 -mx-4 -mt-5 mb-5 flex flex-col items-start gap-4 px-4 py-6 sm:-mx-5 sm:flex-row sm:items-center sm:gap-6 sm:px-5">
            <img
              src="/icon.png"
              alt=""
              width={96}
              height={96}
              className="animate-rise size-20 shrink-0 rounded-sm border border-carbon/40 object-cover shadow-[0.12em_0.12em_0_var(--carbon)] sm:size-24"
              decoding="async"
            />
            <div className="min-w-0">
              <p className="label-chrome text-amber mb-2">Path not found</p>
              <h1 className="font-display text-boxart text-3xl leading-none sm:text-4xl">
                Wrong pond
              </h1>
            </div>
          </div>

          <p className="text-ink-soft max-w-xl text-xs leading-relaxed sm:text-sm">
            This route flew off with the goslings. The page you asked for is not
            on this console — check the address, or hop back to safer water.
          </p>

          {pathname && pathname !== '/' ? (
            <p
              className="bevel-plate-raised mt-4 rounded-sm px-3 py-2 font-mono text-[0.7rem] text-ink sm:text-xs"
              role="status"
            >
              <span className="label-chrome text-ink-soft mr-2">Tried</span>
              {pathname}
            </p>
          ) : null}

          <div className="animate-rise-delay-1 mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button asChild size="sm" className="w-full sm:w-auto">
              <Link to="/">Back home →</Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant="amber"
              className="w-full sm:w-auto"
            >
              <Link to="/levels">Level encyclopedia</Link>
            </Button>
          </div>
        </div>
      </main>
    </ChromeShell>
  );
}
