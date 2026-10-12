#!/usr/bin/env bash
# Usage (repo root): launch.sh [port]  -> builds registry + site, starts `next start`.
# Writes .verify/pid and .verify/port. No env vars or secrets are needed.
set -euo pipefail
PORT="${1:-${PORT:-3402}}"; mkdir -p .verify
ss -ltn "sport = :$PORT" | grep -q LISTEN && { echo "port $PORT busy; choose another" >&2; exit 2; }
NEXT_TELEMETRY_DISABLED=1 pnpm build > .verify/build.log 2>&1 || { tail -30 .verify/build.log; exit 1; }
( exec setsid pnpm exec next start -p "$PORT" ) > .verify/server.log 2>&1 &
echo $! > .verify/pid; echo "$PORT" > .verify/port
for i in $(seq 1 60); do curl -fs -o /dev/null "http://127.0.0.1:$PORT/" && { echo "ready http://127.0.0.1:$PORT pid $(cat .verify/pid)"; exit 0; }; sleep 1; done
echo "not ready"; tail -20 .verify/server.log; exit 1
