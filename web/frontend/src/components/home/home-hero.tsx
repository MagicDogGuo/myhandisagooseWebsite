import { Button } from '@/components/ui/button';
import { META_STORE_URL } from '@/lib/store-links';

export function HomeHero() {
  return (
    <section className="border-b border-chrome-indigo bg-canvas px-3 py-3 sm:px-4 sm:py-4">
      <div className="relative overflow-hidden rounded-sm border border-chrome-indigo bg-systems-teal shadow-[inset_0_-2px_0_var(--chrome-indigo)]">
        <img
          src="/Herocover.png"
          alt="My Hand Is A Goose — VR goose comedy cover art"
          className="block h-auto w-full"
          width={3000}
          height={900}
          decoding="async"
          fetchPriority="high"
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-carbon/80 to-transparent"
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 px-3 pb-3 sm:flex-row sm:items-end sm:justify-between sm:px-4 sm:pb-4">
          <div>
            <h1 className="sr-only">My Hand Is A Goose</h1>
            <p className="animate-rise text-hero-tagline max-w-sm text-white drop-shadow-sm">
              Your hand becomes a goose head. Steal bread, scoop goslings home,
              and try not to drop anything in the pond.
            </p>
          </div>
          <div className="animate-rise-delay-1 flex flex-wrap gap-2">
            <Button asChild size="sm" className="animate-signal">
              <a
                href={META_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Meta Store →
              </a>
            </Button>
            <Button asChild size="sm" variant="amber">
              <a href="#leaderboard">Demo ranks</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
