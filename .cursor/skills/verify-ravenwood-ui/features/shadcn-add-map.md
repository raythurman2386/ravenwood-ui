# shadcn add + map mount/unmount

A user can install the map item from the live registry into a new app, and the map mounts and unmounts cleanly, both through state toggles and through client-side navigation.

## Sub-features

- `shadcn-add-live`: `shadcn add https://ui.ravenwoodsoftware.dev/r/map.json` creates `components/ui/map.tsx`, its deps (`skeleton`, `use-reduced-motion`), `scripts/copy-maplibre-worker.mjs`, and adds `maplibre-gl`.
- `map-mount`: on a fresh load there is one `canvas.maplibregl-canvas`.
- `map-unmount-remount`: 3× **Unmount map** / **Mount map**. That's 0 canvases after unmount, 1 after mount, and 0 pageerrors.
- `map-nav-away-back`: 3× **Other page** / **Back to map** (client-side).

## How to get to it (user POV)

- A fresh Next app → `npx shadcn init` → `npx shadcn add https://ui.ravenwoodsoftware.dev/r/map.json` → render `<Map>`.

## Driving it with shadcn-scratch.sh + map-mount.mjs

Preconditions:

- No other `pnpm install` is running. Network access is available.

- **Build scratch.** From the repo root, run `.cursor/skills/verify-ravenwood-ui/scripts/shadcn-scratch.sh 3403`. Expect `scratch app (map from https://ui.ravenwoodsoftware.dev) ready http://127.0.0.1:3403`.
- **Drive.** Run `BASE_URL=http://127.0.0.1:3403 OUT=<dir> node .cursor/skills/verify-ravenwood-ui/scripts/map-mount.mjs`. Expect 7 PASS lines and `map mount/unmount: PASS`.
- **Deliberate failure.** Run `FAIL_INJECT=unmount-throw shadcn-scratch.sh 3403` and then `map-mount.mjs`. Expect `FAIL unmount/mount #1 ... verify: injected throw on unmount`.
- **Proof.** `scratch-map-mounted.png` and `run.log`.
- **Cleanup.** `teardown.sh` stops the scratch server and deletes `/tmp/rui-scratch-*`.

## Gotchas

- `create-next-app@16` pulls the latest 16.x, so the scratch app tracks what a new user would get, not the repo's pinned versions.
- Without `copy-maplibre-worker.mjs` in `build`, the map never loads (no worker). The script wires it.
