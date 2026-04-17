#!/usr/bin/env bash
# =============================================================
#  magazine/optimize-images.sh
#  Batch-optimize the student cartoon gallery using macOS sips.
#
#  Why sips instead of Sharp/ImageMagick?
#    sips is built into every Mac — zero install, zero dependencies.
#    For gallery images this is all you need.
#
#  Usage:
#    ./magazine/optimize-images.sh          # optimize all images
#    ./magazine/optimize-images.sh --dry-run # show what would happen
#
#  What it does:
#    1. Resizes any image wider than MAX_WIDTH to MAX_WIDTH (preserves ratio)
#    2. Generates a 400px thumbnail into gallery/thumbs/
#    3. Reports before/after file sizes
#
#  Safe to run multiple times — already-small images are skipped.
# =============================================================

set -euo pipefail

GALLERY="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/gallery"
THUMB_DIR="$GALLERY/thumbs"
MAX_WIDTH=1800
THUMB_WIDTH=400
DRY_RUN=false

# ── Colour output ──────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'
BOLD='\033[1m'; NC='\033[0m'

[[ "${1:-}" == "--dry-run" ]] && DRY_RUN=true

# ── Setup ──────────────────────────────────────────────────────
mkdir -p "$THUMB_DIR"

# ── Stats ──────────────────────────────────────────────────────
TOTAL_BEFORE=0; TOTAL_AFTER=0; COUNT=0; RESIZED=0

echo ""
echo -e "${BOLD}═══════════════════════════════════════════════${NC}"
echo -e "${BOLD}  Magazine Gallery Optimizer${NC}"
echo -e "${BOLD}  Max width: ${MAX_WIDTH}px · Thumbs: ${THUMB_WIDTH}px${NC}"
$DRY_RUN && echo -e "${YELLOW}  DRY RUN — no files will be changed${NC}"
echo -e "${BOLD}═══════════════════════════════════════════════${NC}"
echo ""

for img in "$GALLERY"/*.jpg "$GALLERY"/*.jpeg "$GALLERY"/*.png; do
  [[ ! -f "$img" ]] && continue
  filename=$(basename "$img")

  # Before size in KB
  before_kb=$(du -k "$img" | cut -f1)
  TOTAL_BEFORE=$((TOTAL_BEFORE + before_kb))

  # Current width
  width=$(sips --getProperty pixelWidth "$img" 2>/dev/null | awk '/pixelWidth/{print $2}')

  printf "  ${CYAN}→${NC} %-40s %5s KB" "$filename" "${before_kb}"

  if [[ "$width" -gt "$MAX_WIDTH" ]]; then
    if ! $DRY_RUN; then
      sips --resampleWidth $MAX_WIDTH "$img" --out "$img" > /dev/null 2>&1
    fi
    after_kb=$(du -k "$img" | cut -f1)
    saved=$((before_kb - after_kb))
    echo -e "  → ${after_kb} KB  ${GREEN}(-${saved} KB, resized from ${width}px)${NC}"
    RESIZED=$((RESIZED + 1))
  else
    after_kb=$before_kb
    echo -e "  ${YELLOW}✓ already ≤ ${MAX_WIDTH}px${NC}"
  fi

  TOTAL_AFTER=$((TOTAL_AFTER + after_kb))

  # Generate thumbnail (always regenerate)
  thumb_path="$THUMB_DIR/$filename"
  if ! $DRY_RUN; then
    sips --resampleWidth $THUMB_WIDTH "$img" --out "$thumb_path" > /dev/null 2>&1
  fi

  COUNT=$((COUNT + 1))
done

# ── Summary ────────────────────────────────────────────────────
SAVED=$((TOTAL_BEFORE - TOTAL_AFTER))
SAVED_MB=$(echo "scale=1; $SAVED / 1024" | bc)
BEFORE_MB=$(echo "scale=1; $TOTAL_BEFORE / 1024" | bc)
AFTER_MB=$(echo "scale=1; $TOTAL_AFTER / 1024" | bc)

echo ""
echo -e "${BOLD}═══════════════════════════════════════════════${NC}"
echo -e "  Images processed:  ${COUNT}"
echo -e "  Resized to ≤${MAX_WIDTH}px: ${RESIZED}"
echo -e "  Before: ${BEFORE_MB} MB  →  After: ${AFTER_MB} MB"
echo -e "  ${GREEN}Saved: ${SAVED_MB} MB${NC}"
echo -e "  Thumbnails: gallery/thumbs/ (${COUNT} files at ${THUMB_WIDTH}px)"
echo -e "${BOLD}═══════════════════════════════════════════════${NC}"
echo ""
