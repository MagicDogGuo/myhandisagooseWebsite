import type { Pitfall } from '@/types/api';

type LevelPitfallsProps = {
  pitfalls: Pitfall[];
};

export function LevelPitfalls({ pitfalls }: LevelPitfallsProps) {
  if (pitfalls.length === 0) {
    return null;
  }

  return (
    <section className="overflow-hidden rounded-sm">
      <div className="section-label-bar">Common pitfalls</div>
      <div className="bevel-inset px-4 py-4 sm:px-5">
        <p className="text-ink-soft text-xs sm:text-sm">
          Watch out for these failure modes while training.
        </p>
        <ul className="mt-4 space-y-3">
          {pitfalls.map((pitfall) => (
            <li
              key={pitfall.title}
              className="bevel-plate-raised rounded-sm p-3"
            >
              <h3 className="label-chrome text-ink flex items-center gap-2">
                <span className="inline-block rounded-xs bg-amber px-1.5 py-0.5 text-carbon">
                  !
                </span>
                {pitfall.title}
              </h3>
              <p className="text-ink-soft mt-2 text-xs leading-relaxed sm:text-sm">
                {pitfall.detail}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
