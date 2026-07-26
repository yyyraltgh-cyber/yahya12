/**
 * Simple, reusable SVG accents — no figurative content, no complex scenes
 * (those live in the illustrated stage assets instead). Kept minimal on
 * purpose per the hybrid split: anything more elaborate belongs in
 * public/garden/stages/, not hand-coded here.
 */
export function GardenFrameAccent() {
  return (
    <svg
      viewBox="0 0 64 64"
      className="pointer-events-none absolute -inset-1"
      aria-hidden="true"
    >
      <path
        d="M4 16 V6 a2 2 0 0 1 2 -2 H16"
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M60 48 V58 a2 2 0 0 1 -2 2 H48"
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}
