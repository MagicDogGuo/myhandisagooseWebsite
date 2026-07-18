import { apiFetch } from '@/api/client';
import type { FeedbackSubmitPayload } from '@/lib/feedback-schema';

export type FeedbackSubmitResponse = {
  id: string;
};

export function submitFeedback(payload: FeedbackSubmitPayload) {
  return apiFetch<FeedbackSubmitResponse>('/api/v1/feedback', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
