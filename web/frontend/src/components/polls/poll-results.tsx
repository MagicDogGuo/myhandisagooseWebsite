import type { PollOptionResult } from '@/types/api';
import { cn } from '@/lib/utils';

type PollResultsProps = {
  options: PollOptionResult[];
  totalVotes: number;
  myVote: string;
};

function percentOf(voteCount: number, totalVotes: number): number {
  if (totalVotes <= 0) {
    return 0;
  }
  return Math.round((voteCount / totalVotes) * 100);
}

export function PollResults({ options, totalVotes, myVote }: PollResultsProps) {
  return (
    <div className="space-y-3" role="status">
      <p className="label-chrome text-ink-soft">
        Results · {totalVotes} vote{totalVotes === 1 ? '' : 's'}
      </p>
      <ul className="space-y-3">
        {options.map((option) => {
          const percent = percentOf(option.voteCount, totalVotes);
          const isMine = option.id === myVote;

          return (
            <li key={option.id}>
              <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
                <p
                  className={cn(
                    'text-sm text-ink',
                    isMine && 'font-bold',
                  )}
                >
                  {option.label}
                  {isMine ? (
                    <span className="label-chrome text-signal ml-2 text-[10px]">
                      Your vote
                    </span>
                  ) : null}
                </p>
                <p className="font-pixel text-ink text-base">
                  {percent}%
                  <span className="text-ink-soft ml-1 text-xs">
                    ({option.voteCount})
                  </span>
                </p>
              </div>
              <div
                className="bevel-inset h-3 overflow-hidden rounded-sm"
                aria-hidden
              >
                <div
                  className={cn(
                    'h-full rounded-sm transition-[width] duration-300',
                    isMine ? 'bg-signal' : 'bg-chrome-indigo',
                  )}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
