import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

import { fetchLevelSummaries } from '@/api/levels';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function HomeLevelSummaries() {
  const { data, isPending, isError } = useQuery({
    queryKey: ['levels'],
    queryFn: fetchLevelSummaries,
  });

  return (
    <section className="hero-band-light">
      <div className="band-inner band-pad">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-[28px] tracking-[0.1px] sm:text-[35px] lg:text-[44px]">
              Levels 0–3
            </h2>
            <p className="text-body-light mt-4 max-w-xl text-lg leading-normal">
              Training notes and English prompts from the encyclopedia API.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/levels">Browse all levels</Link>
          </Button>
        </div>

        {isPending ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-32 w-full rounded-md" />
            ))}
          </div>
        ) : null}

        {isError ? (
          <p className="text-mute-light mt-8 text-sm">
            Could not load level summaries. Demo leaderboard above still works
            offline.
          </p>
        ) : null}

        {data ? (
          <ul className="mt-12 grid gap-6 sm:grid-cols-2">
            {data.levels.map((level) => (
              <li key={level.levelId}>
                <Link
                  to={`/levels/${level.levelId}`}
                  className="bg-surface-card block rounded-md p-6 transition-shadow active:shadow-[0_4px_12px_rgba(0,0,0,0.16)] md:p-8"
                >
                  <p className="text-mute-light text-sm">
                    Level {level.levelId}
                  </p>
                  <h3 className="font-display mt-2 text-[22px] tracking-[0.1px]">
                    {level.title}
                  </h3>
                  <p className="text-body-light mt-3 text-base leading-normal">
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
