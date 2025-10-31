#!/bin/bash

# Validates that all dependencies in package.json files use pinned versions (no ^ or ~)

set -e

errors=0

echo "Checking for unpinned versions in package.json files..."

# Find all package.json files, excluding node_modules and dist
while IFS= read -r file; do
  # Check for version ranges in dependency fields only (^, ~, at start of version string)
  # Look specifically in dependencies, devDependencies, peerDependencies, optionalDependencies sections
  unpinned=$(grep -A 999 -E '"(dev|peer|optional)?[Dd]ependencies"' "$file" | grep -E '"[^"]+": *"[\^~]' || true)

  if [ -n "$unpinned" ]; then
    # Filter out workspace:, file:, link:, npm:, git+ protocols
    filtered=$(echo "$unpinned" | grep -v 'workspace:\|file:\|link:\|npm:\|git+' || true)

    if [ -n "$filtered" ]; then
      echo "ERROR: Found unpinned versions in $file:"
      echo "$filtered"
      echo ""
      errors=$((errors + 1))
    fi
  fi
done < <(find . -name "package.json" -not -path "*/node_modules/*" -not -path "*/dist/*")

if [ $errors -gt 0 ]; then
  echo "ERROR: Found unpinned versions in $errors file(s). All dependencies must use exact versions (no ^, ~, etc.)"
  exit 1
fi

echo "SUCCESS: All dependencies are properly pinned"
exit 0
