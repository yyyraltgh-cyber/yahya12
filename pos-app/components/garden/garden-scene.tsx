"use client";

import { GardenTile } from "./garden-tile";
import { GardenAtmosphere } from "./garden-atmosphere";
import { GardenEffects } from "./garden-effects";
import { GardenFrameAccent } from "./decorative-elements";
import type { AtmosphereState, GrowthLevel } from "@/lib/garden/types";

/**
 * Composition root only — combines layers, passes data, controls layout.
 * No SVG drawing logic lives here; each layer owns its own rendering.
 */
export function GardenScene({
  growthLevel,
  atmosphere,
}: {
  growthLevel: GrowthLevel;
  atmosphere: AtmosphereState;
}) {
  return (
    <GardenAtmosphere atmosphere={atmosphere}>
      <GardenFrameAccent />
      <GardenTile growthLevel={growthLevel} />
      <GardenEffects />
    </GardenAtmosphere>
  );
}
