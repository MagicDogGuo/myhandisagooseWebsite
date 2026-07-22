import { ChromeShell } from '@/components/layout/chrome-shell';
import { FeedbackForm } from '@/components/feedback/feedback-form';

export function FeedbackPage() {
  return (
    <ChromeShell>
      <main className="px-3 py-6 sm:px-5 sm:py-8">
        <div className="section-label-bar rounded-t-sm">Feedback</div>
        <div className="bevel-inset animate-rise rounded-b-sm px-4 py-5 sm:px-5">
          <div className="bg-lavender/80 -mx-4 -mt-5 mb-4 flex flex-col items-start gap-4 px-4 py-6 sm:-mx-5 sm:flex-row sm:items-center sm:gap-5 sm:px-5">
            <img
              src="/gooseGIT.gif"
              alt=""
              width={120}
              height={120}
              className="size-24 shrink-0 object-contain sm:size-28"
              decoding="async"
            />
            <h1 className="font-display text-boxart text-3xl leading-none sm:text-4xl">
              Tell the goose team
            </h1>
          </div>
          <p className="text-ink-soft mb-6 max-w-2xl text-xs leading-relaxed sm:text-sm">
            Bugs, ideas, and anything that made you honk. Field errors show under
            each input; if you hit the rate limit, wait a few minutes and try
            again.
          </p>
          <FeedbackForm />
        </div>
      </main>
    </ChromeShell>
  );
}
