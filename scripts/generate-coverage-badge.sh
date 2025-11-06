#!/usr/bin/env bash
set -e

# Script to use workspace coverage report and generate a badge
# Usage: ./scripts/generate-coverage-badge.sh [output-dir]

OUTPUT_DIR="${1:-coverage-reports}"
LCOV_FILE="coverage/lcov.info"

echo "Generating coverage badge..."
mkdir -p "$OUTPUT_DIR"

# Check if workspace coverage file exists
if [ ! -f "$LCOV_FILE" ]; then
  echo "ERROR: Coverage report not found at $LCOV_FILE"
  echo "Please run 'pnpm test:coverage' first"
  exit 1
fi

echo "Using workspace coverage report from $LCOV_FILE"

# Copy HTML reports
if [ -d "coverage" ]; then
  cp -r coverage/* "$OUTPUT_DIR/" 2>/dev/null || true
  echo "  Copied HTML coverage reports"
fi

# Calculate total coverage percentage
TOTAL_LINES=$(grep -c "^DA:" "$LCOV_FILE" || echo "0")
HIT_LINES=$(grep "^DA:" "$LCOV_FILE" | grep -cv ",0$" || echo "0")

if [ "$TOTAL_LINES" -eq 0 ]; then
  echo "ERROR: No coverage data found in $LCOV_FILE"
  exit 1
fi

COVERAGE=$(awk "BEGIN {printf \"%.0f\", ($HIT_LINES / $TOTAL_LINES) * 100}")
echo "Total coverage: $COVERAGE%"

# Determine badge color
if [ "$COVERAGE" -ge 90 ]; then
  COLOR="#4c1"  # brightgreen
elif [ "$COVERAGE" -ge 80 ]; then
  COLOR="#97CA00"  # green
elif [ "$COVERAGE" -ge 70 ]; then
  COLOR="#a4a61d"  # yellowgreen
elif [ "$COVERAGE" -ge 60 ]; then
  COLOR="#dfb317"  # yellow
elif [ "$COVERAGE" -ge 50 ]; then
  COLOR="#fe7d37"  # orange
else
  COLOR="#e05d44"  # red
fi

# Create badge directory
mkdir -p "$OUTPUT_DIR/badges"

# Generate SVG badge
cat > "$OUTPUT_DIR/badges/coverage.svg" << EOF
<svg xmlns="http://www.w3.org/2000/svg" width="106" height="20">
  <linearGradient id="b" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <mask id="a">
    <rect width="106" height="20" rx="3" fill="#fff"/>
  </mask>
  <g mask="url(#a)">
    <path fill="#555" d="M0 0h63v20H0z"/>
    <path fill="${COLOR}" d="M63 0h43v20H63z"/>
    <path fill="url(#b)" d="M0 0h106v20H0z"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
    <text x="31.5" y="15" fill="#010101" fill-opacity=".3">coverage</text>
    <text x="31.5" y="14">coverage</text>
    <text x="83.5" y="15" fill="#010101" fill-opacity=".3">${COVERAGE}%</text>
    <text x="83.5" y="14">${COVERAGE}%</text>
  </g>
</svg>
EOF

echo "Badge generated at $OUTPUT_DIR/badges/coverage.svg with ${COVERAGE}% coverage (color: $COLOR)"
