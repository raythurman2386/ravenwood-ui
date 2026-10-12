# Registry items

Each registry item is served as JSON for `shadcn add`, from the local build and from the live site.

## Sub-features

- `registry-index`: `/r/registry.json` lists every item.
- `registry-item`: `/r/<name>.json` for all 65 registry entries: the `registry` index plus 64 items (ui, component, hook, lib, style, font, base) has a matching `name`, a `registry:*` type, and a payload.
- `registry-404`: an unknown item or a path traversal returns 404.
- `registry-live`: the same items at `https://ui.ravenwoodsoftware.dev/r/<name>.json`.

## How to get to it (user POV)

- `npx shadcn add https://ui.ravenwoodsoftware.dev/r/<name>.json`
- `npx shadcn add @ravenwood/<name>` (namespace in `components.json`, which resolves to GitHub raw `public/r`).

## Driving it with registry-check.sh

Preconditions:

- `launch.sh` built the registry (`shadcn build`).

- **Run.** From the repo root, run `.cursor/skills/verify-ravenwood-ui/scripts/registry-check.sh http://127.0.0.1:3402`. Expect `PASS registry items @ <base>: 65 ok, 0 bad` for both bases, plus two 404 PASS lines.
- **Against a PR preview.** Pass the preview URL as the second argument.

## Gotchas

- `font-fraunces`, `theme` and `index` have no `files`. They carry `font`/`cssVars`/`css`, and that's valid.
- Live lags `main` until deploy.
