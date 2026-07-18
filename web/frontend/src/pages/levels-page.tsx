import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

import { fetchLevelSummaries } from '@/api/levels';
import { ChromeShell } from '@/components/layout/chrome-shell';
import { LevelCard } from '@/components/levels/level-card';
import { Skeleton } from '@/components/ui/skeleton';

export function LevelsPage() {
  const { data, isPending, isError } = useQuery({
    queryKey: ['levels'],
    queryFn: fetchLevelSummaries,
  });

  return (
    <ChromeShell>
      <main className="px-3 py-6 sm:px-5 sm:py-8">
        <div className="section-label-bar rounded-t-sm">Encyclopedia</div>
        <div className="bevel-inset rounded-b-sm px-4 py-5 sm:px-5">
          <h1 className="font-display text-boxart bg-lavender/80 -mx-4 -mt-5 mb-4 px-4 py-6 text-3xl leading-none sm:-mx-5 sm:px-5 sm:text-4xl">
            Levels 0–3
          </h1>
          <p className="text-ink-soft max-w-2xl text-xs leading-relaxed sm:text-sm">
            Training focus, English prompts, and common failure modes for the
            early goose curriculum.
          </p>

          {isPending ? (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-36 w-full rounded-sm" />
              ))}
            </div>
          ) : null}

          {isError ? (
            <p className="text-ink-soft mt-6 text-xs sm:text-sm" role="alert">
              Could not load levels. Check that the API is running, then{' '}
              <Link to="/levels" className="font-bold text-signal underline">
                try again
              </Link>
              .
            </p>
          ) : null}

          {data ? (
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {data.levels.map((level) => (
                <li key={level.levelId}>
                  <LevelCard level={level} />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </main>
    </ChromeShell>
  );
}
