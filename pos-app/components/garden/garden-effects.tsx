"use client";

import { useGardenAtmosphere } from "./garden-atmosphere";

/**
 * Achievement-only effects: a soft glow + a few golden particles. Reads
 * atmosphere from context (set by GardenAtmosphere) — renders nothing for
 * every other state, so it costs nothing outside the celebration moment.
 */
export function GardenEffects() {
  const atmosphere = useGardenAtmosphere();
  if (atmosphere !== "celebration") return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible" aria-hidden="true">
      <div
        className="absolute inset-0 rounded-xl animate-garden-glow"
        style={{ boxShadow: "0 0 18px 4px var(--color-accent)" }}
      />
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="animate-garden-particle absolute h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]"
          style={{ left: `${20 + i * 14}%`, bottom: "10%", animationDelay: `${i * 0.08}s` }}
        />
      ))}
    </div>
  );
}
