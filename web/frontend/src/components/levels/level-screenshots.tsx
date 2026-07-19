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

export function LevelScreenshots({
  screenshots,
  levelTitle,
}: LevelScreenshotsProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (screenshots.length === 0) {
    return null;
  }

  const activeSrc =
    activeIndex !== null ? (screenshots[activeIndex] ?? undefined) : undefined;

  return (
    <section className="overflow-hidden rounded-sm">
      <div className="section-label-bar">Screenshots</div>
      <div className="bevel-inset px-4 py-4 sm:px-5">
        <p className="text-ink-soft text-xs sm:text-sm">
          Tap an image to open the lightbox.
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {screenshots.map((src, index) => (
            <li key={src}>
              <button
                type="button"
                className="bevel-plate focus-visible:ring-signal group relative block w-full overflow-hidden rounded-sm focus-visible:ring-2 focus-visible:outline-none"
                onClick={() => setActiveIndex(index)}
                aria-label={`Open screenshot ${index + 1} of ${levelTitle}`}
              >
                <img
                  src={src}
                  alt={`${levelTitle} screenshot ${index + 1}`}
                  className="aspect-video w-full object-cover"
                  loading={index === 0 ? 'eager' : 'lazy'}
                  fetchPriority={index === 0 ? 'high' : 'auto'}
                />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <Dialog
        open={activeIndex !== null}
        onOpenChange={(open) => {
          if (!open) {
            setActiveIndex(null);
          }
        }}
      >
        <DialogContent className="max-w-4xl rounded-sm border-chrome-indigo bg-platinum p-3 sm:p-4">
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
              className="max-h-[80vh] w-full rounded-sm object-contain"
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
}
