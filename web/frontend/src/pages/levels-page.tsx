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
    <main className="hero-band-light">
      <div className="band-inner band-pad">
        <p className="text-mute-light text-sm font-medium tracking-[0.4px]">
          Encyclopedia
        </p>
        <h1 className="font-display mt-3 text-[32px] tracking-[-0.1px] sm:text-[44px] lg:text-[54px]">
          Levels 0–3
        </h1>
        <p className="text-body-light mt-4 max-w-xl text-lg leading-normal">
          Training focus, English prompts, and common failure modes for the early
          goose curriculum.
        </p>

        {isPending ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-40 w-full rounded-md" />
            ))}
          </div>
        ) : null}

        {isError ? (
          <p className="text-mute-light mt-10 text-sm" role="alert">
            Could not load levels. Check that the API is running, then{' '}
            <Link to="/levels" className="text-link-light">
              try again
            </Link>
            .
          </p>
        ) : null}

        {data ? (
          <ul className="mt-12 grid gap-6 sm:grid-cols-2">
            {data.levels.map((level) => (
              <li key={level.levelId}>
                <LevelCard level={level} />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </main>
  );
}
