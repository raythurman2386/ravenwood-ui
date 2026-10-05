# Ravenwood UI

A personal component library. shadcn/ui on Radix, restyled as a dark forest cabin, and published as a registry this repo owns.

The preview site and the registry are the same project. Tokens, primitives, and signature pieces are edited here. Other apps install them with the shadcn CLI.

Style name in the CLI is `radix-nova`: Radix primitives, the nova generation of the new-york defaults. Ravenwood keeps those primitives and replaces the palette, type, motion, and a few components.

## New app

`registry.json` at the repo root is the catalog. The `index` item is what `shadcn init` installs: Radix, the cabin tokens, Fraunces, Figtree, and the `@ravenwood` namespace. After that, components install by name.

```bash
npx shadcn@latest init --template next --base radix --name my-app --yes raythurman2386/ravenwood-ui/index
npx shadcn@latest add @ravenwood/button
npx shadcn@latest add @ravenwood/card @ravenwood/input @ravenwood/sidebar
```

The GitHub address is `owner/repo/item`. `raythurman2386/ravenwood-ui/index` is that item. Push this repo, including `registry.json` and `public/r`, before those commands can resolve.

An app that already ran `npx shadcn@latest init` can take the theme and the namespace without scaffolding again:

```bash
npx shadcn@latest add raythurman2386/ravenwood-ui/index
npx shadcn@latest add @ravenwood/button
```

## Philosophy

Fork shadcn and keep Radix, Tailwind, and the usual file layout. Dark is the default. Light is the paper theme. Tokens live in `app/globals.css`. Motion uses short named intents in `lib/motion.ts`: snap, ui, overlay, layout, and gentle. Grain sits on the page background. Controls are flat. Focus rings use `--ring`. Preview the motion at `/motion`.

## Tokens

Colors are HSL, stored as full `hsl()` values so they work inside `color-mix`. Source of truth in this repo: `app/globals.css`. The `theme` and `index` registry items carry the same values.

| Token | Dark | Role |
| --- | --- | --- |
| `--background` | `hsl(110 9% 4.7%)` | Near-black bark |
| `--card` | `hsl(120 8% 9%)` | Raised wood panel |
| `--foreground` | `hsl(40 38% 92%)` | Warm parchment |
| `--muted` / `--muted-foreground` | moss gray | Desaturated shade |
| `--border` | `hsl(130 12% 18%)` | Bark with a green edge |
| `--primary` | `hsl(158 40% 32%)` | Deep canopy emerald |
| `--accent` | `hsl(38 22% 16%)` | Lantern wash |
| `--ring` | `hsl(40 46% 58%)` | Lantern brass, also the focus ring |
| `--destructive` | `hsl(8 42% 62%)` | Dried blood, readable as text |
| `--moss`, `--lantern`, `--rust` | plus foregrounds | Alert and badge variants |

`--radius` is `0.45rem`. Forest cards use `rounded-2xl`.

| Role | Face |
| --- | --- |
| Display, headings, card titles | Fraunces (`--font-serif`) |
| Body and UI | Figtree (`--font-sans`) |
| Code | Geist Mono (`--font-mono`) |

Lucide icons use a 1.75 stroke. The raven mark is the brand lockup.

## Preview

```bash
pnpm install
pnpm dev
```

| Route | What it is |
| --- | --- |
| `/` | The system: mood, palette, type, install |
| `/docs` | Every component |
| `/docs/button` | Live example, install command, usage |
| `/kitchen` | Runs desk. A product screen, not a specimen grid |

`d` toggles dark and light, including while a field is focused only when the event target is not a typing control.

## Layout

```
app/globals.css              tokens, grain, heading face, icon stroke
components/ui/*              primitives the registry installs
registry/ravenwood/*         signature sources
components/ravenwood/*       where signatures land in a consumer app
hooks/use-mobile.ts
lib/utils.ts                 re-exports cn
registry.json                catalog
public/r/*.json              built items for the @ravenwood namespace
components.json              style radix-nova, registries.@ravenwood
```

The preview imports signatures from `@/registry/ravenwood/*`. Usage snippets and consumer apps import them from `@/components/ravenwood/*`. Primitives are one copy, in `components/ui`. The registry points at those files.

## Registry

61 items: `font-fraunces`, `theme` (`registry:style`), `index` (`registry:base`), `use-mobile`, the core UI set (including `input-group` and `scroll-area`, which Command and the CLI pull in), and twenty-five signature components.

Same-repository dependencies use the GitHub item address (`raythurman2386/ravenwood-ui/button`). A bare name such as `button` is the official shadcn button. After `index` is installed, `@ravenwood/button` resolves through the namespace written into `components.json`.

```bash
pnpm registry:validate
pnpm registry:build
```

`pnpm build` runs the registry build, then the Next.js build.

## Publish the GitHub registry

1. Push this repository to `github.com/raythurman2386/ravenwood-ui`. The default branch is what the CLI reads when no `#ref` is given.
2. Commit `registry.json` and the component sources. GitHub installs read those files. They do not need `public/r`.
3. Commit `public/r` as well. The `@ravenwood` namespace URL is the raw GitHub path to those built JSON files:

```
https://raw.githubusercontent.com/raythurman2386/ravenwood-ui/main/public/r/{name}.json
```

4. From another checkout, check the catalog before you rely on it:

```bash
npx shadcn@latest registry validate raythurman2386/ravenwood-ui
npx shadcn@latest view raythurman2386/ravenwood-ui/button
```

A deployed preview can also serve the built JSON at `/r/button.json`. The namespace in this repo points at raw GitHub so a new project does not need that server.

## Other install paths

Tokens on a project that already has shadcn, when you want the palette without the full base:

```bash
npx shadcn@latest add raythurman2386/ravenwood-ui/theme
```

One component, with no namespace configured yet:

```bash
npx shadcn@latest add raythurman2386/ravenwood-ui/button
```

Configure the namespace by itself:

```bash
npx shadcn@latest registry add @ravenwood=https://raw.githubusercontent.com/raythurman2386/ravenwood-ui/main/public/r/{name}.json
npx shadcn@latest add @ravenwood/button
```

`PageShell` imports `next/link`. Use it in a Next.js App Router app.

## How I use this in the next repo

1. Start the app with the `init` line above so the first commit already has bark, Fraunces, Figtree, and `@ravenwood`.
2. Add only the pieces that screen needs. A typical first screen is `button`, `input`, `card`, `dialog`, `sidebar`, `forest-card`, and `page-shell`.
3. Import primitives from `@/components/ui/*` and signature pieces from `@/components/ravenwood/*`.
4. When a component needs to change, change it in this repo, run `pnpm registry:build`, push, then `npx shadcn@latest add @ravenwood/<name> --overwrite` in the app.
5. New components are born here: a file under `components/ui` or `registry/ravenwood`, an entry in `registry.json`, a catalog row, a showcase case, then validate and build.

## Add a component

See `AGENTS.md`. Short version: match the existing primitive, depend on `@ravenwood` siblings with the GitHub address `raythurman2386/ravenwood-ui/<name>`, and keep the lantern focus ring.
