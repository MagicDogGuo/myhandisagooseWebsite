import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/api/client';
import { castVote } from '@/api/polls';
import { PollPanel } from '@/components/polls/poll-panel';
import type { PollResult } from '@/types/api';

vi.mock('@/api/polls', () => ({
  castVote: vi.fn(),
  fetchPolls: vi.fn(),
}));

const basePoll: PollResult = {
  id: 'poll-1',
  question: 'What should we add next?',
  options: [
    { id: 'patrol', label: 'Patrol officer gameplay', voteCount: 2 },
    { id: 'bread', label: 'More bread varieties', voteCount: 1 },
  ],
  totalVotes: 3,
  myVote: null,
};

function renderPanel(poll: PollResult = basePoll) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={client}>
      <PollPanel poll={poll} />
    </QueryClientProvider>,
  );
}

describe('PollPanel', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.mocked(castVote).mockReset();
  });

  it('shows results when the browser already voted', () => {
    renderPanel({ ...basePoll, myVote: 'patrol' });

    expect(screen.getByText(/your vote/i)).toBeInTheDocument();
    expect(screen.getByText(/results/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^vote$/i })).not.toBeInTheDocument();
  });

  it('casts a vote and then shows live results', async () => {
    const user = userEvent.setup();
    vi.mocked(castVote).mockResolvedValue({
      poll: {
        ...basePoll,
        options: [
          { id: 'patrol', label: 'Patrol officer gameplay', voteCount: 3 },
          { id: 'bread', label: 'More bread varieties', voteCount: 1 },
        ],
        totalVotes: 4,
        myVote: 'patrol',
      },
    });

    renderPanel();

    await user.click(
      screen.getByRole('radio', { name: /patrol officer gameplay/i }),
    );
    await user.click(screen.getByRole('button', { name: /^vote$/i }));

    expect(castVote).toHaveBeenCalledWith('poll-1', 'patrol');
    expect(await screen.findByText(/your vote/i)).toBeInTheDocument();
  });

  it('shows a friendly message on rate limit', async () => {
    const user = userEvent.setup();
    vi.mocked(castVote).mockRejectedValue(
      new ApiError(429, { error: { code: 'RATE_LIMITED' } }),
    );

    renderPanel();

    await user.click(
      screen.getByRole('radio', { name: /more bread varieties/i }),
    );
    await user.click(screen.getByRole('button', { name: /^vote$/i }));

    expect(
      await screen.findByText(/too many votes from this network/i),
    ).toBeInTheDocument();
  });
});
