const FEATURES = [
  {
    title: 'Hand as goose head',
    detail:
      'Reach, grab, and nest with your Quest controllers — the comedy is in the physics.',
  },
  {
    title: 'Steal the bread',
    detail:
      'Toast, baguettes, and more: ferry loaves to the nest before they hit the water.',
  },
  {
    title: 'Bring goslings home',
    detail:
      'Hooks, brushes, and moving platforms turn a simple nest run into chaos.',
  },
] as const;

export function HomeFeatures() {
  return (
    <section className="hero-band-light">
      <div className="band-inner band-pad">
        <h2 className="font-display text-[28px] tracking-[0.1px] sm:text-[35px] lg:text-[44px]">
          Why players honk
        </h2>
        <p className="text-body-light mt-4 max-w-xl text-lg leading-normal">
          A short VR physics comedy about bad decisions with baked goods.
        </p>
        <ul className="mt-12 grid gap-8 sm:grid-cols-3 sm:gap-6">
          {FEATURES.map((feature) => (
            <li
              key={feature.title}
              className="bg-surface-card rounded-md p-6 md:p-8"
            >
              <h3 className="font-display text-[22px] tracking-[0.1px]">
                {feature.title}
              </h3>
              <p className="text-body-light mt-3 text-base leading-normal">
                {feature.detail}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
