#!/bin/bash
#
# Renders the pattern GIFs in public/animations/ with the official Juggling Lab
# desktop app (https://jugglinglab.org, (c) Jack Boyce and contributors, GPL-2.0),
# using its built-in female avatar (avatar=female, available since 1.7.6).
#
# Run by hand when a pattern is added or Juggling Lab changes. It is NOT part of
# the build: the GIFs are committed, so CI needs neither Juggling Lab nor ffmpeg.
#
# Needs:
#   - Juggling Lab desktop 1.7.6 or newer (download from jugglinglab.org)
#   - ffmpeg
#
# Usage:
#   scripts/render-animations.sh            # all patterns
#   scripts/render-animations.sh 3-531      # one pattern, by file slug
#   JLAB="/path/to/Juggling Lab.app/Contents/MacOS/Juggling Lab" scripts/render-animations.sh
#
# Juggling Lab saves GIFs on a white background. The site's cards are dark, so
# each GIF is recoloured afterwards: the white background becomes the card
# colour, the black figure becomes white, and prop colours stay as rendered.
# Nothing about the figure, the timing or the physics is changed.

set -euo pipefail

JLAB="${JLAB:-/Applications/Juggling Lab.app/Contents/MacOS/Juggling Lab}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/public/animations"
WIDTH=400
HEIGHT=450

# file slug : siteswap
PATTERNS=(
  "3-cascade:3"
  "3-423:423"
  "3-441:441"
  "3-531:531"
  "3-51:51"
  "3-312:312"
  "4-fountain:4"
  "4-534:534"
  "4-633:633"
  "4-552:552"
  "5-cascade:5"
)

if [[ ! -x "$JLAB" ]]; then
  echo "Juggling Lab not found at: $JLAB" >&2
  echo "Install it from https://jugglinglab.org or set JLAB to its executable." >&2
  exit 1
fi
command -v ffmpeg >/dev/null || { echo "ffmpeg is required" >&2; exit 1; }

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
# Juggling Lab resolves relative -out paths against this variable.
export JL_WORKING_DIR="$TMP"

# Per channel: remove the white share (min) and add the inverted black share
# (255 - max). Grey pixels invert, pure prop colours stay, and anti-aliased
# edges end up blended against dark instead of white. Then lift black to the
# card background #080810.
MN='min(min(r(X,Y),g(X,Y)),b(X,Y))'
MX='max(max(r(X,Y),g(X,Y)),b(X,Y))'
RECOLOUR="format=gbrp,geq=r='r(X,Y)-$MN+255-$MX':g='g(X,Y)-$MN+255-$MX':b='b(X,Y)-$MN+255-$MX'"
RECOLOUR="$RECOLOUR,lutrgb=r='val*247/255+8':g='val*247/255+8':b='val*239/255+16'"
RECOLOUR="$RECOLOUR,split[a][b];[a]palettegen=reserve_transparent=0[p];[b][p]paletteuse=dither=none"

only="${1:-}"
mkdir -p "$OUT"

for entry in "${PATTERNS[@]}"; do
  slug="${entry%%:*}"
  siteswap="${entry#*:}"
  [[ -n "$only" && "$only" != "$slug" ]] && continue

  raw="$TMP/$slug.gif"
  "$JLAB" togif "$siteswap" -prefs "width=$WIDTH;height=$HEIGHT;avatar=female" -out "$raw"
  if [[ ! -s "$raw" ]]; then
    echo "Juggling Lab wrote no GIF for $siteswap" >&2
    exit 1
  fi
  ffmpeg -v error -y -i "$raw" -filter_complex "$RECOLOUR" "$OUT/pattern-$slug.gif"
  echo "pattern-$slug.gif  (siteswap $siteswap)"
done
