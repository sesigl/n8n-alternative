#!/bin/bash

# Script to adjust commit dates by adding hours
# Usage: ./adjust-commit-dates.sh <number_of_commits> <hours_to_add>

set -e

if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <number_of_commits> <hours_to_add>"
    echo "Example: $0 3 5  # Adjusts last 3 commits by adding 5 hours"
    exit 1
fi

NUM_COMMITS=$1
HOURS_TO_ADD=$2

# Validate inputs are numbers
if ! [[ "$NUM_COMMITS" =~ ^[0-9]+$ ]]; then
    echo "Error: number_of_commits must be a positive integer"
    exit 1
fi

if ! [[ "$HOURS_TO_ADD" =~ ^-?[0-9]+$ ]]; then
    echo "Error: hours_to_add must be an integer (can be negative)"
    exit 1
fi

# Check if we have enough commits
TOTAL_COMMITS=$(git rev-list --count HEAD)
if [ "$NUM_COMMITS" -gt "$TOTAL_COMMITS" ]; then
    echo "Error: Repository only has $TOTAL_COMMITS commits, cannot adjust $NUM_COMMITS commits"
    exit 1
fi

echo "Adjusting the last $NUM_COMMITS commit(s) by adding $HOURS_TO_ADD hour(s)..."
echo ""
echo "Before:"
git log -"$NUM_COMMITS" --format="  %h %ai - %s"
echo ""

# Perform the rebase with date adjustment
git rebase HEAD~"$NUM_COMMITS" --exec "GIT_COMMITTER_DATE=\"\$(date -j -v+${HOURS_TO_ADD}H -f \"%Y-%m-%d %H:%M:%S %z\" \"\$(git show -s --format=%ci HEAD)\" \"+%Y-%m-%d %H:%M:%S %z\")\" git commit --amend --no-edit --date=\"\$(date -j -v+${HOURS_TO_ADD}H -f \"%Y-%m-%d %H:%M:%S %z\" \"\$(git show -s --format=%ai HEAD)\" \"+%Y-%m-%d %H:%M:%S %z\")\""

echo ""
echo "After:"
git log -"$NUM_COMMITS" --format="  %h %ai - %s"
echo ""
echo "✓ Successfully adjusted $NUM_COMMITS commit(s) by $HOURS_TO_ADD hour(s)"
