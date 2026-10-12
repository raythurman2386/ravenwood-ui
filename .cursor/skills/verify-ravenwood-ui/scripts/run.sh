#!/usr/bin/env bash
# Full run against the instance from launch.sh. Usage (repo root): run.sh [artifact-dir]
# SKIP_SCRATCH=1 skips the shadcn add scratch app (it needs network + one pnpm install).
set -uo pipefail
S="$(cd "$(dirname "$0")" && pwd)"; export BASE_URL="http://127.0.0.1:$(cat .verify/port)"
export OUT="${1:-/tmp/verify-ravenwood-ui-artifacts/$(date +%Y%m%d-%H%M%S)-$(git rev-parse --short HEAD)}"
export PLAYWRIGHT_MODULE="${PLAYWRIGHT_MODULE:-$HOME/.local/share/mise/installs/npm-playwright/latest/node_modules/playwright/index.mjs}"
mkdir -p "$OUT"; exec > >(tee "$OUT/run.log") 2>&1
echo "== verify-ravenwood-ui $(git rev-parse --short HEAD) $(date -Is) base=$BASE_URL out=$OUT"
bash "$S/doctor.sh" . || exit 1; rc=0
echo "== registry items (local + live)"; bash "$S/registry-check.sh" "$BASE_URL" || rc=1
echo "== docs screens"; node "$S/screens.mjs" || rc=1
if [ -z "${SKIP_SCRATCH:-}" ]; then
  echo "== shadcn add from live registry into scratch app + map mount/unmount"
  if bash "$S/shadcn-scratch.sh" 3403; then BASE_URL="http://127.0.0.1:3403" node "$S/map-mount.mjs" || rc=1; else rc=1; fi
fi
echo "== RESULT: $([ $rc = 0 ] && echo PASS || echo FAIL)  artifacts: $OUT"; exit $rc
