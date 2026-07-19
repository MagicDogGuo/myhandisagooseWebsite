import { z } from 'zod';

export const voteBodySchema = z.object({
  optionId: z.string().min(1).max(64),
});

export type VoteBody = z.infer<typeof voteBodySchema>;

export const VOTER_TOKEN_COOKIE = 'voter_token';
