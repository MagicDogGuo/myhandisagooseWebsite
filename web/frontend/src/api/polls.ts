import { apiFetch } from '@/api/client';
import type { CastVoteResponse, PollsListResponse } from '@/types/api';

export function fetchPolls() {
  return apiFetch<PollsListResponse>('/api/v1/polls');
}

export function castVote(pollId: string, optionId: string) {
  return apiFetch<CastVoteResponse>(`/api/v1/polls/${pollId}/vote`, {
    method: 'POST',
    body: JSON.stringify({ optionId }),
  });
}
