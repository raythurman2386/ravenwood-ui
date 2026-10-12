# Ravenwood UI verification map

The maintained source for verifying the docs site and the registry. Read this index, then the matching feature file.

## Baseline preconditions

- `launch.sh` instance on `http://127.0.0.1:3402`, `doctor.sh` OK.
- Network access to `https://ui.ravenwoodsoftware.dev` (live registry) for the registry and scratch checks.
- Playwright from `$HOME/.local/share/mise/installs/npm-playwright/latest/node_modules/playwright/index.mjs` (override with `PLAYWRIGHT_MODULE`).

## Driving conventions

- Every screen: fresh load → in (client-side) → away → back, at 1440×900 and 390×844, with 0 `pageerror`s.
- Prefer roles and accessible names (`Ravenwood home`, `Open menu`, header link names) over CSS.
- Registry checks are GET only. Nothing is published.

## Proof and skip reporting

- Each entry has a PASS/FAIL line in `run.log`, and the screens have PNGs.
- If the live registry is unreachable, report the scratch install as skipped (network), not passed.

## Features

- [Docs pages](./docs-pages.md): `/`, `/docs`, every `/docs/<slug>`, `/motion`, `/kitchen`, and the 404.
- [Header and navigation](./navigation.md): desktop header, the Components menu, the mobile sheet, and the theme toggle.
- [Registry items](./registry.md): `/r/registry.json` and each `/r/<name>.json`, local and live.
- [shadcn add + map mount/unmount](./shadcn-add-map.md): install from the live URL into a scratch app and exercise the lifecycle.
