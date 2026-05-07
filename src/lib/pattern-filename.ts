/**
 * Filename encoding/decoding utilities for juggling pattern GIF assets.
 *
 * Siteswap patterns can contain special characters that are not filesystem-safe.
 * This module provides deterministic encoding/decoding to convert patterns to
 * safe filenames and back.
 */

/**
 * Encoding map for siteswap special characters to filesystem-safe equivalents.
 * Uses URL-encoding-like scheme but with underscores for readability.
 */
export const ENCODE_MAP: Record<string, string> = {
  "(": "_LP_", // Left Parenthesis
  ")": "_RP_", // Right Parenthesis
  ",": "_C_", // Comma
  x: "_X_", // Crossing modifier (lowercase x has special meaning)
};

/**
 * Decoding map - reverse of ENCODE_MAP.
 */
export const DECODE_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(ENCODE_MAP).map(([k, v]) => [v, k])
);

/**
 * Encode a siteswap pattern to a filesystem-safe string.
 *
 * @example
 * encodePattern("(4,4)") // "_LP_4_C_4_RP_"
 * encodePattern("(4x,4)(4,4x)") // "_LP_4_X__C_4_RP__LP_4_C_4_X__RP_"
 * encodePattern("3") // "3"
 */
export function encodePattern(pattern: string): string {
  let encoded = pattern;
  for (const [char, replacement] of Object.entries(ENCODE_MAP)) {
    encoded = encoded.split(char).join(replacement);
  }
  return encoded;
}

/**
 * Decode a filesystem-safe string back to the original siteswap pattern.
 *
 * @example
 * decodePattern("_LP_4_C_4_RP_") // "(4,4)"
 */
export function decodePattern(encoded: string): string {
  let decoded = encoded;
  // Sort by length descending to avoid partial replacements
  const sortedEntries = Object.entries(DECODE_MAP).sort(
    ([a], [b]) => b.length - a.length
  );
  for (const [replacement, char] of sortedEntries) {
    decoded = decoded.split(replacement).join(char);
  }
  return decoded;
}

/**
 * Generate a deterministic filename for a pattern with given parameters.
 * Format: {encoded_pattern}_{width}x{height}_{slowdown}.gif
 *
 * @example
 * generateFilename("3", 260, 300, 1.8) // "3_260x300_1.8.gif"
 * generateFilename("(4,4)", 260, 300, 2.0) // "_LP_4_C_4_RP__260x300_2.gif"
 */
export function generateFilename(
  pattern: string,
  width: number,
  height: number,
  slowdown: number
): string {
  const encodedPattern = encodePattern(pattern);
  // Remove trailing zeros from slowdown for cleaner filenames
  const slowdownStr = slowdown.toString();
  return `${encodedPattern}_${width}x${height}_${slowdownStr}.gif`;
}

/**
 * Parse a filename back to its components.
 * Returns null if the filename doesn't match the expected format.
 */
export function parseFilename(
  filename: string
): {
  pattern: string;
  width: number;
  height: number;
  slowdown: number;
} | null {
  // Remove .gif extension
  const base = filename.replace(/\.gif$/, "");

  // Match pattern: {encoded_pattern}_{width}x{height}_{slowdown}
  const match = base.match(/^(.+)_(\d+)x(\d+)_([0-9.]+)$/);
  if (!match) return null;

  const [, encodedPattern, widthStr, heightStr, slowdownStr] = match;

  return {
    pattern: decodePattern(encodedPattern),
    width: parseInt(widthStr, 10),
    height: parseInt(heightStr, 10),
    slowdown: parseFloat(slowdownStr),
  };
}

/**
 * Generate the local asset path for a pattern.
 * Used by both generator (to save) and component (to reference).
 */
export function getAssetPath(
  pattern: string,
  width: number,
  height: number,
  slowdown: number
): string {
  return `/anim/${generateFilename(pattern, width, height, slowdown)}`;
}
