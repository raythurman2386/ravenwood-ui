/*---------------------------------------------------------------
 *  Copy MapLibre's worker into public/ so maps never load it
 *  from a CDN. MapLibre 6 needs a worker URL under a bundler,
 *  and Turbopack does not emit the worker's sibling files, so
 *  the files are served as static assets instead.
 *
 *  components/ui/map.tsx defaults its worker URL to
 *  /maplibre/maplibre-gl-worker.mjs, which is where this
 *  script writes. Run it before dev and build:
 *
 *    "predev": "node scripts/copy-maplibre-worker.mjs",
 *    "prebuild": "node scripts/copy-maplibre-worker.mjs"
 *
 *  (pnpm skips pre/post scripts unless enable-pre-post-scripts
 *  is on; chain it instead: "node scripts/... && next build".)
 *
 *  Options: --out <dir> (default: public/maplibre)
 *--------------------------------------------------------------*/

import { copyFileSync, existsSync, mkdirSync } from "node:fs"
import { createRequire } from "node:module"
import { dirname, join, resolve } from "node:path"

const require = createRequire(join(process.cwd(), "package.json"))
const outFlag = process.argv.indexOf("--out")
const outDir = resolve(
  process.cwd(),
  outFlag > -1 ? process.argv[outFlag + 1] : "public/maplibre"
)

let dist
try {
  dist = join(dirname(require.resolve("maplibre-gl/package.json")), "dist")
} catch {
  console.error("maplibre-gl is not installed. Run your package manager first.")
  process.exit(1)
}

const files = ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"]
mkdirSync(outDir, { recursive: true })

let copied = 0
for (const file of files) {
  const from = join(dist, file)
  // The shared chunk only exists in some 6.x releases.
  if (!existsSync(from)) continue
  copyFileSync(from, join(outDir, file))
  copied += 1
}

if (!copied) {
  console.error(`No MapLibre worker found in ${dist}.`)
  process.exit(1)
}

const { version } = require("maplibre-gl/package.json")
console.log(
  `maplibre-gl ${version}: copied ${copied} worker file(s) to ${outDir}`
)
