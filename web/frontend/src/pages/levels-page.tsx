import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

import { fetchLevelSummaries } from '@/api/levels';
import { LevelCard } from '@/components/levels/level-card';
import { Skeleton } from '@/components/ui/skeleton';

export function LevelsPage() {
  const { data, isPending, isError } = useQuery({
    queryKey: ['levels'],
    queryFn: fetchLevelSummaries,
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="text-muted-foreground text-sm tracking-wide uppercase">
        Encyclopedia
      </p>
      <h1 className="font-display mt-2 text-4xl tracking-tight sm:text-5xl">
        Levels 0–3
      </h1>
      <p className="text-muted-foreground mt-4 max-w-2xl">
        Training focus, English prompts, and common failure modes for the early
        goose curriculum.
      </p>

      {isPending ? (
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-40 w-full" />
          ))}
        </div>
      ) : null}

      {isError ? (
        <p className="text-muted-foreground mt-10 text-sm" role="alert">
          Could not load levels. Check that the API is running, then{' '}
          <Link to="/levels" className="underline underline-offset-4">
            try again
          </Link>
          .
        </p>
      ) : null}

      {data ? (
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {data.levels.map((level) => (
            <li key={level.levelId}>
              <LevelCard level={level} />
            </li>
          ))}
        </ul>
      ) : null}
    </main>
  );
}
