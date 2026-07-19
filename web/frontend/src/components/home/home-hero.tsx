import { Button } from '@/components/ui/button';
import { META_STORE_URL } from '@/lib/store-links';

const HERO_SHOT = `/screeShot/${encodeURIComponent('Image Sequence_010_0000.jpg')}`;

/** Screen hole measured from crt-monitor.png (1536×1024). */
const SCREEN = {
  left: '23.6%',
  top: '15.1%',
  width: '52.5%',
  height: '57.4%',
} as const;

export function HomeHero() {
  return (
    <section className="border-b border-chrome-indigo bg-canvas px-2 py-3 sm:px-4 sm:py-5">
      <div className="animate-plate-boot relative mx-auto w-full max-w-4xl">
        <div className="relative aspect-[1536/1024] w-full">
          <img
            src="/crt-monitor.png"
            alt=""
            className="pointer-events-none absolute inset-0 size-full object-contain select-none"
            width={1536}
            height={1024}
            decoding="async"
            fetchPriority="high"
            aria-hidden
          />

          <div
            className="absolute overflow-hidden rounded-[0.35rem] sm:rounded-md"
            style={SCREEN}
          >
            <img
              src={HERO_SHOT}
              alt=""
              className="absolute inset-0 size-full object-cover object-[center_55%]"
              width={1920}
              height={1080}
              decoding="async"
              aria-hidden
            />
            <div className="crt-glass" aria-hidden />
            <div className="relative z-10 flex h-full flex-col items-center justify-center gap-2 px-2 py-3 text-center sm:gap-3 sm:px-4 sm:py-5 md:gap-4 md:px-6">
              <div className="animate-stamp max-w-[22rem] sm:max-w-md">
                <h1 className="font-display text-boxart text-[clamp(1.05rem,3.6vw,2.35rem)] leading-[1.05] font-black tracking-tight">
                  My Hand Is A Goose
                </h1>
                <p className="mt-1.5 text-[clamp(0.65rem,1.55vw,1rem)] leading-snug font-bold text-white drop-shadow-sm sm:mt-2">
                  Your hand becomes a goose head. Steal bread, scoop goslings
                  home, and try not to drop anything in the pond.
                </p>
              </div>
              <div className="flex w-full max-w-xs flex-col gap-1.5 sm:w-auto sm:max-w-none sm:flex-row sm:justify-center sm:gap-2">
                <Button
                  asChild
                  size="sm"
                  className="animate-signal-chip h-8 w-full px-2.5 text-[0.7rem] sm:h-9 sm:w-auto sm:text-xs"
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
                  className="animate-chip-pop-delay h-8 w-full px-2.5 text-[0.7rem] sm:h-9 sm:w-auto sm:text-xs"
                >
                  <a href="#leaderboard">Demo ranks</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
