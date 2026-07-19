import { Link } from 'react-router-dom';

import { ChromeShell } from '@/components/layout/chrome-shell';
import { PollPanel } from '@/components/polls/poll-panel';
import { Skeleton } from '@/components/ui/skeleton';
import { usePolls } from '@/hooks/use-polls';

export function PollsPage() {
  const { data, isPending, isError, refetch, isFetching } = usePolls();

  return (
    <ChromeShell>
      <main className="px-3 py-6 sm:px-5 sm:py-8">
        <div className="section-label-bar rounded-t-sm">Polls</div>
        <div className="bevel-inset animate-rise rounded-b-sm px-4 py-5 sm:px-5">
          <h1 className="font-display text-boxart bg-lavender/80 -mx-4 -mt-5 mb-4 px-4 py-6 text-3xl leading-none sm:-mx-5 sm:px-5 sm:text-4xl">
            Cast your vote
          </h1>
          <p className="text-ink-soft mb-6 max-w-2xl text-xs leading-relaxed sm:text-sm">
            One anonymous vote per poll on this browser. Results update live
            after you vote; reload keeps your choice via a private cookie — no
            account required.
          </p>

          {isPending ? (
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, index) => (
                <Skeleton key={index} className="h-48 w-full rounded-sm" />
              ))}
            </div>
          ) : null}

          {isError ? (
            <p className="text-ink-soft text-xs sm:text-sm" role="alert">
              Could not load polls. Check that the API is running, then{' '}
              <button
                type="button"
                className="font-bold text-signal underline"
                onClick={() => {
                  void refetch();
                }}
                disabled={isFetching}
              >
                try again
              </button>
              .
            </p>
          ) : null}

          {data && data.polls.length === 0 ? (
            <p className="text-ink-soft text-xs sm:text-sm">
              No active polls right now. Check back after the next seed, or
              browse the{' '}
              <Link to="/levels" className="font-bold text-signal underline">
                level encyclopedia
              </Link>
              .
            </p>
          ) : null}

          {data && data.polls.length > 0 ? (
            <ul className="space-y-4">
              {data.polls.map((poll) => (
                <li key={poll.id}>
                  <PollPanel poll={poll} />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </main>
    </ChromeShell>
  );
}
