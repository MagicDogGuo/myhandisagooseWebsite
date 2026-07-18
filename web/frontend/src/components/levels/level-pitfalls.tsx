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
      <h2 className="font-display text-[28px] tracking-[0.1px]">
        Common pitfalls
      </h2>
      <p className="text-body-light mt-3 text-base leading-normal">
        Watch out for these failure modes while training.
      </p>
      <ul className="mt-6 space-y-4">
        {pitfalls.map((pitfall) => (
          <li
            key={pitfall.title}
            className="border-hairline-light border-b py-4 last:border-0"
          >
            <h3 className="text-lg font-semibold">{pitfall.title}</h3>
            <p className="text-body-light mt-1 text-base leading-normal">
              {pitfall.detail}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
