/**
 * Juggling pattern configuration for pre-rendering.
 *
 * This module defines the canonical registry of all juggling patterns used
 * on the site, along with their rendering parameters. The Animation Generator
 * uses this registry to pre-render GIF assets at build time.
 *
 * @see Requirements 1.1, 1.2, 1.4
 */

/**
 * Configuration for a single juggling pattern.
 * Each pattern defines the siteswap notation and rendering parameters.
 */
export interface PatternConfig {
  /** Siteswap notation (e.g., "3", "531", "(4,4)") */
  pattern: string;
  /** Display width in pixels */
  width: number;
  /** Display height in pixels */
  height: number;
  /** Animation slowdown factor (1.0 = normal speed) */
  slowdown: number;
}

/**
 * Default rendering parameters matching current JugglingPattern.astro defaults.
 */
export const DEFAULT_PARAMS = {
  width: 260,
  height: 300,
  slowdown: 1.8,
} as const;

/**
 * All patterns used across the site.
 * Patterns with custom parameters override the defaults.
 *
 * @see Requirement 1.1 - Contains all 11 siteswap patterns
 * @see Requirement 1.2 - Stores rendering parameters for each pattern
 */
export const PATTERN_REGISTRY: PatternConfig[] = [
  // Basic cascade pattern (default params)
  { pattern: "3", ...DEFAULT_PARAMS },

  // Higher throw patterns
  { pattern: "5", ...DEFAULT_PARAMS, slowdown: 1.6 },
  { pattern: "4", ...DEFAULT_PARAMS, slowdown: 2.0 },

  // Waterfall variations
  { pattern: "531", ...DEFAULT_PARAMS, slowdown: 2.2 },
  { pattern: "753", ...DEFAULT_PARAMS, slowdown: 2.5 },
  { pattern: "7531", ...DEFAULT_PARAMS, slowdown: 2.4 },
  { pattern: "423", ...DEFAULT_PARAMS, slowdown: 2.0 },
  { pattern: "534", ...DEFAULT_PARAMS, slowdown: 2.2 },

  // Synchronous patterns
  { pattern: "(4,4)", ...DEFAULT_PARAMS, slowdown: 2.0 },
  { pattern: "(4x,4)(4,4x)", ...DEFAULT_PARAMS, slowdown: 2.2 },

  // Bounce pattern
  { pattern: "b", ...DEFAULT_PARAMS, slowdown: 2.0 },
];

/**
 * Lookup a pattern's config by siteswap notation.
 * Returns undefined if pattern is not in registry.
 *
 * @param pattern - The siteswap pattern string to look up
 * @returns The pattern configuration, or undefined if not found
 */
export function getPatternConfig(pattern: string): PatternConfig | undefined {
  return PATTERN_REGISTRY.find((p) => p.pattern === pattern);
}
