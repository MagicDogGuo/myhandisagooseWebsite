import { Button } from '@/components/ui/button';
import { META_STORE_URL } from '@/lib/store-links';

export function HomeHero() {
  return (
    <section className="bg-canvas-dark text-on-dark relative isolate overflow-hidden">
      <img
        src="/Herocover.png"
        alt=""
        className="absolute inset-0 size-full object-cover object-[center_40%]"
        width={1920}
        height={1080}
        fetchPriority="high"
        decoding="async"
      />
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            'linear-gradient(180deg, rgb(0 0 0 / 0.15) 0%, rgb(0 0 0 / 0.2) 45%, rgb(0 0 0 / 0.82) 100%)',
        }}
      />
      <div className="band-inner band-pad relative flex min-h-[min(100svh,44rem)] flex-col justify-end">
        <h1 className="sr-only">My Hand Is A Goose</h1>
        <p className="animate-rise text-body-dark text-sm font-medium tracking-[0.4px]">
          Meta Quest VR
        </p>
        <p className="animate-rise-delay-1 mt-4 max-w-xl text-lg leading-normal text-on-dark sm:text-[22px]">
          Your hand becomes a goose head. Steal bread, scoop goslings home, and
          try not to drop anything in the pond.
        </p>
        <div className="animate-rise-delay-2 mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg" variant="commerce">
            <a href={META_STORE_URL} target="_blank" rel="noopener noreferrer">
              Get on Meta Store
            </a>
          </Button>
          <Button asChild size="lg" variant="outline-dark">
            <a href="#leaderboard">See demo ranks</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
