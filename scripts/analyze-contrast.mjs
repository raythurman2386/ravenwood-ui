/*---------------------------------------------------------------
 *  WCAG contrast, status-color separation, and editor-theme
 *  parity for the Ravenwood UI tokens.
 *
 *  Adapted from ravenwood-vscode/scripts/analyze-contrast.mjs.
 *  Reads app/globals.css so the report cannot drift from the
 *  tokens. Editor anchors are the medium-contrast palette in
 *  ravenwood-vscode (syntax inks, not UI surfaces).
 *
 *  Run: node scripts/analyze-contrast.mjs
 *--------------------------------------------------------------*/

import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const css = readFileSync(resolve(root, "app/globals.css"), "utf8")

// Machado, Oliveira, Fernandes 2009. Severity 1, applied to linear sRGB.
const CVD = {
  protanopia: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  deuteranopia: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
  tritanopia: [
    [1.255528, -0.076749, -0.178779],
    [-0.078411, 0.930809, 0.147602],
    [0.004733, 0.691367, 0.3039],
  ],
}

// Medium-contrast Ravenwood editor palette. Hue cousins only.
const editor = {
  light: {
    bg: "#f5f4ed",
    fg: "#3f4a45",
    red: "#c92a2a",
    orange: "#c2410c",
    yellow: "#92400e",
    green: "#064e3b",
    aqua: "#0f766e",
    dimRed: "#9b1c1c",
    dimOrange: "#7c2d12",
    dimYellow: "#6b3a08",
    dimGreen: "#053d29",
  },
  dark: {
    bg: "#141814",
    fg: "#e8d5b7",
    red: "#e67e80",
    orange: "#e69875",
    yellow: "#fbbf24",
    green: "#4ade80",
    aqua: "#34d399",
    dimRed: "#da6362",
    dimOrange: "#d77f48",
    dimYellow: "#bf983d",
    dimGreen: "#5e8d5e",
  },
}

const textPairs = [
  ["foreground", "background", "body text"],
  ["foreground", "card", "body text on a card"],
  ["card-foreground", "card", "card text"],
  ["popover-foreground", "popover", "popover text"],
  ["primary-foreground", "primary", "primary button"],
  ["secondary-foreground", "secondary", "secondary button"],
  ["muted-foreground", "background", "muted text on the page"],
  ["muted-foreground", "muted", "muted text on a muted fill"],
  ["muted-foreground", "card", "muted text on a card"],
  ["accent-foreground", "accent", "accent text"],
  ["destructive", "background", "error text"],
  ["destructive", "card", "error text on a card"],
  ["moss-foreground", "moss", "moss status"],
  ["lantern-foreground", "lantern", "lantern status"],
  ["rust-foreground", "rust", "rust status and destructive fill"],
  ["sidebar-foreground", "sidebar", "sidebar text"],
  ["sidebar-primary-foreground", "sidebar-primary", "sidebar primary"],
  ["sidebar-accent-foreground", "sidebar-accent", "sidebar accent"],
]

const componentPairs = [
  ["ring", "background", "focus ring on the page"],
  ["ring", "card", "focus ring on a card"],
  ["sidebar-ring", "sidebar", "sidebar focus ring"],
  ["primary", "background", "primary button against the page"],
  ["destructive", "background", "destructive ink against the page"],
  ["chart-1", "background", "chart canopy"],
  ["chart-2", "background", "chart brass"],
  ["chart-3", "background", "chart moss"],
  ["chart-4", "background", "chart rust"],
  ["chart-5", "background", "chart parchment"],
]

const fieldTextPairs = [["foreground", "input", "text in a field"]]

const hairlines = [
  ["border", "background", "page hairline"],
  ["sidebar-border", "sidebar", "sidebar hairline"],
]

const statusNames = ["background", "moss", "lantern", "rust"]

function hslToRgb(h, s, l) {
  const sat = s / 100
  const light = l / 100
  const a = sat * Math.min(light, 1 - light)
  const f = (n) => {
    const k = (n + h / 30) % 12
    return light - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
  }
  return [f(0), f(8), f(4)].map((channel) => Math.round(channel * 255))
}

