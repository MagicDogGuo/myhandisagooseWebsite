import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

import { fetchLevelSummaries } from '@/api/levels';
import { Skeleton } from '@/components/ui/skeleton';

export function HomeLevelSummaries() {
  const { data, isPending, isError } = useQuery({
    queryKey: ['levels'],
    queryFn: fetchLevelSummaries,
  });

  return (
    <section className="border-border/50 bg-secondary/40 border-y">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl tracking-tight sm:text-4xl">
              Levels 0–3
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl">
              Training notes and English prompts from the encyclopedia API.
            </p>
          </div>
          <Link
            to="/levels"
            className="text-sm font-medium underline-offset-4 hover:underline"
          >
            Browse all levels
          </Link>
        </div>

        {isPending ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-28 w-full" />
            ))}
          </div>
        ) : null}

        {isError ? (
          <p className="text-muted-foreground mt-8 text-sm">
            Could not load level summaries. Demo leaderboard above still works
            offline.
          </p>
        ) : null}

        {data ? (
          <ul className="mt-10 grid gap-6 sm:grid-cols-2">
            {data.levels.map((level) => (
              <li key={level.levelId}>
                <Link
                  to={`/levels/${level.levelId}`}
                  className="hover:border-brand-teal/40 block rounded-lg border border-transparent p-1 transition-colors"
                >
                  <p className="text-muted-foreground text-xs tracking-wide uppercase">
                    Level {level.levelId}
                  </p>
                  <h3 className="font-display mt-1 text-xl">{level.title}</h3>
                  <p className="text-muted-foreground mt-2 text-sm italic">
                    {level.promptEn}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
