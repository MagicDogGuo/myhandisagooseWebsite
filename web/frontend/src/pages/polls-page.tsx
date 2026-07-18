import { ChromeShell } from '@/components/layout/chrome-shell';

function ComingSoonPanel({ title }: { title: string }) {
  return (
    <ChromeShell>
      <main className="px-3 py-6 sm:px-5 sm:py-8">
        <div className="section-label-bar rounded-t-sm">{title}</div>
        <div className="bevel-inset rounded-b-sm px-4 py-8 sm:px-5">
          <p className="label-chrome text-ink-soft">Coming soon</p>
          <p className="text-ink-soft mt-2 text-xs sm:text-sm">
            This module is wired in the route map and will ship in a later task.
          </p>
        </div>
      </main>
    </ChromeShell>
  );
}

export function PollsPage() {
  return <ComingSoonPanel title="Polls" />;
}
