const FEATURES = [
  {
    title: 'Hand as goose head',
    detail:
      'Reach, grab, and nest with your Quest controllers — the comedy is in the physics.',
    image: '/goose.png',
    imageAlt: 'Goose hand',
  },
  {
    title: 'Steal the bread',
    detail:
      'Toast, baguettes, and more: ferry loaves to the nest before they hit the water.',
    image: '/bread.png',
    imageAlt: 'Stolen bread',
  },
  {
    title: 'Bring goslings home',
    detail:
      'Brushes and moving platforms turn a simple nest run into chaos.',
    image: '/littleGoose.png',
    imageAlt: 'Little goose',
  },
] as const;

export function HomeFeatures() {
  return (
    <section className="border-b border-chrome-indigo px-3 py-6 sm:px-5 sm:py-8">
      <div className="section-label-bar rounded-t-sm">Why players honk</div>
      <div className="bevel-inset rounded-b-sm px-4 py-4 sm:px-5">
        <p className="text-ink-soft max-w-2xl text-xs leading-relaxed sm:text-sm">
          A short VR physics comedy about bad decisions with baked goods.
        </p>
        <ul className="mt-5 grid gap-3 sm:grid-cols-3">
          {FEATURES.map((feature) => (
            <li
              key={feature.title}
              className="bevel-plate-raised flex items-start gap-3 rounded-sm p-3"
            >
              <img
                src={feature.image}
                alt={feature.imageAlt}
                className="h-16 w-16 shrink-0 object-contain"
              />
              <div className="min-w-0">
                <h3 className="label-chrome text-ink flex items-start gap-2">
                  <span
                    className="mt-0.5 inline-flex size-[18px] shrink-0 items-center justify-center rounded-xs bg-signal text-[10px] text-white"
                    aria-hidden
                  >
                    ›
                  </span>
                  {feature.title}
                </h3>
                <p className="text-ink-soft mt-2 text-xs leading-relaxed">
                  {feature.detail}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <div className="bevel-inset mt-5 aspect-video w-full overflow-hidden rounded-sm">
          <iframe
            className="h-full w-full"
            src="https://www.youtube.com/embed/iqbhXyVhIhQ?si=og-LTR-wELvOmwgp"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}
