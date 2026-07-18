import type { Pitfall } from '@/types/api';

type LevelPitfallsProps = {
  pitfalls: Pitfall[];
};

export function LevelPitfalls({ pitfalls }: LevelPitfallsProps) {
  if (pitfalls.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="font-display text-2xl tracking-tight">Common pitfalls</h2>
      <p className="text-muted-foreground mt-2 text-sm">
        Watch out for these failure modes while training.
      </p>
      <ul className="mt-6 space-y-4">
        {pitfalls.map((pitfall) => (
          <li key={pitfall.title} className="border-border/60 border-l-2 pl-4">
            <h3 className="font-medium">{pitfall.title}</h3>
            <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
              {pitfall.detail}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
