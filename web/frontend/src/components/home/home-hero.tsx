import { Button } from '@/components/ui/button';
import { META_STORE_URL } from '@/lib/store-links';

export function HomeHero() {
  return (
    <section className="border-b border-chrome-indigo bg-canvas px-3 py-3 sm:px-4 sm:py-4">
      <div className="animate-plate-boot relative overflow-hidden rounded-sm border border-chrome-indigo bg-systems-teal shadow-[inset_0_-2px_0_var(--chrome-indigo)]">
        <img
          src="/Herocover.png"
          alt="My Hand Is A Goose — VR goose comedy cover art"
          className="block h-auto min-h-[18rem] w-full object-cover object-[center_35%] sm:min-h-0 sm:object-center"
          width={3000}
          height={900}
          decoding="async"
          fetchPriority="high"
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-carbon/90 via-carbon/50 to-transparent sm:h-1/2 sm:from-carbon/80 sm:via-transparent"
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 px-3 pb-3 pt-10 sm:flex-row sm:items-end sm:justify-between sm:gap-4 sm:px-4 sm:pb-4 sm:pt-0">
          <div className="min-w-0">
            <h1 className="sr-only">My Hand Is A Goose</h1>
            <p className="animate-stamp text-hero-tagline max-w-sm text-white drop-shadow-sm">
              Your hand becomes a goose head. Steal bread, scoop goslings home,
              and try not to drop anything in the pond.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
            <Button
              asChild
              size="sm"
              className="animate-signal-chip w-full sm:w-auto"
            >
              <a
                href={META_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Meta Store{' '}
                <span className="animate-arrow-nudge" aria-hidden>
                  →
                </span>
              </a>
            </Button>
            <Button
              asChild
              size="sm"
              variant="amber"
              className="animate-chip-pop-delay w-full sm:w-auto"
            >
              <a href="#leaderboard">Demo ranks</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
