import { z } from 'zod';

export const feedbackBodySchema = z.object({
  category: z.enum(['bug', 'suggestion', 'other']),
  levelId: z.number().int().min(0).max(7).optional(),
  message: z.string().min(10).max(2000),
  email: z
    .string()
    .email()
    .optional()
    .or(z.literal(''))
    .transform((value) => (value === '' ? undefined : value)),
  website: z.string().max(0).optional(),
});

export type FeedbackBody = z.infer<typeof feedbackBodySchema>;
