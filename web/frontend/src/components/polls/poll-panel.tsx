import { useState } from 'react';

import { ApiError } from '@/api/client';
import { PollResults } from '@/components/polls/poll-results';
import { Button } from '@/components/ui/button';
import { useCastVote } from '@/hooks/use-polls';
import { cn } from '@/lib/utils';
import type { PollResult } from '@/types/api';

type PollPanelProps = {
  poll: PollResult;
};

function getVoteErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 409) {
      return 'You already voted on this poll. Results are shown above.';
    }
    if (error.status === 429) {
      return 'Too many votes from this network. Please wait a bit and try again.';
    }
    if (error.status === 400) {
      return 'That option is not valid for this poll.';
    }
    if (error.status === 404) {
      return 'This poll is no longer available.';
    }
  }
  return 'Could not cast your vote right now. Please try again later.';
}

export function PollPanel({ poll }: PollPanelProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string>('');
  const mutation = useCastVote();

  const displayPoll =
    mutation.isSuccess && mutation.data ? mutation.data.poll : poll;
  const myVote = displayPoll.myVote;

  if (myVote) {
    return (
      <article className="bevel-plate-raised animate-rise rounded-sm px-4 py-5 sm:px-5">
        <p className="label-chrome text-ink-soft">Player&apos;s poll</p>
        <h2 className="mt-2 text-base font-bold text-ink sm:text-lg">
          {displayPoll.question}
        </h2>
        <div className="mt-5">
          <PollResults
            options={displayPoll.options}
            totalVotes={displayPoll.totalVotes}
            myVote={myVote}
          />
        </div>
      </article>
    );
  }

  return (
    <article className="bevel-plate-raised animate-rise rounded-sm px-4 py-5 sm:px-5">
      <p className="label-chrome text-ink-soft">Player&apos;s poll</p>
      <h2
        className="mt-2 text-base font-bold text-ink sm:text-lg"
        id={`poll-${poll.id}-q`}
      >
        {poll.question}
      </h2>

      <fieldset
        className="mt-5 space-y-2"
        aria-labelledby={`poll-${poll.id}-q`}
      >
        <legend className="sr-only">Choose one option</legend>
        {poll.options.map((option) => {
          const inputId = `poll-${poll.id}-option-${option.id}`;
          const checked = selectedOptionId === option.id;

          return (
            <label
              key={option.id}
              htmlFor={inputId}
              className={cn(
                'bevel-inset flex min-h-11 cursor-pointer items-center gap-3 rounded-sm px-3 py-2 transition-[filter]',
                checked &&
                  'brightness-105 ring-2 ring-signal ring-offset-2 ring-offset-periwinkle',
              )}
            >
              <span
                className={cn(
                  'relative flex size-4 shrink-0 items-center justify-center rounded-full border border-chrome-indigo bg-surface',
                  checked && 'border-signal',
                )}
                aria-hidden
              >
                {checked ? (
                  <span className="size-2 rounded-full bg-signal" />
                ) : null}
              </span>
              <input
                id={inputId}
                type="radio"
                name={`poll-${poll.id}`}
                value={option.id}
                checked={checked}
                onChange={() => {
                  setSelectedOptionId(option.id);
                  mutation.reset();
                }}
                className="sr-only"
                disabled={mutation.isPending}
              />
              <span className="text-sm text-ink">{option.label}</span>
            </label>
          );
        })}
      </fieldset>

      {mutation.isError ? (
        <p className="text-games-red mt-3 text-xs sm:text-sm" role="alert">
          {getVoteErrorMessage(mutation.error)}
        </p>
      ) : null}

      <Button
        type="button"
        className="mt-5"
        disabled={!selectedOptionId || mutation.isPending}
        onClick={() => {
          if (!selectedOptionId) {
            return;
          }
          mutation.mutate({ pollId: poll.id, optionId: selectedOptionId });
        }}
      >
        {mutation.isPending ? 'Voting…' : 'Vote'}
      </Button>
    </article>
  );
}
