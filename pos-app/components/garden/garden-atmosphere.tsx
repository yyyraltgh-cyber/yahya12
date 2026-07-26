"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { AtmosphereState } from "@/lib/garden/types";

const AtmosphereContext = createContext<AtmosphereState>("calm");
export const useGardenAtmosphere = () => useContext(AtmosphereContext);

/**
 * Independent atmosphere layer. Renders on top of GardenTile without
 * knowing anything about growth stages — a night tint, or a few CSS rain
 * drops for "recovery", never touches the stage image itself. Also
 * provides the atmosphere via context so GardenEffects can react to it
 * without prop drilling.
 */
export function GardenAtmosphere({
  atmosphere,
  children,
}: {
  atmosphere: AtmosphereState;
  children: ReactNode;
}) {
  return (
    <AtmosphereContext.Provider value={atmosphere}>
      <div className="relative">
        {children}
        {atmosphere === "night" && (
          <div
            className="pointer-events-none absolute inset-0 rounded-xl"
            style={{ background: "rgba(10, 21, 18, 0.38)" }}
            aria-hidden="true"
          />
        )}
        {atmosphere === "recovery" && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="animate-garden-rain absolute top-0 h-3 w-px bg-[var(--color-primary)]/50"
                style={{ left: `${18 + i * 20}%`, animationDelay: `${i * 0.3}s` }}
              />
            ))}
          </div>
        )}
      </div>
    </AtmosphereContext.Provider>
  );
}
