import { Link } from 'react-router-dom';

import type { LevelSummary } from '@/types/api';

type LevelCardProps = {
  level: LevelSummary;
  /** Compact layout for the home teaser: text left, thumb right. */
  compact?: boolean;
};

export function LevelCard({ level, compact = false }: LevelCardProps) {
  const cover = level.screenshots[0];

  if (compact) {
    return (
      <Link
        to={`/levels/${level.levelId}`}
        className="bevel-plate-raised hover:brightness-105 flex items-center gap-3 rounded-sm p-3 transition-[filter]"
      >
        <div className="min-w-0 flex-1">
          <p className="label-chrome text-ink-soft">Level {level.levelId}</p>
          <h3 className="mt-1 text-sm font-bold text-ink">{level.title}</h3>
          <p className="text-ink-soft mt-2 line-clamp-2 text-xs italic">
            {level.promptEn}
          </p>
        </div>
        {cover ? (
          <img
            src={cover}
            alt=""
            className="aspect-video w-24 shrink-0 rounded-sm object-cover sm:w-28"
            loading="lazy"
          />
        ) : null}
      </Link>
    );
  }

  return (
    <Link
      to={`/levels/${level.levelId}`}
      className="bevel-plate-raised hover:brightness-105 block overflow-hidden rounded-sm transition-[filter]"
    >
      {cover ? (
        <img
          src={cover}
          alt=""
          className="aspect-video w-full object-cover"
          loading="lazy"
        />
      ) : null}
      <div className="p-4">
        <p className="label-chrome text-ink-soft">Level {level.levelId}</p>
        <h2 className="mt-1 text-base font-bold tracking-tight text-ink">
          {level.title}
        </h2>
        <p className="text-ink-soft mt-3 text-xs italic">{level.promptEn}</p>
        {level.trainingFocus.length > 0 ? (
          <ul className="text-ink-soft mt-3 space-y-1 text-xs">
            {level.trainingFocus.slice(0, 2).map((focus) => (
              <li key={focus} className="flex gap-2">
                <span className="text-signal" aria-hidden>
                  ›
                </span>
                {focus}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Link>
  );
}
