# Docs pages

Every docs-site page renders with no runtime errors, whether you land on it directly or reach it by navigating.

## Sub-features

- `home` (`/`) and `docs-index` (`/docs`, all catalog cards).
- `docs-item` (`/docs/<slug>`, one page per catalog item, currently 62): showcase, usage, and install commands.
- `motion` (`/motion` playground) and `kitchen` (`/kitchen`, "Runs" demo, no site header).
- `not-found` (`/docs/<unknown>` returns 404 and shows not-found UI).

## How to get to it (user POV)

- Header **Docs**, **Runs**, **Motion**, and **Ravenwood home**. On mobile: **Open menu**, then the same links.
- Cards on `/docs` and the Components dropdown (first 3 per group).
- Deep links straight to `/docs/<slug>`.

## Driving it with screens.mjs

Preconditions:

- Doctor is OK.

- **All screens, both widths.** Run `OUT=<dir> BASE_URL=http://127.0.0.1:3402 node .cursor/skills/verify-ravenwood-ui/scripts/screens.mjs`. Expect `PASS <w> <screen> [via] fresh:ok in:ok away:ok back:ok pageerrors=0` for each.
- **One page.** Run with `ONLY='^/docs/map$'`.
- **Proof.** `screens/1440-_docs_map.png`, `screens/390-_docs_map.png`, and `video/*.webm`.

## Gotchas

- The docs-page list comes from the `/docs` HTML, so a catalog item without a card is not covered. Cross-check it against `lib/catalog.ts`.
- The map demo pages load OpenFreeMap tiles. Allow 5 s or more.
