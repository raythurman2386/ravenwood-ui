---
name: verify-ravenwood-ui
description: "Drive Ravenwood UI (shadcn registry + docs site at ui.ravenwoodsoftware.dev) like a user: every docs page fresh/in/away/back at 1440 and 390 with 0 pageerrors, every registry item served locally and live, and `shadcn add` of the map item from the live registry into a scratch app with mount/unmount checks. Use before shipping changes to registry/, components/, app/ or registry.json."
---

# verify-ravenwood-ui

There are two surfaces:
1. **Docs site** (Next.js 16, `app/(site)`): `/`, `/docs`, `/docs/<slug>` (one per catalog item, from `lib/catalog.ts`), `/kitchen` ("Runs", which has no site header), `/motion`, and the 404.
2. **Registry**: `registry.json` → `shadcn build` → `public/r/<name>.json`, served by `app/r/[name]/route.ts` at `/r/<name>.json`. Users run `npx shadcn add https://ui.ravenwoodsoftware.dev/r/<name>.json` or use the `@ravenwood` namespace.

The harness is Playwright (not a project dependency; it uses the mise `npm-playwright` install) plus curl and the repo's own `shadcn` CLI. The feature map is in `features/README.md`.

## Fresh box setup

Nothing here is a project dependency, so a fresh box needs:

- **pnpm.** pnpm 12 will not start through Node 20's bundled corepack (its corepack is too old to fetch/verify pnpm 12). Use Node ≥ 22 with `corepack enable && corepack prepare pnpm@latest --activate`, or skip corepack: `npm i -g pnpm` (or `mise use -g pnpm`). Check with `pnpm -v`.
- **Playwright.** `PLAYWRIGHT_MODULE` points at Playwright's `index.mjs`. The default is `~/.local/share/mise/installs/npm-playwright/latest/node_modules/playwright/index.mjs` (`mise use -g npm:playwright`). Any `npm i playwright` dir works: `export PLAYWRIGHT_MODULE=/path/node_modules/playwright/index.mjs`.
- **Browsers.** Install the matching Chromium and ffmpeg (the navigation video needs ffmpeg): `PLAYWRIGHT_BROWSERS_PATH=<dir> npx playwright@<same version> install chromium ffmpeg`. Leave `PLAYWRIGHT_BROWSERS_PATH` unset to use `~/.cache/ms-playwright`; if you set it, export the same value for `run.sh`. `PW_CHROMIUM=/path/to/chrome` overrides the browser binary.
- `run.sh` runs `scripts/preflight.mjs` before any screen. If Playwright, Chromium, or ffmpeg is missing it stops with `PREFLIGHT FAIL: ...` and exit 3, so the video step never crashes midway. The video step is also wrapped so `screens.json` is always written.
- Scratch and artifact dirs use `$TMPDIR` (default `/tmp`).

## Launch

From the repo root, after `pnpm install` (only one `pnpm install` may run on the machine at a time, so check `pgrep -af "pnpm.*install"` first):

```bash
.cursor/skills/verify-ravenwood-ui/scripts/launch.sh 3402     # shadcn build + next build + next start
```

The server is ready when it prints `ready http://127.0.0.1:3402 pid <pid>`. The pid and port go in `.verify/` (gitignored). No env vars or secrets are needed. Pick another port if 3402 is busy. Never take over someone else's server.

## Doctor

`.cursor/skills/verify-ravenwood-ui/scripts/doctor.sh` is read-only. It checks that our pid is alive, that `/` and `/r/registry.json` return 200, and it prints the HEAD and BUILD_ID.

## Drive

`.cursor/skills/verify-ravenwood-ui/scripts/run.sh [artifact-dir]` runs:
1. `registry-check.sh <base>`: GETs `/r/registry.json` and all 66 registry entries (the `registry` index + 65 items) from **local and live** (`https://ui.ravenwoodsoftware.dev`), checks name, type and payload, and checks that an unknown item and a path traversal both return 404.
2. `screens.mjs`: for every screen at 1440×900 and 390×844, it does a fresh load, a screenshot, then navigates in client-side (header link, mobile `Open menu` sheet, or a `/docs` card), away (`Ravenwood home` / Home), and back. It fails on any `pageerror` or `Application error`, and it records one navigation video. Use `ONLY=<regex>` to narrow.
3. `shadcn-scratch.sh` + `map-mount.mjs`: create-next-app → `shadcn init -d` → `shadcn add https://ui.ravenwoodsoftware.dev/r/map.json` → a page with `Unmount map`/`Mount map` and `Other page`/`Back to map` → build and start on 3403. Then it runs 3 unmount/mount cycles and 3 away/back navigations, checking 0 pageerrors and that the maplibre canvas count is 0 after unmount and 1 after mount.

`screens.mjs` also scripts two header interactions at 1440: the **Components** menu (open, click the first item, reopen, `All components` → `/docs`) and the **theme toggle** (flip, reload to check persistence, flip back). Both fail on any pageerror. The 404 screen must return HTTP 404 and show Next's `404` / `This page could not be found.` text with a `404` title.

Use `SKIP_SCRATCH=1` to skip step 3 (it needs network and a pnpm install). A skipped run prints `SKIPPED  shadcn add ...` and ends with `RESULT: PASS WITH SKIPPED`, never a plain PASS. `FAIL_INJECT=unmount-throw` builds the scratch app with a child that throws on unmount. That's the deliberate failure proof, and the expected result is FAIL.

Stable handles: header links `Docs`/`Runs`/`Motion`, `Ravenwood home` (aria-label), mobile `Open menu` (aria-label) then the dialog links, `main a[href="/docs/<slug>"]` cards, the theme toggle `Switch to light mode`/`Switch to dark mode`.

## Evidence

The artifact dir defaults to `${TMPDIR:-/tmp}/verify-ravenwood-ui-artifacts/<ts>-<sha>/`, outside the checkout. Never commit artifacts: keep them on the box or push them to a separate evidence branch. It holds `run.log` (PASS/FAIL per item), `screens.json`, `screens/<width>-<screen>.png`, `video/*.webm` (navigation tour), and `scratch-map-mounted.png`. The proof standard is real user paths only: clicks and real installs from the live registry. Never test against hand-edited JSON.

## Cleanup

`scripts/teardown.sh` kills only the process groups whose pids are in `.verify/pid` and `.verify/scratch.pid`, and deletes the `${TMPDIR:-/tmp}/rui-scratch-*` dir it created (the path recorded in `.verify/scratch.dir`). Artifacts stay. Never use pkill or kill by port.

## Helpers

`launch.sh [port]`, `doctor.sh`, `preflight.mjs`, `run.sh [dir]`, `registry-check.sh <base> [live]`, `screens.mjs`, `shadcn-scratch.sh [port] [registry]`, `map-mount.mjs`, `teardown.sh`. All are run from the repo root.

## Gotchas

- `/kitchen` renders outside `(site)/layout`, so it has no header. Screens leave it by URL and log `away-via-url`.
- The live registry lags `main` until Vercel deploys. A PR that changes an item only matches the live check after deploy, so compare against the PR preview URL with `registry-check.sh <local> <preview-url>`.
- MapLibre 6 needs its worker in `public/maplibre/`. The scratch app wires `copy-maplibre-worker.mjs` into `build` exactly as the docs `setup` says.

Keep the map current with `/maintain-verification-skill`.
