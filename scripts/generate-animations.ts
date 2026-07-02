/**
 * Animation Generator Script
 *
 * Fetches GIF animations from JugglingLab and saves them locally as static assets.
 * Run during build to pre-render all patterns in the registry.
 *
 * Animation engine: JugglingLab (© Jack Boyce), GPL-2.0 licensed.
 * https://github.com/jkboyce/jugglinglab
 *
 * Usage:
 *   npx tsx scripts/generate-animations.ts           # Generate missing only
 *   npx tsx scripts/generate-animations.ts --force   # Regenerate all
 *   npx tsx scripts/generate-animations.ts --pattern "3"  # Single pattern
 *
 * @see Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 7.1, 7.2, 7.4
 */

import { writeFile, mkdir, access } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PATTERN_REGISTRY,
  type PatternConfig,
} from "../src/data/juggling-patterns.js";
import { generateFilename } from "../src/lib/pattern-filename.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, "..", "public");
const ANIM_DIR = join(PUBLIC_DIR, "anim");

/** Fixed parameters matching current implementation */
const FIXED_PARAMS = {
  fps: 30,
  colors: "mixed",
  redirect: "true",
  hidejugglers: "1", // Hide stick figure - we'll overlay custom SVG
} as const;

/**
 * Build the JugglingLab URL for a pattern.
 */
export function buildJugglingLabUrl(config: PatternConfig): string {
  const params = [
    `pattern=${encodeURIComponent(config.pattern)}`,
    `width=${config.width}`,
    `height=${config.height}`,
    `fps=${FIXED_PARAMS.fps}`,
    `slowdown=${config.slowdown}`,
    `colors=${FIXED_PARAMS.colors}`,
    `redirect=${FIXED_PARAMS.redirect}`,
    `hidejugglers=${FIXED_PARAMS.hidejugglers}`,
  ].join(";");

  return `https://jugglinglab.org/anim?${params}`;
}

/**
 * Check if a file exists.
 */
export async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Fetch and save a single pattern's GIF.
 */
export async function fetchPattern(
  config: PatternConfig,
  options: { force?: boolean } = {}
): Promise<{ success: boolean; cached: boolean; error?: string }> {
  const filename = generateFilename(
    config.pattern,
    config.width,
    config.height,
    config.slowdown
  );
  const outputPath = join(ANIM_DIR, filename);

  // Check cache unless force regeneration
  if (!options.force && (await fileExists(outputPath))) {
    return { success: true, cached: true };
  }

  const url = buildJugglingLabUrl(config);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return {
        success: false,
        cached: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const buffer = await response.arrayBuffer();
    await writeFile(outputPath, Buffer.from(buffer));

    return { success: true, cached: false };
  } catch (error) {
    return {
      success: false,
      cached: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Main generator function.
 */
async function generateAnimations(
  options: {
    pattern?: string;
    force?: boolean;
    clear?: boolean;
  } = {}
): Promise<void> {
  // Ensure output directory exists
  await mkdir(ANIM_DIR, { recursive: true });

  // Filter patterns if specific one requested
  const patterns = options.pattern
    ? PATTERN_REGISTRY.filter((p) => p.pattern === options.pattern)
    : PATTERN_REGISTRY;

  if (patterns.length === 0) {
    console.error(`Pattern "${options.pattern}" not found in registry`);
    process.exit(1);
  }

  console.log(`\n🎪 Generating ${patterns.length} juggling animations...\n`);

  let successCount = 0;
  let cachedCount = 0;
  let failedCount = 0;
  const failures: Array<{ pattern: string; error: string }> = [];

  for (const config of patterns) {
    const result = await fetchPattern(config, { force: options.force });

    if (result.success) {
      if (result.cached) {
        cachedCount++;
        console.log(`  ✓ ${config.pattern} (cached)`);
      } else {
        successCount++;
        console.log(`  ✓ ${config.pattern} (fetched)`);
      }
    } else {
      failedCount++;
      failures.push({
        pattern: config.pattern,
        error: result.error || "Unknown error",
      });
      console.error(`  ✗ ${config.pattern}: ${result.error}`);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Fetched: ${successCount}`);
  console.log(`   Cached:  ${cachedCount}`);
  console.log(`   Failed:  ${failedCount}`);

  // Critical failure: all patterns failed
  if (failedCount === patterns.length) {
    console.error("\n❌ All patterns failed to generate. Build halted.");
    process.exit(1);
  }

  // Non-critical: some failures
  if (failedCount > 0) {
    console.warn(
      "\n⚠️  Some patterns failed. They will use external fallback URLs."
    );
  }

  console.log("\n✅ Animation generation complete.\n");
}

// CLI handling
const args = process.argv.slice(2);
const options: Parameters<typeof generateAnimations>[0] = {};

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--pattern" && args[i + 1]) {
    options.pattern = args[++i];
  } else if (args[i] === "--force") {
    options.force = true;
  } else if (args[i] === "--clear") {
    options.clear = true;
  }
}

generateAnimations(options);