function rgbToHex(r, g, b) {
  return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`
}

function hexToRgb(hex) {
  const h = hex.replace("#", "")
  return [
    Number.parseInt(h.slice(0, 2), 16),
    Number.parseInt(h.slice(2, 4), 16),
    Number.parseInt(h.slice(4, 6), 16),
  ]
}

function srgbToLinear(channel) {
  const s = channel / 255
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

function linearToSrgb(channel) {
  const value =
    channel <= 0.0031308 ? 12.92 * channel : 1.055 * channel ** (1 / 2.4) - 0.055
  return Math.round(Math.min(1, Math.max(0, value)) * 255)
}

function relativeLuminance(hex) {
  const [r, g, b] = hexToRgb(hex).map(srgbToLinear)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrastRatio(hex1, hex2) {
  const l1 = relativeLuminance(hex1)
  const l2 = relativeLuminance(hex2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

function wcagRating(ratio, minimum) {
  if (ratio >= 7) return "AAA"
  if (ratio >= 4.5) return "AA"
  if (ratio >= 3) return minimum === 3 ? "AA" : "AA large"
  return "FAIL"
}

function oklab(hex) {
  const [r, g, b] = hexToRgb(hex).map(srgbToLinear)
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return {
    L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  }
}

function deltaE(hex1, hex2) {
  const left = oklab(hex1)
  const right = oklab(hex2)
  return (
    Math.hypot(left.L - right.L, left.a - right.a, left.b - right.b) * 100
  )
}

function simulate(hex, kind) {
  const [r, g, b] = hexToRgb(hex).map(srgbToLinear)
  const matrix = CVD[kind]
  const next = matrix.map((row) => row[0] * r + row[1] * g + row[2] * b)
  return rgbToHex(...next.map(linearToSrgb))
}

function hueOf(hex) {
  const [r, g, b] = hexToRgb(hex).map((channel) => channel / 255)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  if (max === min) return null
  const d = max - min
  let hue
  if (max === r) hue = ((g - b) / d + (g < b ? 6 : 0)) * 60
  else if (max === g) hue = ((b - r) / d + 2) * 60
  else hue = ((r - g) / d + 4) * 60
  return hue
}

function hueDelta(a, b) {
  const raw = Math.abs(a - b) % 360
  return Math.min(raw, 360 - raw)
}

function parseBlock(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const match = css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`))
  if (!match) throw new Error(`Missing ${selector} block in app/globals.css`)
  const tokens = {}
  for (const line of match[1].split("\n")) {
    const found = line.match(/--([\w-]+):\s*hsl\(\s*([0-9.]+)\s+([0-9.]+)%\s+([0-9.]+)%\s*\)/)
    if (!found) continue
    const h = Number(found[2])
    const s = Number(found[3])
    const l = Number(found[4])
    const [r, g, b] = hslToRgb(h, s, l)
    tokens[found[1]] = { h, s, l, hex: rgbToHex(r, g, b) }
  }
  return tokens
}

function requireToken(tokens, name) {
  if (!tokens[name]) throw new Error(`Missing --${name}`)
  return tokens[name].hex
}

const modes = [
  ["light", parseBlock(":root")],
  ["dark", parseBlock(".dark")],
]

let issues = 0
let warnings = 0

console.log("=".repeat(78))
console.log("  RAVENWOOD UI — TOKEN CONTRAST")
console.log("=".repeat(78))

