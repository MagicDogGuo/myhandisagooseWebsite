import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';

import { ApiError } from '@/api/client';
import { fetchLevelById } from '@/api/levels';
import { LevelPitfalls } from '@/components/levels/level-pitfalls';
import { LevelScreenshots } from '@/components/levels/level-screenshots';
import { Skeleton } from '@/components/ui/skeleton';
import { SafeMarkdown } from '@/lib/markdown';

function parseLevelId(raw: string | undefined): number | null {
  if (raw === undefined || raw === '') {
    return null;
  }
  const id = Number(raw);
  if (!Number.isInteger(id) || id < 0) {
    return null;
  }
  return id;
}

export function LevelDetailPage() {
  const { levelId: levelIdParam } = useParams();
  const levelId = parseLevelId(levelIdParam);

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['levels', levelId],
    queryFn: () => fetchLevelById(levelId as number),
    enabled: levelId !== null,
  });

  const notFound =
    levelId === null || (error instanceof ApiError && error.status === 404);

  return (
    <main className="hero-band-light">
      <div className="mx-auto w-full max-w-3xl px-6 py-12 md:px-12 md:py-16 lg:py-24">
        <Link to="/levels" className="text-link-light text-sm">
          ← All levels
        </Link>

        {levelId === null ? (
          <p className="mt-8" role="alert">
            Invalid level id.
          </p>
        ) : null}

        {isPending && levelId !== null ? (
          <div className="mt-8 space-y-4">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : null}

        {notFound && levelId !== null ? (
          <p className="mt-8" role="alert">
            Level not found. Back to{' '}
            <Link to="/levels" className="text-link-light">
              the list
            </Link>
            .
          </p>
        ) : null}

        {isError && !notFound ? (
          <p className="text-mute-light mt-8 text-sm" role="alert">
            Could not load this level. Please try again later.
          </p>
        ) : null}

        {data ? (
          <article className="mt-8 space-y-12">
            <header>
              <p className="text-mute-light text-sm font-medium tracking-[0.4px]">
                Level {data.levelId}
              </p>
              <h1 className="font-display mt-3 text-[32px] tracking-[-0.1px] sm:text-[44px]">
                {data.title}
              </h1>
              <blockquote className="border-primary text-body-light mt-6 border-l-2 pl-4 text-lg leading-normal">
                {data.promptEn}
              </blockquote>
            </header>

            <section>
              <h2 className="font-display text-[28px] tracking-[0.1px]">
                Training focus
              </h2>
              <ul className="mt-4 space-y-2">
                {data.trainingFocus.map((focus) => (
                  <li
                    key={focus}
                    className="text-body-light before:text-primary flex gap-2 before:content-['•']"
                  >
                    <span>{focus}</span>
                  </li>
                ))}
              </ul>
            </section>

            <SafeMarkdown content={data.bodyMd} />

            <LevelPitfalls pitfalls={data.pitfalls} />

            <LevelScreenshots
              screenshots={data.screenshots}
              levelTitle={data.title}
            />
          </article>
        ) : null}
      </div>
    </main>
  );
}
