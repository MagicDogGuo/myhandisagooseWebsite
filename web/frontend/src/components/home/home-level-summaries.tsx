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
    <section className="px-3 py-6 sm:px-5 sm:py-8">
      <div className="section-label-bar flex flex-wrap items-center justify-between gap-2 rounded-t-sm">
        <span>Levels 0–3</span>
        <Link
          to="/levels"
          className="label-chrome inline-flex items-center gap-1 text-signal hover:brightness-110"
        >
          Browse all
          <span
            className="inline-flex size-4 items-center justify-center rounded-full bg-signal text-[9px] text-white"
            aria-hidden
          >
            ›
          </span>
        </Link>
      </div>
      <div className="bevel-inset rounded-b-sm px-4 py-4 sm:px-5">
        <p className="text-ink-soft max-w-xl text-xs leading-relaxed sm:text-sm">
          Training notes and English prompts from the encyclopedia API.
        </p>

        {isPending ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-24 w-full rounded-sm" />
            ))}
          </div>
        ) : null}

        {isError ? (
          <p className="text-ink-soft mt-4 text-xs sm:text-sm">
            Could not load level summaries. Demo leaderboard above still works
            offline.
          </p>
        ) : null}

        {data ? (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {data.levels.map((level) => (
              <li key={level.levelId}>
                <Link
                  to={`/levels/${level.levelId}`}
                  className="bevel-plate-raised hover:brightness-105 block rounded-sm p-3 transition-[filter]"
                >
                  <p className="label-chrome text-ink-soft">
                    Level {level.levelId}
                  </p>
                  <h3 className="mt-1 text-sm font-bold text-ink">
                    {level.title}
                  </h3>
                  <p className="text-ink-soft mt-2 text-xs italic">
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
