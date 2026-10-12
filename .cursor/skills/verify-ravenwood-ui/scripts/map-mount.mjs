/**
 * Map item mount/unmount in the scratch app: 3x unmount/mount via button, 3x
 * client-side navigation away and back. 0 pageerrors; after each unmount no
 * maplibre canvas remains; after each mount exactly one.
 *   BASE_URL=http://127.0.0.1:3403 OUT=<dir> node map-mount.mjs
 */
import fs from "node:fs";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const BASE = process.env.BASE_URL ?? "http://127.0.0.1:3403", OUT = process.env.OUT ?? `${process.env.TMPDIR || "/tmp"}/verify-ravenwood-ui-artifacts/manual`;
fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const page = await ctx.newPage();
const errors = []; page.on("pageerror", (e) => errors.push(e.message));
const canvases = () => page.locator("canvas.maplibregl-canvas").count();
let fail = 0; const ok = (n, c, d = "") => { if (!c) fail++; console.log(`${c ? "PASS" : "FAIL"}  ${n}${d ? "  :: " + d : ""}`); };
await page.goto(BASE + "/"); await page.waitForSelector("canvas.maplibregl-canvas", { timeout: 30000 }); await page.waitForTimeout(2000);
ok("fresh load: one map canvas", (await canvases()) === 1, `errors ${errors.length}`);
await page.screenshot({ path: `${OUT}/scratch-map-mounted.png` });
for (let i = 1; i <= 3; i++) {
  await page.getByRole("button", { name: "Unmount map" }).click(); await page.waitForTimeout(1200);
  const c0 = await canvases();
  await page.getByRole("button", { name: "Mount map" }).click(); await page.waitForSelector("canvas.maplibregl-canvas"); await page.waitForTimeout(1500);
  ok(`unmount/mount #${i}: 0 canvases after unmount, 1 after mount, 0 pageerrors`, c0 === 0 && (await canvases()) === 1 && errors.length === 0, `after-unmount ${c0}; errors ${errors.length}${errors[0] ? ": " + errors[0] : ""}`);
}
for (let i = 1; i <= 3; i++) {
  await page.getByRole("link", { name: "Other page" }).click(); await page.waitForURL("**/other"); await page.waitForTimeout(1200);
  const c0 = await canvases();
  await page.getByRole("link", { name: "Back to map" }).click(); await page.waitForSelector("canvas.maplibregl-canvas"); await page.waitForTimeout(1500);
  ok(`navigate away/back #${i}: map unmounted away, remounted back, 0 pageerrors`, c0 === 0 && (await canvases()) === 1 && errors.length === 0, `away canvases ${c0}; errors ${errors.length}${errors[0] ? ": " + errors[0] : ""}`);
}
await ctx.close(); await b.close();
console.log(`\nmap mount/unmount: ${fail ? "FAIL" : "PASS"} (pageerrors ${errors.length})`); process.exit(fail ? 1 : 0);
