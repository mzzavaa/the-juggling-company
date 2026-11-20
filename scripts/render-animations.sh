#!/bin/bash
#
# Renders the pattern GIFs in public/animations/ with the official Juggling Lab
# desktop app (https://jugglinglab.org, (c) Jack Boyce and contributors, GPL-2.0),
# using its built-in female avatar (avatar=female). The committed GIFs were rendered with 1.7.8.
#
# Run by hand when a pattern is added or Juggling Lab changes. It is NOT part of
# the build: the GIFs are committed, so CI needs neither Juggling Lab nor ffmpeg.
#
# Needs:
#   - Juggling Lab desktop 1.7.8 or newer (download from jugglinglab.org)
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
HEIGHT=450

# file slug | Juggling Lab pattern | width | avatar per juggler
PATTERNS=(
  # the patterns page
  "3-cascade|3|400|female"
  "3-423|423|400|female"
  "3-441|441|400|female"
  "3-531|531|400|female"
  "3-51|51|400|female"
  "3-312|312|400|female"
  "4-fountain|4|400|female"
  "4-534|534|400|female"
  "4-633|633|400|female"
  "4-552|552|400|female"
  "5-cascade|5|400|female"
  # learning steps and coloured balls
  "1-one-ball|300|400|female"
  "2-two-balls|330|400|female"
  "3-colours|pattern=3;colors=mixed|400|female"
  # rings
  "3-rings|pattern=3;prop=ring|400|female"
  # longer and higher patterns
  "5-753|753|400|female"
  "5-97531|97531|400|female"
  "5-shower-91|91|400|female"
  "7-cascade|7|400|female"
  # synchronous and multiplex
  "4-sync-44|(4,4)|400|female"
  "4-multiplex|[33]33|400|female"
  # passing (Juggling Lab has no club prop, so passes are drawn with balls or rings)
  "passing-6-balls|<3p|3p>|640|female,classic"
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
  # slug is the first field, avatar the last, width the one before it; the
  # pattern in between may itself contain "|" (passing notation).
  slug="${entry%%|*}"
  rest="${entry#*|}"
  avatar="${rest##*|}"
  rest="${rest%|*}"
  width="${rest##*|}"
  pattern="${rest%|*}"
  [[ -n "$only" && "$only" != "$slug" ]] && continue

  raw="$TMP/$slug.gif"
  "$JLAB" togif "$pattern" -prefs "width=$width;height=$HEIGHT;avatar=$avatar" -out "$raw"
  if [[ ! -s "$raw" ]]; then
    echo "Juggling Lab wrote no GIF for $pattern" >&2
    exit 1
  fi
  ffmpeg -v error -y -i "$raw" -filter_complex "$RECOLOUR" "$OUT/pattern-$slug.gif"
  echo "pattern-$slug.gif  ($pattern)"
done
