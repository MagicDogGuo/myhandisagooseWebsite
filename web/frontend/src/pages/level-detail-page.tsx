import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';

import { ApiError } from '@/api/client';
import { fetchLevelById } from '@/api/levels';
import { ChromeShell } from '@/components/layout/chrome-shell';
import { LevelAdjacentNav } from '@/components/levels/level-adjacent-nav';
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
    <ChromeShell>
      <main className="px-3 py-6 sm:px-5 sm:py-8">
        <Link
          to="/levels"
          className="label-chrome text-signal inline-flex items-center gap-1 hover:brightness-110"
        >
          <span aria-hidden>‹</span> All levels
        </Link>

        {levelId === null ? (
          <p className="mt-6 text-sm font-bold text-primary" role="alert">
            Invalid level id.
          </p>
        ) : null}

        {isPending && levelId !== null ? (
          <div className="mt-6 space-y-3">
            <Skeleton className="h-10 w-2/3 rounded-sm" />
            <Skeleton className="h-6 w-full rounded-sm" />
            <Skeleton className="h-40 w-full rounded-sm" />
          </div>
        ) : null}

        {notFound && levelId !== null ? (
          <p className="mt-6 text-sm" role="alert">
            Level not found. Back to{' '}
            <Link to="/levels" className="font-bold text-signal underline">
              the list
            </Link>
            .
          </p>
        ) : null}

        {isError && !notFound ? (
          <p className="text-ink-soft mt-6 text-xs sm:text-sm" role="alert">
            Could not load this level. Please try again later.
          </p>
        ) : null}

        {data ? (
          <article className="mt-5 space-y-5">
            <LevelAdjacentNav currentLevelId={data.levelId} />

            <header className="bevel-plate overflow-hidden rounded-sm">
              <div className="section-label-bar">Level {data.levelId}</div>
              <div className="bg-lavender/70 px-4 py-5 sm:px-5">
                <h1 className="font-display text-boxart text-3xl leading-none sm:text-4xl">
                  {data.title}
                </h1>
                <blockquote className="mt-4 border-l-4 border-signal pl-3 text-sm font-bold italic text-ink">
                  {data.promptEn}
                </blockquote>
              </div>
            </header>

            <LevelScreenshots
              screenshots={data.screenshots}
              levelTitle={data.title}
            />

            <section className="overflow-hidden rounded-sm">
              <div className="section-label-bar">Training focus</div>
              <ul className="bevel-inset space-y-2 px-4 py-4 sm:px-5">
                {data.trainingFocus.map((focus) => (
                  <li
                    key={focus}
                    className="text-ink-soft flex gap-2 text-xs sm:text-sm"
                  >
                    <span className="text-signal" aria-hidden>
                      ›
                    </span>
                    <span>{focus}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="overflow-hidden rounded-sm">
              <div className="section-label-bar">Guide</div>
              <div className="bevel-inset px-4 py-4 text-xs leading-relaxed sm:px-5 sm:text-sm [&_a]:font-bold [&_a]:text-ink-soft [&_h2]:label-chrome [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:label-chrome [&_h3]:mt-3 [&_h3]:mb-1 [&_li]:my-1 [&_p]:my-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5">
                <SafeMarkdown content={data.bodyMd} />
              </div>
            </section>

            <LevelPitfalls pitfalls={data.pitfalls} />

            <LevelAdjacentNav currentLevelId={data.levelId} />
          </article>
        ) : null}
      </main>
    </ChromeShell>
  );
}
