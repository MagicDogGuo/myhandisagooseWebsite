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
    levelId === null ||
    (error instanceof ApiError && error.status === 404);

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <Link
        to="/levels"
        className="text-muted-foreground text-sm underline-offset-4 hover:underline"
      >
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
          <Link to="/levels" className="underline underline-offset-4">
            the list
          </Link>
          .
        </p>
      ) : null}

      {isError && !notFound ? (
        <p className="text-muted-foreground mt-8 text-sm" role="alert">
          Could not load this level. Please try again later.
        </p>
      ) : null}

      {data ? (
        <article className="mt-8 space-y-12">
          <header>
            <p className="text-muted-foreground text-sm tracking-wide uppercase">
              Level {data.levelId}
            </p>
            <h1 className="font-display mt-2 text-4xl tracking-tight">
              {data.title}
            </h1>
            <blockquote className="border-brand-teal/40 text-foreground mt-6 border-l-2 pl-4 text-lg italic">
              {data.promptEn}
            </blockquote>
          </header>

          <section>
            <h2 className="font-display text-2xl tracking-tight">
              Training focus
            </h2>
            <ul className="mt-4 space-y-2">
              {data.trainingFocus.map((focus) => (
                <li
                  key={focus}
                  className="text-muted-foreground before:text-brand-teal flex gap-2 before:content-['•']"
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
    </main>
  );
}
