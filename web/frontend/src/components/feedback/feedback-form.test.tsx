import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/api/client';
import { submitFeedback } from '@/api/feedback';
import { FeedbackForm } from '@/components/feedback/feedback-form';

vi.mock('@/api/feedback', () => ({
  submitFeedback: vi.fn(),
}));

function renderForm() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={client}>
      <FeedbackForm />
    </QueryClientProvider>,
  );
}

describe('FeedbackForm', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.mocked(submitFeedback).mockReset();
  });

  it('shows field errors when message is too short', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.selectOptions(screen.getByLabelText(/^category$/i), 'bug');
    await user.type(
      screen.getByRole('textbox', { name: /message/i }),
      'too short',
    );
    await user.click(screen.getByRole('button', { name: /send feedback/i }));

    expect(
      await screen.findByText(/at least 10 characters/i),
    ).toBeInTheDocument();
    expect(submitFeedback).not.toHaveBeenCalled();
  });

  it('shows success UI after submit', async () => {
    const user = userEvent.setup();
    vi.mocked(submitFeedback).mockResolvedValue({ id: 'abc123' });
    renderForm();

    await user.selectOptions(
      screen.getByLabelText(/^category$/i),
      'suggestion',
    );
    await user.type(
      screen.getByRole('textbox', { name: /message/i }),
      'This is a long enough feedback message.',
    );
    await user.click(screen.getByRole('button', { name: /send feedback/i }));

    expect(await screen.findByText(/feedback received/i)).toBeInTheDocument();
    expect(screen.getByText('abc123')).toBeInTheDocument();
    expect(vi.mocked(submitFeedback).mock.calls[0]?.[0]).toEqual({
      category: 'suggestion',
      message: 'This is a long enough feedback message.',
    });
  });

  it('shows rate-limit message on 429', async () => {
    const user = userEvent.setup();
    vi.mocked(submitFeedback).mockRejectedValue(
      new ApiError(429, {
        error: { code: 'RATE_LIMITED', message: 'Too many requests' },
      }),
    );
    renderForm();

    await user.selectOptions(screen.getByLabelText(/^category$/i), 'other');
    await user.type(
      screen.getByRole('textbox', { name: /message/i }),
      'This is a long enough feedback message.',
    );
    await user.click(screen.getByRole('button', { name: /send feedback/i }));

    expect(
      await screen.findByText(/too many feedback submissions/i),
    ).toBeInTheDocument();
  });
});
