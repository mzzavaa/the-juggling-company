/**
 * Pillar = a topic axis. Three primaries (RGB), four blends (additive light).
 * Each piece of content carries one or more pillars; the UI derives a single
 * "blend" pillar key for badges, glows, and accents.
 */

export const PILLARS = ["brain", "tech", "change"] as const;
export type Pillar = (typeof PILLARS)[number];

export type PillarKey =
  | "brain"
  | "tech"
  | "change"
  | "brain-tech"
  | "brain-change"
  | "tech-change"
  | "all";

export const PILLAR_LABEL: Record<Pillar, string> = {
  brain: "Brain",
  tech: "Tech",
  change: "Change",
};

export const PILLAR_FULL_LABEL: Record<Pillar, string> = {
  brain: "Juggling and Your Brain",
  tech: "Juggling and Technology",
  change: "Juggling and Change",
};

export const PILLAR_HEX: Record<PillarKey, string> = {
  brain: "#ff3366",
  tech: "#33cc66",
  change: "#3b6cff",
  "brain-tech": "#ffcc33",
  "brain-change": "#cc33ff",
  "tech-change": "#33ccff",
  all: "#f4f4f0",
};

export const PILLAR_LABEL_KEYED: Record<PillarKey, string> = {
  brain: "Brain",
  tech: "Tech",
  change: "Change",
  "brain-tech": "Brain × Tech",
  "brain-change": "Brain × Change",
  "tech-change": "Tech × Change",
  all: "All three",
};

/**
 * Reduce an array of pillars to a single canonical key for visual display.
 * Empty input falls back to "all" (white) — used as a safe default.
 */
export function blendKey(pillars: readonly Pillar[]): PillarKey {
  const set = new Set(pillars);
  if (set.size >= 3) return "all";
  if (set.size === 0) return "all";
  if (set.size === 1) return [...set][0];
  if (set.has("brain") && set.has("tech")) return "brain-tech";
  if (set.has("brain") && set.has("change")) return "brain-change";
  if (set.has("tech") && set.has("change")) return "tech-change";
  return "all";
}

/** Sorted, deduped pillar list for stable rendering. */
export function normalizePillars(pillars: readonly Pillar[]): Pillar[] {
  const set = new Set(pillars);
  return PILLARS.filter((p) => set.has(p));
}
