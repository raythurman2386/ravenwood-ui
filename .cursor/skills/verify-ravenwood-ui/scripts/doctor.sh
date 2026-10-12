#!/usr/bin/env bash
# Read-only health check of the instance this skill started.
cd "${1:-.}"; pid=$(cat .verify/pid 2>/dev/null); port=$(cat .verify/port 2>/dev/null)
[ -n "$pid" ] && kill -0 "$pid" 2>/dev/null && echo "process $pid alive" || { echo "DOCTOR FAIL: no server started by this run"; exit 1; }
for p in / /r/registry.json; do c=$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$port$p"); echo "GET $p -> $c"; [ "$c" = 200 ] || { echo DOCTOR FAIL; exit 1; }; done
echo "HEAD $(git rev-parse --short HEAD) BUILD_ID $(cat .next/BUILD_ID); DOCTOR OK"
