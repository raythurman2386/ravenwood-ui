# Header and navigation

The site header gets users between sections on desktop and mobile, and the theme toggle switches light and dark.

## Sub-features

- `nav-desktop`: header links **Docs**, **Runs**, **Motion**, and the **Ravenwood home** logo.
- `nav-components-menu`: the **Components** dropdown shows the first 3 items per group and **All components**.
- `nav-mobile`: **Open menu** opens a sheet with Home, Docs, Runs, and Motion.
- `theme-toggle`: **Switch to light mode** / **Switch to dark mode**.

## How to get to it (user POV)

- The header on any `(site)` page.

## Driving it with Playwright

Preconditions:

- Doctor is OK.

- **Desktop/mobile in, away, back.** These are covered by `screens.mjs` for every screen (the `via` column shows `header link` / `menu Home`).
- **Components menu.** Click `getByRole("button", { name: "Components" })`, then `getByRole("link", { name: "All components" })`. Expect `/docs`.
- **Theme toggle.** Click `getByRole("button", { name: /Switch to (light|dark) mode/ })`. Expect `html.dark` to flip with no pageerror.

## Gotchas

- The Components dropdown and theme toggle aren't scripted in `screens.mjs` yet. Drive them with the commands above when touching the header.
