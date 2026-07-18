import { Button } from '@/components/ui/button';
import { META_STORE_URL } from '@/lib/store-links';

export function HomeHero() {
  return (
    <section className="hero-plane relative isolate overflow-hidden">
      <div className="hero-ripple pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative mx-auto flex min-h-[min(100svh,44rem)] max-w-6xl flex-col justify-end px-4 pb-16 pt-24 sm:px-6 sm:pb-20">
        <p className="font-display animate-rise text-brand-ink/70 text-sm tracking-[0.2em] uppercase">
          Meta Quest VR
        </p>
        <h1 className="font-display animate-rise-delay-1 text-brand-ink mt-3 max-w-3xl text-5xl leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
          My Hand Is A Goose
        </h1>
        <p className="animate-rise-delay-2 text-brand-ink/80 mt-5 max-w-xl text-base sm:text-lg">
          Your hand becomes a goose head. Steal bread, scoop goslings home, and
          try not to drop anything in the pond.
        </p>
        <div className="animate-rise-delay-3 mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg" className="bg-brand-gold text-brand-ink hover:bg-brand-gold/90">
            <a href={META_STORE_URL} target="_blank" rel="noopener noreferrer">
              Get on Meta Store
            </a>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-brand-ink/20 bg-white/40 backdrop-blur-sm">
            <a href="#leaderboard">See demo ranks</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
