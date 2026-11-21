#!/bin/bash
#
# Renders the pattern GIFs in public/animations/ with the official Juggling Lab
# desktop app (https://jugglinglab.org, (c) Jack Boyce and contributors, GPL-2.0),
# using its built-in female avatar (avatar=female). The committed GIFs were rendered with 1.7.8.
#
# For each pattern it writes a GIF, an MP4 and an MP4 with every prop in a
# different colour. Run by hand when a pattern is added or Juggling Lab changes. It is NOT part of
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
TO_GIF="$RECOLOUR,split[a][b];[a]palettegen=reserve_transparent=0[p];[b][p]paletteuse=dither=none"

# One Juggling Lab render, recoloured. $1 pattern, $2 width, $3 avatar, $4 raw file.
render_raw() {
  "$JLAB" togif "$1" -prefs "width=$2;height=$HEIGHT;avatar=$3" -out "$4"
  if [[ ! -s "$4" ]]; then
    echo "Juggling Lab wrote no GIF for $1" >&2
    exit 1
  fi
}

# MP4 for the on-page player (pause and slow motion need a video, not a GIF).
to_mp4() {
  ffmpeg -v error -y -i "$1" -vf "$RECOLOUR,format=yuv420p" -c:v libx264 -crf 20 -preset slow \
    -movflags +faststart -an "$2"
}

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

  # The same pattern with every prop in a different colour, for the player's
  # "all different" setting.
  case "$pattern" in
    *colors=*) mixed="$pattern" ;;
    pattern=*) mixed="$pattern;colors=mixed" ;;
    *) mixed="pattern=$pattern;colors=mixed" ;;
  esac

  raw="$TMP/$slug.gif"
  raw_mixed="$TMP/$slug-mixed.gif"
  render_raw "$pattern" "$width" "$avatar" "$raw"
  render_raw "$mixed" "$width" "$avatar" "$raw_mixed"

  ffmpeg -v error -y -i "$raw" -filter_complex "$TO_GIF" "$OUT/pattern-$slug.gif"
  to_mp4 "$raw" "$OUT/pattern-$slug.mp4"
  to_mp4 "$raw_mixed" "$OUT/pattern-$slug-mixed.mp4"
  echo "pattern-$slug  ($pattern)"
done

# Drop and recover. Juggling Lab cannot draw a ball falling, so this joins two
# of its renders: the cascade, then the same cascade with one ball missing
# (siteswap 330, which keeps the rhythm and leaves an empty beat), then back.
if [[ -z "$only" ]]; then
  join() { # $1 cascade raw, $2 times to play it, $3 two-ball raw, $4 joined raw
    ffmpeg -v error -y -stream_loop "$(($2 - 1))" -i "$1" -i "$3" \
      -filter_complex "[0:v][1:v]concat=n=2:v=1,split[a][b];[a]palettegen[p];[b][p]paletteuse=dither=none" "$4"
  }
  join "$TMP/3-cascade.gif" 3 "$TMP/2-two-balls.gif" "$TMP/3-drop-recover.gif"
  join "$TMP/3-cascade-mixed.gif" 1 "$TMP/2-two-balls-mixed.gif" "$TMP/3-drop-recover-mixed.gif"
  ffmpeg -v error -y -i "$TMP/3-drop-recover.gif" -filter_complex "$TO_GIF" "$OUT/pattern-3-drop-recover.gif"
  to_mp4 "$TMP/3-drop-recover.gif" "$OUT/pattern-3-drop-recover.mp4"
  to_mp4 "$TMP/3-drop-recover-mixed.gif" "$OUT/pattern-3-drop-recover-mixed.mp4"
  echo "pattern-3-drop-recover  (3, then 330, joined)"
fi
