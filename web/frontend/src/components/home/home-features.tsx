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
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <h2 className="font-display text-3xl tracking-tight sm:text-4xl">
        Why players honk
      </h2>
      <p className="text-muted-foreground mt-3 max-w-2xl">
        A short VR physics comedy about bad decisions with baked goods.
      </p>
      <ul className="mt-10 grid gap-8 sm:grid-cols-3">
        {FEATURES.map((feature) => (
          <li key={feature.title}>
            <h3 className="font-display text-xl">{feature.title}</h3>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              {feature.detail}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
