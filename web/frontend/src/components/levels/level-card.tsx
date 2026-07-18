import { Link } from 'react-router-dom';

import type { LevelSummary } from '@/types/api';

type LevelCardProps = {
  level: LevelSummary;
};

export function LevelCard({ level }: LevelCardProps) {
  return (
    <Link
      to={`/levels/${level.levelId}`}
      className="bevel-plate-raised hover:brightness-105 block rounded-sm p-4 transition-[filter]"
    >
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
    </Link>
  );
}
