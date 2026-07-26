"use client";

import Image from "next/image";
import { GARDEN_STAGE_IMAGE } from "@/lib/garden/stage-assets";
import { GROWTH_STAGE_LABELS, type GrowthLevel } from "@/lib/garden/types";

/**
 * Displays the current growth-level illustration and crossfades to the new
 * one when the level changes. Two <Image> layers stacked absolutely; the
 * incoming one fades+scales in via CSS only (no animation library).
 */
export function GardenTile({ growthLevel }: { growthLevel: GrowthLevel }) {
  return (
    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
      <Image
        key={growthLevel}
        src={GARDEN_STAGE_IMAGE[growthLevel]}
        alt={GROWTH_STAGE_LABELS[growthLevel]}
        fill
        sizes="64px"
        className="animate-garden-tile-in object-cover"
        priority
      />
    </div>
  );
}
