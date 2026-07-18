import { z } from 'zod';

export const feedbackCategories = ['bug', 'suggestion', 'other'] as const;

export const feedbackSchema = z.object({
  category: z.enum(feedbackCategories, {
    error: 'Choose a category',
  }),
  levelId: z
    .union([z.literal(''), z.enum(['0', '1', '2', '3', '4', '5', '6', '7'])])
    .optional(),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be at most 2000 characters'),
  email: z.union([
    z.literal(''),
    z.string().email('Enter a valid email'),
  ]),
  website: z.string().max(0).optional(),
});

export type FeedbackFormValues = z.infer<typeof feedbackSchema>;

export type FeedbackSubmitPayload = {
  category: FeedbackFormValues['category'];
  message: string;
  email?: string;
  levelId?: number;
  website?: string;
};

export function toFeedbackSubmitPayload(
  values: FeedbackFormValues,
): FeedbackSubmitPayload {
  const levelId =
    values.levelId === undefined || values.levelId === ''
      ? undefined
      : Number(values.levelId);

  return {
    category: values.category,
    message: values.message,
    ...(values.email ? { email: values.email } : {}),
    ...(levelId !== undefined ? { levelId } : {}),
    ...(values.website ? { website: values.website } : {}),
  };
}
