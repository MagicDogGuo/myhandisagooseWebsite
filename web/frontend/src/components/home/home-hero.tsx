import { WanderingLittleGoose } from '@/components/home/wandering-little-goose';
import { MetaIcon, SideQuestIcon } from '@/components/icons/store-icons';
import { Button } from '@/components/ui/button';
import { META_STORE_URL, SIDEQUEST_URL } from '@/lib/store-links';

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
      <div className="animate-plate-boot relative mx-auto w-full max-w-[min(100%,calc(56rem*1.2))]">
        <div className="relative aspect-[1536/1024] w-full overflow-hidden">
          {/* Behind CRT: occluded by opaque bezel / screen pixels */}
          <WanderingLittleGoose />

          <img
            src="/crt-monitor.png"
            alt=""
            className="pointer-events-none absolute inset-0 z-10 size-full object-contain select-none"
            width={1536}
            height={1024}
            decoding="async"
            fetchPriority="high"
            aria-hidden
          />

          <div
            className="@container/crt absolute z-20 overflow-hidden rounded-[0.35rem] sm:rounded-md"
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
            {/*
              Size against the CRT screen hole (@container/crt), not the viewport —
              the hole is only ~52% of hero width, so sm: breakpoints fire too early.
            */}
            <div className="relative z-10 flex h-full flex-col items-center justify-center gap-[clamp(0.35rem,2.8cqi,1rem)] px-[clamp(0.4rem,3.5cqi,1.5rem)] py-[clamp(0.4rem,3cqi,1.25rem)] text-center">
              <div className="animate-stamp w-full max-w-[min(100%,28rem)]">
                <h1 className="font-display text-boxart text-[clamp(0.85rem,7.2cqi,2.35rem)] leading-[1.05] font-black tracking-tight">
                  My Hand Is A Goose
                </h1>
                <p className="mt-[clamp(0.25rem,1.4cqi,0.5rem)] line-clamp-2 text-[clamp(0.55rem,3.1cqi,1rem)] leading-snug font-bold text-white drop-shadow-sm @[16rem]/crt:line-clamp-3 @[24rem]/crt:line-clamp-none">
                  Your hand becomes a goose head. Steal bread, scoop goslings
                  home, and try not to drop anything in the pond.
                </p>
              </div>
              <div className="flex w-full max-w-[min(100%,18rem)] flex-col gap-[clamp(0.3rem,1.6cqi,0.5rem)] @[22rem]/crt:max-w-none @[22rem]/crt:w-auto @[22rem]/crt:flex-row @[22rem]/crt:justify-center">
                <Button
                  asChild
                  size="sm"
                  className="animate-signal-chip h-[clamp(1.5rem,8cqi,2.25rem)] min-h-0 w-full gap-1 px-[clamp(0.4rem,2.5cqi,0.75rem)] text-[clamp(0.58rem,2.8cqi,0.8rem)] @[22rem]/crt:w-auto"
                >
                  <a
                    href={META_STORE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MetaIcon className="size-[1.1em] shrink-0" />
                    <span className="min-w-0 truncate">Meta Store</span>
                    <span className="animate-arrow-nudge shrink-0" aria-hidden>
                      →
                    </span>
                  </a>
                </Button>
                <Button
                  asChild
                  size="sm"
                  variant="amber"
                  className="animate-chip-pop-delay h-[clamp(1.5rem,8cqi,2.25rem)] min-h-0 w-full gap-1 px-[clamp(0.4rem,2.5cqi,0.75rem)] text-[clamp(0.58rem,2.8cqi,0.8rem)] @[22rem]/crt:w-auto"
                >
                  <a
                    href={SIDEQUEST_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <SideQuestIcon className="size-[1.1em] shrink-0" />
                    <span className="min-w-0 truncate">SideQuest</span>
                    <span className="animate-arrow-nudge shrink-0" aria-hidden>
                      →
                    </span>
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
