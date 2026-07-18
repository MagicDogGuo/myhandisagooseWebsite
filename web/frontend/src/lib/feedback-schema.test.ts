import { describe, expect, it } from 'vitest';

import {
  feedbackSchema,
  toFeedbackSubmitPayload,
} from '@/lib/feedback-schema';

describe('feedbackSchema', () => {
  it('accepts a valid payload', () => {
    const parsed = feedbackSchema.safeParse({
      category: 'bug',
      levelId: '2',
      message: 'Bread keeps vanishing mid-grab.',
      email: 'tester@example.com',
      website: '',
    });

    expect(parsed.success).toBe(true);
  });

  it('rejects short messages with a field error', () => {
    const parsed = feedbackSchema.safeParse({
      category: 'suggestion',
      levelId: '',
      message: 'too short',
      email: '',
      website: '',
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const messageIssue = parsed.error.issues.find(
        (issue) => issue.path[0] === 'message',
      );
      expect(messageIssue?.message).toMatch(/at least 10/i);
    }
  });

  it('rejects invalid email', () => {
    const parsed = feedbackSchema.safeParse({
      category: 'other',
      message: 'Long enough message for validation.',
      email: 'not-an-email',
      website: '',
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const emailIssue = parsed.error.issues.find(
        (issue) => issue.path[0] === 'email',
      );
      expect(emailIssue).toBeDefined();
    }
  });

  it('maps form values to API payload', () => {
    expect(
      toFeedbackSubmitPayload({
        category: 'bug',
        levelId: '1',
        message: 'Long enough message for validation.',
        email: 'a@b.co',
        website: '',
      }),
    ).toEqual({
      category: 'bug',
      levelId: 1,
      message: 'Long enough message for validation.',
      email: 'a@b.co',
    });
  });
});
