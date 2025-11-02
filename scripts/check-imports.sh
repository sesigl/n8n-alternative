#!/usr/bin/env bash
# Checks that all same-package imports use @ aliases instead of relative paths

set -e

echo "Checking for relative imports in package src/ directories..."

errors=0

# Find all .ts files (excluding .d.ts) in packages/*/src directories
while IFS= read -r file; do
  # Use grep with line numbers to find relative imports
  # Look for: import ... from './...' or import ... from "../..."
  matches=$(grep -nE 'import\s+.*from\s+["'"'"']\.[^"'"'"']+["'"'"']' "$file" || true)

  if [ -n "$matches" ]; then
    echo "ERROR: Found relative imports in $file:"
    echo "$matches" | while IFS=: read -r line_num line_content; do
      import_path=$(echo "$line_content" | sed -E 's/.*from\s+["'"'"'](\.[^"'"'"']+)["'"'"'].*/\1/')
      echo "  Line $line_num: $import_path"
    done
    echo "  → Use @/* alias instead"
    echo
    errors=$((errors + 1))
  fi
done < <(find ./packages -type f -name "*.ts" ! -name "*.d.ts" -path "*/src/*" -not -path "*/node_modules/*" -not -path "*/dist/*")

if [ $errors -gt 0 ]; then
  echo "ERROR: Found relative imports in $errors file(s). Use @/* aliases instead."
  exit 1
fi

echo "✓ All imports use @/* aliases"
