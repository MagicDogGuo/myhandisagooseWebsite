import { useEffect, useRef } from 'react';

const COUNT = 5;
const BASE_SIZE = 7.5;
const MARGIN = 1.2;
const SPEED_MIN = 6.5;
const SPEED_MAX = 15;
const ARRIVE = 1.2;
/** Chance a new target is behind the CRT screen (otherwise stay outside). */
const BEHIND_SCREEN_CHANCE = 0.12;

/**
 * Opaque CRT body (from crt-monitor.png alpha bbox).
 * Outside this box the goose stays visible.
 */
const MONITOR = {
  left: 17.8,
  top: 5,
  right: 82,
  bottom: 95,
} as const;

/** Screen hole — going here hides the goose behind the CRT. */
const SCREEN = {
  left: 23.6,
  top: 15.1,
  right: 76.1,
  bottom: 72.5,
} as const;

const SIZES = [6.2, 7.5, 8.4, 7, 9] as const;

type Pos = { x: number; y: number };

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function clampRange(min: number, max: number): [number, number] | null {
  if (max - min < 0.5) return null;
  return [min, max];
}

/** Prefer left/right (and thin top/bottom) corridors outside the monitor. */
function randomOutsideTarget(size: number): Pos {
  const sizeH = size * 1.15;
  const yFull = clampRange(MARGIN, 100 - sizeH - MARGIN);
  const bands: Array<() => Pos> = [];

  const leftX = clampRange(MARGIN, MONITOR.left - size);
  if (leftX && yFull) {
    bands.push(() => ({ x: rand(...leftX), y: rand(...yFull) }));
  }

  const rightX = clampRange(MONITOR.right, 100 - size - MARGIN);
  if (rightX && yFull) {
    bands.push(() => ({ x: rand(...rightX), y: rand(...yFull) }));
  }

  const topY = clampRange(MARGIN, MONITOR.top - sizeH);
  const xFull = clampRange(MARGIN, 100 - size - MARGIN);
  if (topY && xFull) {
    bands.push(() => ({ x: rand(...xFull), y: rand(...topY) }));
  }

  const bottomY = clampRange(MONITOR.bottom, 100 - sizeH - MARGIN);
  if (bottomY && xFull) {
    bands.push(() => ({ x: rand(...xFull), y: rand(...bottomY) }));
  }

  if (bands.length === 0) {
    return { x: MARGIN, y: MARGIN };
  }

  return bands[Math.floor(Math.random() * bands.length)]!();
}

function randomBehindScreenTarget(size: number): Pos {
  const sizeH = size * 1.15;
  const xRange = clampRange(SCREEN.left, SCREEN.right - size);
  const yRange = clampRange(SCREEN.top, SCREEN.bottom - sizeH);
  if (!xRange || !yRange) return randomOutsideTarget(size);
  return { x: rand(...xRange), y: rand(...yRange) };
}

function randomTarget(size: number, preferOutside: boolean): Pos {
  if (preferOutside || Math.random() > BEHIND_SCREEN_CHANCE) {
    return randomOutsideTarget(size);
  }
  return randomBehindScreenTarget(size);
}

function GooseSprite({ size, delayMs }: { size: number; delayMs: number }) {
  const shellRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const shell = shellRef.current;
    const img = imgRef.current;
    if (!shell || !img) return;

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    let pos = randomOutsideTarget(size);
    let target = randomOutsideTarget(size);
    let speed = rand(SPEED_MIN, SPEED_MAX);
    let facing = target.x >= pos.x ? -1 : 1;
    let raf = 0;
    let last = performance.now();
    let started = false;

    const apply = () => {
      shell.style.left = `${pos.x}%`;
      shell.style.top = `${pos.y}%`;
      // Flip inside a fixed shell so position does not jump.
      img.style.transform = `scaleX(${facing})`;
    };

    apply();

    if (reduceMotion) return;

    const startAt = performance.now() + delayMs;

    const tick = (now: number) => {
      if (!started) {
        if (now < startAt) {
          raf = requestAnimationFrame(tick);
          return;
        }
        started = true;
        last = now;
      }

      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const dx = target.x - pos.x;
      const dy = target.y - pos.y;
      const dist = Math.hypot(dx, dy);

      if (dist < ARRIVE) {
        target = randomTarget(size, false);
        speed = rand(SPEED_MIN, SPEED_MAX);
      } else {
        const step = Math.min(dist, speed * dt);
        pos = {
          x: pos.x + (dx / dist) * step,
          y: pos.y + (dy / dist) * step,
        };
        if (Math.abs(dx) > 0.15) facing = dx >= 0 ? -1 : 1;
        apply();
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [size, delayMs]);

  return (
    <div
      ref={shellRef}
      className="pointer-events-none absolute z-0 will-change-[left,top]"
      style={{ width: `${size}%` }}
      aria-hidden
    >
      <img
        ref={imgRef}
        src="/littleGoose_2.gif"
        alt=""
        className="block size-full origin-center select-none will-change-transform"
        width={720}
        height={720}
        decoding="async"
        aria-hidden
      />
    </div>
  );
}

/** Flock of little geese that wander mostly outside the CRT. */
export function WanderingLittleGoose() {
  return (
    <>
      {Array.from({ length: COUNT }, (_, i) => (
        <GooseSprite
          key={i}
          size={SIZES[i] ?? BASE_SIZE}
          delayMs={i * 180}
        />
      ))}
    </>
  );
}
