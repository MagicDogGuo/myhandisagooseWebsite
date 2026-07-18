import { Link } from 'react-router-dom';

import type { LevelSummary } from '@/types/api';

type LevelCardProps = {
  level: LevelSummary;
};

export function LevelCard({ level }: LevelCardProps) {
  return (
    <Link
      to={`/levels/${level.levelId}`}
      className="border-border/70 bg-card/60 hover:border-brand-teal/50 block rounded-lg border p-5 transition-colors"
    >
      <p className="text-muted-foreground text-xs tracking-wide uppercase">
        Level {level.levelId}
      </p>
      <h2 className="font-display mt-1 text-xl tracking-tight">{level.title}</h2>
      <p className="text-muted-foreground mt-3 text-sm italic">{level.promptEn}</p>
      {level.trainingFocus.length > 0 ? (
        <ul className="text-muted-foreground mt-4 space-y-1 text-sm">
          {level.trainingFocus.slice(0, 2).map((focus) => (
            <li key={focus}>· {focus}</li>
          ))}
        </ul>
      ) : null}
    </Link>
  );
}
