import type { GrowthLevel } from "./types";

/**
 * Single source of truth mapping a growth level to its illustrated asset.
 * Swapping in final artwork later = replacing files in
 * public/garden/stages/ — this file and every component that reads it
 * never need to change.
 */
export const GARDEN_STAGE_IMAGE: Record<GrowthLevel, string> = {
  0: "/garden/stages/stage-0.webp",
  1: "/garden/stages/stage-1.webp",
  2: "/garden/stages/stage-2.webp",
  3: "/garden/stages/stage-3.webp",
  4: "/garden/stages/stage-4.webp",
  5: "/garden/stages/stage-5.webp",
  6: "/garden/stages/stage-6.webp",
  7: "/garden/stages/stage-7.webp",
  8: "/garden/stages/stage-8.webp",
};
