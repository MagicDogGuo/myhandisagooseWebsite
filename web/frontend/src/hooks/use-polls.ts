import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { castVote, fetchPolls } from '@/api/polls';
import type { CastVoteResponse, PollsListResponse } from '@/types/api';

export const pollsQueryKey = ['polls'] as const;

export function usePolls() {
  return useQuery({
    queryKey: pollsQueryKey,
    queryFn: fetchPolls,
  });
}

export function useCastVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      pollId,
      optionId,
    }: {
      pollId: string;
      optionId: string;
    }) => castVote(pollId, optionId),
    onSuccess: (data: CastVoteResponse) => {
      queryClient.setQueryData<PollsListResponse>(pollsQueryKey, (current) => {
        if (!current) {
          return { polls: [data.poll] };
        }

        return {
          polls: current.polls.map((poll) =>
            poll.id === data.poll.id ? data.poll : poll,
          ),
        };
      });
      void queryClient.invalidateQueries({ queryKey: pollsQueryKey });
    },
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: pollsQueryKey });
    },
  });
}
