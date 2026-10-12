#!/usr/bin/env bash
# Installs the map item FROM THE LIVE REGISTRY into a throwaway Next app and serves it.
# Usage (repo root): shadcn-scratch.sh [port=3403] [registry=https://ui.ravenwoodsoftware.dev]
# FAIL_INJECT=unmount-throw adds a child whose effect cleanup throws (proves the check catches it).
# Writes .verify/scratch.{dir,pid,port}. Only one `pnpm install` may run on the machine at a time.
set -euo pipefail
PORT="${1:-3403}"; REG="${2:-https://ui.ravenwoodsoftware.dev}"; ROOT="$PWD"; SH="$ROOT/node_modules/.bin/shadcn"
pgrep -f 'pnpm( .*)? (i|install)( |$)' >/dev/null && { echo "another pnpm install is running; wait" >&2; exit 2; }
D=$(mktemp -d "${TMPDIR:-/tmp}/rui-scratch-XXXX"); echo "$D" > .verify/scratch.dir; cd "$D"
npx -y create-next-app@16 app --ts --tailwind --app --no-eslint --no-src-dir --import-alias '@/*' --use-pnpm --yes --skip-install --disable-git --no-react-compiler > cna.log 2>&1
cd app && pnpm install > install.log 2>&1
"$SH" init -d -y > init.log 2>&1
"$SH" add "$REG/r/map.json" -y 2>&1 | tee add.log | grep -E 'Created|✔|error' || true
test -f components/ui/map.tsx || { echo "FAIL shadcn add: components/ui/map.tsx missing"; exit 1; }
python3 - <<'PY'
import json; p=json.load(open('package.json'))
p['scripts']['build']='node scripts/copy-maplibre-worker.mjs && next build'; json.dump(p,open('package.json','w'),indent=2)
PY
mkdir -p app/other
cat > app/map-demo.tsx <<'TSX'
"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Map, MapControls } from "@/components/ui/map"
function Bomb() { useEffect(() => () => { if (process.env.NEXT_PUBLIC_FAIL_INJECT === "unmount-throw") setTimeout(() => { throw new Error("verify: injected throw on unmount") }) }, []); return null }
export function MapDemo() {
  const [on, setOn] = useState(true)
  return (<main className="p-4">
    <button onClick={() => setOn(!on)}>{on ? "Unmount map" : "Mount map"}</button> <Link href="/other">Other page</Link>
    {on && <div className="h-[360px]"><Map aria-label="Scratch map" center={[-87.6298, 41.8781]} zoom={11}><MapControls showZoom showCompass showFullscreen showScale /></Map><Bomb /></div>}
  </main>)
}
TSX
printf 'import { MapDemo } from "./map-demo"\nexport default function Page() { return <MapDemo /> }\n' > app/page.tsx
printf 'import Link from "next/link"\nexport default function Other() { return <main><p>Other</p><Link href="/">Back to map</Link></main> }\n' > app/other/page.tsx
NEXT_PUBLIC_FAIL_INJECT="${FAIL_INJECT:-}" NEXT_TELEMETRY_DISABLED=1 pnpm build > build.log 2>&1 || { tail -30 build.log; exit 1; }
( exec setsid pnpm exec next start -p "$PORT" ) > server.log 2>&1 &
echo $! > "$ROOT/.verify/scratch.pid"; echo "$PORT" > "$ROOT/.verify/scratch.port"
for i in $(seq 1 60); do curl -fs -o /dev/null "http://127.0.0.1:$PORT/" && { echo "scratch app (map from $REG) ready http://127.0.0.1:$PORT"; exit 0; }; sleep 1; done
echo "scratch app not ready"; exit 1
