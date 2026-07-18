import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { submitFeedback } from '@/api/feedback';
import { ApiError } from '@/api/client';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  feedbackSchema,
  toFeedbackSubmitPayload,
  type FeedbackFormValues,
} from '@/lib/feedback-schema';
import { cn } from '@/lib/utils';

const CATEGORY_OPTIONS: {
  value: FeedbackFormValues['category'];
  label: string;
}[] = [
  { value: 'bug', label: 'Bug report' },
  { value: 'suggestion', label: 'Suggestion' },
  { value: 'other', label: 'Other' },
];

const LEVEL_OPTIONS = [
  { value: '', label: 'Not level-specific' },
  { value: '0', label: 'Level 0' },
  { value: '1', label: 'Level 1' },
  { value: '2', label: 'Level 2' },
  { value: '3', label: 'Level 3' },
] as const;

const selectClassName = cn(
  'border-chrome-indigo bg-surface text-ink h-11 w-full rounded-sm border px-3 py-2 text-sm outline-none transition-[box-shadow,filter] disabled:cursor-not-allowed disabled:opacity-50 sm:h-9',
  'focus-visible:ring-signal focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
  'aria-invalid:border-games-red aria-invalid:ring-games-red/30',
);

function getSubmitErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 429) {
      return 'Too many feedback submissions. Please wait a bit and try again.';
    }
    if (error.status === 400) {
      return 'Some fields look invalid. Check the form and try again.';
    }
    return 'Could not send feedback right now. Please try again later.';
  }
  return 'Could not send feedback right now. Please try again later.';
}

export function FeedbackForm() {
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      category: undefined,
      levelId: '',
      message: '',
      email: '',
      website: '',
    },
    mode: 'onSubmit',
  });

  const mutation = useMutation({
    mutationFn: submitFeedback,
    onSuccess: (data) => {
      setSubmittedId(data.id);
      form.reset({
        category: undefined,
        levelId: '',
        message: '',
        email: '',
        website: '',
      });
    },
  });

  if (submittedId) {
    return (
      <div
        className="bevel-plate-raised animate-rise rounded-sm px-4 py-6"
        role="status"
      >
        <p className="label-chrome text-ink">Thanks — feedback received</p>
        <p className="text-ink-soft mt-2 text-xs sm:text-sm">
          Your note is in the queue. Reference id:{' '}
          <span className="font-pixel text-ink text-base">{submittedId}</span>
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-5"
          onClick={() => {
            setSubmittedId(null);
            mutation.reset();
          }}
        >
          Send another
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        className="grid gap-5"
        noValidate
        onSubmit={form.handleSubmit((values) => {
          mutation.reset();
          mutation.mutate(toFeedbackSubmitPayload(values));
        })}
      >
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <select
                  {...field}
                  value={field.value ?? ''}
                  className={selectClassName}
                  disabled={mutation.isPending}
                  aria-required="true"
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="levelId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Related level</FormLabel>
              <FormControl>
                <select
                  {...field}
                  value={field.value ?? ''}
                  className={selectClassName}
                  disabled={mutation.isPending}
                >
                  {LEVEL_OPTIONS.map((option) => (
                    <option key={option.label} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormDescription>
                Optional — leave blank if not about a level.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={6}
                  placeholder="What happened, what you expected, and how to reproduce…"
                  disabled={mutation.isPending}
                />
              </FormControl>
              <FormDescription>10–2000 characters.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email (optional)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  disabled={mutation.isPending}
                />
              </FormControl>
              <FormDescription>
                Only if you want a reply — never required.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Honeypot — leave empty */}
        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem
              aria-hidden="true"
              className="pointer-events-none absolute -left-[9999px] h-0 w-0 overflow-hidden opacity-0"
            >
              <FormLabel>Website</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  tabIndex={-1}
                  autoComplete="off"
                  type="text"
                />
              </FormControl>
            </FormItem>
          )}
        />

        {mutation.isError ? (
          <p
            className="border-games-red bg-surface text-games-red rounded-sm border px-3 py-2 text-xs sm:text-sm"
            role="alert"
          >
            {getSubmitErrorMessage(mutation.error)}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Sending…' : 'Send feedback'}
          </Button>
          <p className="text-ink-soft text-micro-chrome">
            We store the note and may email the team. No account needed.
          </p>
        </div>
      </form>
    </Form>
  );
}
