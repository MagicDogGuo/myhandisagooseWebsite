import { Link } from 'react-router-dom';

import type { LevelSummary } from '@/types/api';

type LevelCardProps = {
  level: LevelSummary;
};

export function LevelCard({ level }: LevelCardProps) {
  return (
    <Link
      to={`/levels/${level.levelId}`}
      className="bg-surface-card block rounded-md p-6 transition-shadow active:shadow-[0_4px_12px_rgba(0,0,0,0.16)] md:p-8"
    >
      <p className="text-mute-light text-sm">Level {level.levelId}</p>
      <h2 className="font-display mt-2 text-[22px] tracking-[0.1px]">
        {level.title}
      </h2>
      <p className="text-body-light mt-3 text-base leading-normal">
        {level.promptEn}
      </p>
      {level.trainingFocus.length > 0 ? (
        <ul className="text-mute-light mt-4 space-y-1 text-sm">
          {level.trainingFocus.slice(0, 2).map((focus) => (
            <li key={focus}>· {focus}</li>
          ))}
        </ul>
      ) : null}
    </Link>
  );
}
