import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

import { fetchLevelSummaries } from '@/api/levels';
import { Button } from '@/components/ui/button';

type LevelAdjacentNavProps = {
  currentLevelId: number;
};

export function LevelAdjacentNav({ currentLevelId }: LevelAdjacentNavProps) {
  const { data } = useQuery({
    queryKey: ['levels'],
    queryFn: fetchLevelSummaries,
  });

  const sorted = data
    ? [...data.levels].sort((a, b) => a.levelId - b.levelId)
    : [];
  const index = sorted.findIndex((level) => level.levelId === currentLevelId);
  const prev = index > 0 ? sorted[index - 1] : null;
  const next =
    index >= 0 && index < sorted.length - 1 ? sorted[index + 1] : null;

  if (!prev && !next) {
    return null;
  }

  return (
    <nav
      className="flex flex-wrap items-stretch justify-between gap-3"
      aria-label="Adjacent levels"
    >
      {prev ? (
        <Button asChild variant="outline" className="max-w-[calc(50%-0.375rem)]">
          <Link to={`/levels/${prev.levelId}`} className="min-w-0">
            <span aria-hidden>‹</span>
            <span className="truncate">Level {prev.levelId}</span>
          </Link>
        </Button>
      ) : (
        <span className="min-w-0 flex-1" aria-hidden />
      )}
      {next ? (
        <Button
          asChild
          variant="outline"
          className="ml-auto max-w-[calc(50%-0.375rem)]"
        >
          <Link to={`/levels/${next.levelId}`} className="min-w-0">
            <span className="truncate">Level {next.levelId}</span>
            <span aria-hidden>›</span>
          </Link>
        </Button>
      ) : null}
    </nav>
  );
}
