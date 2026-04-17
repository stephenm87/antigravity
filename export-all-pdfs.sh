#!/usr/bin/env bash
# =============================================================
#  export-all-pdfs.sh
#  Batch PDF export for the Antigravity workspace.
#
#  Usage:
#    ./export-all-pdfs.sh          # run everything
#    ./export-all-pdfs.sh slp      # only SLP worksheets
#    ./export-all-pdfs.sh glopo    # only IB Global Politics
#    ./export-all-pdfs.sh magazine # only the Qing Gazette
#    ./export-all-pdfs.sh day8     # only Day 8 presentation
# =============================================================

# ── Paths ──────────────────────────────────────────────────────
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NODE="/opt/homebrew/bin/node"
export PATH="/opt/homebrew/bin:$PATH"

# ── Colours ────────────────────────────────────────────────────
GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

# ── Tracking ───────────────────────────────────────────────────
PASS=0; FAIL=0; SKIP=0
FAILED_NAMES=()
START_TIME=$SECONDS

# ── Helper: run one script in its own directory ─────────────────
run_script() {
  local label="$1"
  local script="$2"
  local cwd="${3:-$ROOT}"

  printf "  ${CYAN}→${NC} %-42s" "$label"

  # Run in a subshell so cd doesn't affect parent
  if (cd "$cwd" && "$NODE" "$script" 2>/tmp/pdf_err.log 1>/dev/null); then
    echo -e "${GREEN}✓${NC}"
    PASS=$((PASS + 1))
  else
    echo -e "${RED}✗  FAILED${NC}"
    echo -e "     ${RED}$(head -1 /tmp/pdf_err.log 2>/dev/null || echo 'unknown error')${NC}"
    FAIL=$((FAIL + 1))
    FAILED_NAMES+=("$label")
  fi
}

# ── Filter ─────────────────────────────────────────────────────
FILTER="${1:-all}"

# ── Header ─────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}═══════════════════════════════════════════════${NC}"
echo -e "${BOLD}  Antigravity PDF Export$([ "$FILTER" != "all" ] && echo " · ${YELLOW}${FILTER}${BOLD}")${NC}"
echo -e "${BOLD}═══════════════════════════════════════════════${NC}"
echo ""

# ── SLP Worksheets ─────────────────────────────────────────────
if [[ "$FILTER" == "all" || "$FILTER" == "slp" ]]; then
  echo -e "${BOLD}SLP Worksheets${NC}"
  SLP="$ROOT/slp-worksheet"
  run_script "SLP Guide"                 "$SLP/generate-slp-guide-pdf.js"          "$SLP"
  run_script "SLP Worksheet"             "$SLP/generate-pdf.js"                    "$SLP"
  run_script "R2P Debate Structure"      "$SLP/generate-debate-pdf.js"             "$SLP"
  run_script "R2P Main PDF"              "$SLP/generate-r2p-pdf.js"                "$SLP"
  run_script "Observer Briefing"         "$SLP/generate-observer-briefing-pdf.js"  "$SLP"
  run_script "Peer Checklist"            "$ROOT/scratch/generate-peer-checklist-pdf.js" "$ROOT"
  echo ""
fi

# ── IB Global Politics ─────────────────────────────────────────
if [[ "$FILTER" == "all" || "$FILTER" == "glopo" ]]; then
  echo -e "${BOLD}IB Global Politics${NC}"
  run_script "Policy Pivot Drill"        "$ROOT/generate-pivot-drill-pdf.js"       "$ROOT"
  echo ""
fi

# ── Presentations ──────────────────────────────────────────────
if [[ "$FILTER" == "all" || "$FILTER" == "day8" ]]; then
  echo -e "${BOLD}Presentations${NC}"
  run_script "Day 8 CCW Presentation"    "$ROOT/generate-day8-pdf.js"              "$ROOT"
  echo ""
fi

# ── Magazine ───────────────────────────────────────────────────
if [[ "$FILTER" == "all" || "$FILTER" == "magazine" ]]; then
  echo -e "${BOLD}Qing Gazette${NC}"
  MAG="$ROOT/magazine"
  run_script "Generate magazine HTML"    "$MAG/generate_magazine.mjs"              "$MAG"
  if [[ -f "$MAG/magazine.html" ]]; then
    run_script "Export magazine PDF"     "$MAG/export_pdf.mjs"                     "$MAG"
  else
    echo -e "  ${YELLOW}⚠${NC}  magazine.html not found — skipping PDF export"
    SKIP=$((SKIP + 1))
  fi
  echo ""
fi

# ── Summary ────────────────────────────────────────────────────
ELAPSED=$((SECONDS - START_TIME))
echo -e "${BOLD}═══════════════════════════════════════════════${NC}"
printf "  ${GREEN}%d passed${NC}  " "$PASS"
printf "${RED}%d failed${NC}  " "$FAIL"
printf "${YELLOW}%d skipped${NC}  " "$SKIP"
echo -e "${BOLD}(${ELAPSED}s)${NC}"

if [[ ${#FAILED_NAMES[@]} -gt 0 ]]; then
  echo ""
  echo -e "  ${RED}Failed:${NC}"
  for name in "${FAILED_NAMES[@]}"; do
    echo -e "    ${RED}• $name${NC}"
  done
fi

echo -e "${BOLD}═══════════════════════════════════════════════${NC}"
echo ""

# Non-zero exit if anything failed (useful if called from CI)
exit $FAIL
