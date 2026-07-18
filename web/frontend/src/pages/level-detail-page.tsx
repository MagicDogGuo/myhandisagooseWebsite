import { useParams } from 'react-router-dom';

export function LevelDetailPage() {
  const { levelId } = useParams();

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">Level {levelId ?? '—'}</h1>
      <p className="text-muted-foreground mt-2 text-sm">Coming soon.</p>
    </main>
  );
}
