<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Ravenwood UI

This repo is the source of truth for a personal shadcn registry and its preview site. Style is `radix-nova` (Radix primitives). Dark is the default. Light tokens live on `:root`, dark tokens on `.dark`.

## Tokens

Edit `app/globals.css` first. Then copy the same light, dark, grain, and motion values into the `theme` and `index` items in `registry.json`. Those two items are the installable copy of the tokens.

- Colors are full `hsl()` strings.
- `--primary` is canopy emerald. `--ring` and focus rings are lantern brass. `--destructive` is dried blood. Filled destructive buttons use `bg-rust`.
- Extra semantic colors: `moss`, `lantern`, `rust`, each with a `-foreground`.
- `--radius` is `0.45rem`.
- Headings and `.font-display` use Fraunces (`--font-serif`). UI text uses Figtree (`--font-sans`).
- Grain is on `body` only. Do not texture components.
- Lucide stroke is 1.75 via `.lucide`.

## Motion

Source: `lib/motion.ts` and the duration/easing tokens in `app/globals.css`. Ask first: **what does this motion communicate?** If the answer is not press confirmation, spatial origin, hierarchy, or continuity, delete it.

Named intents:

| Intent | Duration | Use |
| --- | --- | --- |
| `snap` | 90–130ms (token 110ms) | Buttons, switches, checkboxes, icon buttons. Immediate press. |
| `ui` | 160–220ms (token 180ms) | Menus, tooltips, selects, tabs indicator. |
| `overlay` | 160–200ms (token 200ms) | Dialog, sheet, drawer, popover. Close on `overlay-exit` (160ms). |
| `layout` | 220ms (token 220ms) | Sidebar collapse, expanding rows, shared-layout tabs. Cap. |
| `gentle` | 220ms (token 220ms) | Large surfaces only (page frame). Rare. Cap. |

CSS easing: enter `cubic-bezier(0.16, 1, 0.3, 1)`, exit `cubic-bezier(0.4, 0, 1, 1)`, press `ease-out` 80–110ms. Motion tweens stay ≤220ms (`springs` in `lib/motion.ts`). Never bouncy. Press squash `scale(0.98)`. Hover is color, border, shadow.

CSS first. `motion/react` only for `layoutId` (tabs pill), interruptible overlays, list reorder. Transform and opacity only. `prefers-reduced-motion` and `.motion-reduce` zero enter/exit translate, scale, and rotate. Duration shortening alone is not enough.

Ban list: `transition-all`; linear easing on UI (progress bars only); `ease-in-out` as the default; hover scale > 1.02 on cards or buttons; bounce / wiggle / rubber / ping / infinite pulse on chrome; staggered fade-in of every paragraph on first paint; 400ms+ functional transitions; autoplaying Lottie/Rive loops in product chrome; gradient mesh / glow orbs that drift forever; layout animations that reflow text while the user is reading.

## Do

- Restyle shadcn primitives. Import `cn` from `cn`, Slot and primitives from `radix-ui`.
- Keep one copy of each primitive in `components/ui`. Point `registry.json` at that file.
- Put signature components in `registry/ravenwood/<name>.tsx`. Import siblings with a relative path (`./raven-mark`) so the installed copy under `components/ravenwood/` still resolves. Import primitives from `@/components/ui/*`.
- Set signature file targets to `components/ravenwood/<name>.tsx`.
- Give same-repo `registryDependencies` the GitHub address `raythurman2386/ravenwood-ui/<name>`. Bare names install official shadcn items.
- Keep focus-visible rings on `--ring`.
- Add a catalog entry in `lib/catalog.ts` and a `Showcase` case. Usage snippets import from `@/components/ui` or `@/components/ravenwood`, which is the consumer path.
- Run `pnpm registry:validate`, `pnpm registry:build`, and `pnpm typecheck` after registry or component edits.

## Do not

- Add a second primitive system, or restyle back to zinc and Inter.
- Point the registry at re-export files.
- Put page grain, heavy shadow, or decorative texture on a control.
- Use a bare registry dependency name for a Ravenwood item.
- Import signature components from `@/registry/ravenwood` in consumer-facing snippets. The preview site may import that path. Installed apps receive `components/ravenwood`.

## Add a component

1. Start from the closest file in `components/ui` or `registry/ravenwood`.
2. Use the tokens above. Button, card, input, dialog, and sidebar are the reference for radius, inset, scrim, and the brass rail.
3. Register the item in `registry.json` with `title`, `description`, npm `dependencies`, and GitHub `registryDependencies`.
4. `pnpm exec shadcn registry validate` then `pnpm exec shadcn build`.
5. Add the slug to `lib/catalog.ts` and `components/docs/showcase.tsx`.
6. `pnpm typecheck`.

`components.json` already has:

```json
"registries": {
  "@ravenwood": "https://raw.githubusercontent.com/raythurman2386/ravenwood-ui/main/public/r/{name}.json"
}
```

Install from this checkout while iterating with `pnpm exec shadcn add ./public/r/<name>.json`.