for (const [mode, tokens] of modes) {
  console.log(`\n── ${mode.toUpperCase()} ──`)
  const covered = new Set()
  const touch = (...names) => {
    for (const name of names) covered.add(name)
  }

  for (const [fg, bg, label] of [...textPairs, ...fieldTextPairs]) {
    touch(fg, bg)
    const ratio = contrastRatio(requireToken(tokens, fg), requireToken(tokens, bg))
    const rating = wcagRating(ratio, 4.5)
    const mark = ratio >= 4.5 ? "ok" : "FAIL"
    console.log(
      `  ${mark.padEnd(4)} ${ratio.toFixed(2).padStart(5)}  ${rating.padEnd(8)}  ${label}`,
    )
    if (ratio < 4.5) {
      issues += 1
      console.log(`        ${fg} ${tokens[fg].hex} on ${bg} ${tokens[bg].hex}`)
    } else if (ratio < 7) {
      warnings += 1
    }
  }

  console.log("  components and charts (3:1)")
  for (const [fg, bg, label] of componentPairs) {
    touch(fg, bg)
    const ratio = contrastRatio(requireToken(tokens, fg), requireToken(tokens, bg))
    const rating = wcagRating(ratio, 3)
    const mark = ratio >= 3 ? "ok" : "FAIL"
    console.log(
      `  ${mark.padEnd(4)} ${ratio.toFixed(2).padStart(5)}  ${rating.padEnd(8)}  ${label}`,
    )
    if (ratio < 3) {
      issues += 1
      console.log(`        ${fg} ${tokens[fg].hex} on ${bg} ${tokens[bg].hex}`)
    }
  }

  console.log("  hairlines")
  for (const [fg, bg, label] of hairlines) {
    touch(fg, bg)
    const ratio = contrastRatio(requireToken(tokens, fg), requireToken(tokens, bg))
    const mark = ratio >= 3 ? "ok" : "note"
    console.log(
      `  ${mark.padEnd(4)} ${ratio.toFixed(2).padStart(5)}           ${label}`,
    )
    if (ratio < 3) warnings += 1
  }

  console.log("  status separation (OKLab ΔE, 100 = clearly different)")
  const views = ["normal", "protanopia", "deuteranopia", "tritanopia"]
  for (const view of views) {
    const paint = (name) =>
      view === "normal" ? tokens[name].hex : simulate(tokens[name].hex, view)
    const parts = []
    for (let i = 0; i < statusNames.length; i += 1) {
      for (let j = i + 1; j < statusNames.length; j += 1) {
        const left = statusNames[i]
        const right = statusNames[j]
        const distance = deltaE(paint(left), paint(right))
        parts.push(`${left}/${right} ${distance.toFixed(1)}`)
        const rustPair =
          (left === "rust" && right === "background") ||
          (left === "background" && right === "rust")
        const rustNeighbor =
          left === "rust" || right === "rust"
            ? statusNames.includes(left) && statusNames.includes(right) && left !== right
            : false
        if (view !== "tritanopia" && rustPair && distance < 12) {
          issues += 1
          console.log(
            `  FAIL ${view} ${left} vs ${right} ΔE ${distance.toFixed(1)} — rust wash collapses`,
          )
        } else if (
          view !== "tritanopia" &&
          rustNeighbor &&
          (left === "rust" || right === "rust") &&
          distance < 8
        ) {
          issues += 1
          console.log(
            `  FAIL ${view} ${left} vs ${right} ΔE ${distance.toFixed(1)} — rust collides with a neighbor`,
          )
        }
      }
    }
    console.log(`  ${view.padEnd(13)} ${parts.join("   ")}`)
  }

  const rust = tokens.rust
  if (mode === "light" && (rust.h < 14 || rust.h > 28 || rust.l > 88)) {
    issues += 1
    console.log(
      `  FAIL light rust hsl(${rust.h} ${rust.s}% ${rust.l}%) reads as a pale pink wash. Iron oxide sits near hue 14–28 and below the paper.`,
    )
  }

  console.log("  editor hue cousins (medium Ravenwood)")
  const anchors = editor[mode]
  const cousins = [
    ["primary", "green", "canopy / editor green"],
    ["primary", "aqua", "canopy / editor aqua"],
    ["ring", "yellow", "brass ring / editor yellow"],
    ["destructive", "red", "dried blood / editor red"],
    ["rust", "orange", "rust surface / editor orange"],
    ["foreground", "fg", "ink / editor foreground"],
    ["background", "bg", "paper or bark / editor background"],
  ]
  for (const [token, anchor, label] of cousins) {
    const tokenHue = hueOf(tokens[token].hex)
    const anchorHue = hueOf(anchors[anchor])
    const gap =
      tokenHue == null || anchorHue == null
        ? "neutral"
        : `${hueDelta(tokenHue, anchorHue).toFixed(0)}°`
    touch(token)
    console.log(
      `  ${label.padEnd(36)} ${tokens[token].hex} vs ${anchors[anchor]}  hue gap ${gap}`,
    )
  }

  const missed = Object.keys(tokens).filter((name) => !covered.has(name))
  if (missed.length) {
    issues += missed.length
    console.log(`  FAIL unchecked tokens: ${missed.join(", ")}`)
  } else {
    console.log(`  every color token checked (${Object.keys(tokens).length})`)
  }
}

console.log(`\n${"=".repeat(78)}`)
console.log(`  ${issues} issues, ${warnings} notes`)
console.log("=".repeat(78))
process.exit(issues > 0 ? 1 : 0)
