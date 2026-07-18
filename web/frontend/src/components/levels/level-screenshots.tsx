import { useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type LevelScreenshotsProps = {
  screenshots: string[];
  levelTitle: string;
};

/** API paths end in .png; local placeholders ship as .svg until real captures land. */
function resolveScreenshotSrc(src: string): string {
  if (src.startsWith('/placeholders/levels/') && src.endsWith('.png')) {
    return src.replace(/\.png$/, '.svg');
  }
  return src;
}

export function LevelScreenshots({
  screenshots,
  levelTitle,
}: LevelScreenshotsProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (screenshots.length === 0) {
    return null;
  }

  const activeSrc =
    activeIndex !== null
      ? resolveScreenshotSrc(screenshots[activeIndex] ?? '')
      : undefined;

  return (
    <section>
      <h2 className="font-display text-2xl tracking-tight">Screenshots</h2>
      <p className="text-muted-foreground mt-2 text-sm">
        Tap an image to open the lightbox. Placeholder art until final captures
        land.
      </p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {screenshots.map((src, index) => {
          const resolved = resolveScreenshotSrc(src);
          return (
            <li key={src}>
              <button
                type="button"
                className="border-border/70 bg-secondary/50 focus-visible:ring-ring group relative block w-full overflow-hidden rounded-lg border focus-visible:ring-2 focus-visible:outline-none"
                onClick={() => setActiveIndex(index)}
                aria-label={`Open screenshot ${index + 1} of ${levelTitle}`}
              >
                <img
                  src={resolved}
                  alt={`${levelTitle} screenshot ${index + 1}`}
                  className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  loading="lazy"
                />
              </button>
            </li>
          );
        })}
      </ul>

      <Dialog
        open={activeIndex !== null}
        onOpenChange={(open) => {
          if (!open) {
            setActiveIndex(null);
          }
        }}
      >
        <DialogContent className="max-w-4xl p-3 sm:p-4">
          <DialogHeader className="sr-only">
            <DialogTitle>
              {levelTitle} screenshot{' '}
              {activeIndex !== null ? activeIndex + 1 : ''}
            </DialogTitle>
            <DialogDescription>Enlarged level screenshot</DialogDescription>
          </DialogHeader>
          {activeSrc ? (
            <img
              src={activeSrc}
              alt={`${levelTitle} screenshot ${activeIndex !== null ? activeIndex + 1 : ''}`}
              className="max-h-[80vh] w-full rounded-md object-contain"
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
}
