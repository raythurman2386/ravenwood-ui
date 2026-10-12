/**
 * Every docs-site screen x {1440, 390}: fresh load, navigate IN client-side,
 * AWAY (header "Ravenwood home"), BACK. Fails on any pageerror or "Application error".
 *   BASE_URL=http://127.0.0.1:3402 OUT=<dir> node screens.mjs   (ONLY=<regex> to narrow)
 */
import fs from "node:fs";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const BASE = process.env.BASE_URL ?? "http://127.0.0.1:3402";
const OUT = process.env.OUT ?? "/tmp/verify-ravenwood-ui-artifacts/manual";
fs.mkdirSync(`${OUT}/screens`, { recursive: true });
const NAV = { "/docs": "Docs", "/kitchen": "Runs", "/motion": "Motion" };
const docsHtml = await (await fetch(BASE + "/docs")).text();
const slugs = [...new Set([...docsHtml.matchAll(/href="\/docs\/([\w-]+)"/g)].map((m) => m[1]))];
const screens = [
  { id: "/", path: "/", inVia: "home" },
  ...Object.keys(NAV).map((p) => ({ id: p, path: p, inVia: "nav" })),
  ...slugs.map((s) => ({ id: `/docs/${s}`, path: `/docs/${s}`, inVia: "docs-card" })),
  { id: "404", path: "/docs/this-item-does-not-exist", inVia: "url", expect404: true },
].filter((s) => !process.env.ONLY || new RegExp(process.env.ONLY).test(s.id));
console.log(`screens: ${screens.length} (${slugs.length} docs pages)`);
const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined,
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const settle = (p) => p.waitForLoadState("load").then(() => p.waitForTimeout(900));
async function navClick(page, mobile, label) {
  if (label === "Home" && !mobile) return page.getByRole("link", { name: "Ravenwood home" }).click();
  if (mobile) {
    await page.locator("header").getByRole("button", { name: "Open menu" }).click();
    return page.getByRole("dialog").getByRole("link", { name: label, exact: true }).click();
  }
  return page.locator("header").getByRole("link", { name: label, exact: true }).first().click();
}
const results = [];
for (const vp of [{ w: 1440, h: 900 }, { w: 390, h: 844 }]) {
  const mobile = vp.w < 768;
  for (const s of screens) {
    const ctx = await b.newContext({ viewport: { width: vp.w, height: vp.h } });
    const page = await ctx.newPage(); const errors = []; const steps = [];
    page.on("pageerror", (e) => errors.push((e.stack || e.message).split("\n")[0]));
    const check = async (step, want404 = false) => {
      const t = await page.evaluate(() => document.body.innerText);
      const appErr = /Application error/.test(t);
      const is404 = /could not be found|not found|404/i.test(t + (await page.title()));
      const ok = !appErr && (!want404 || is404) && errors.length === 0;
      steps.push(`${step}:${ok ? "ok" : "FAIL"}`); return ok;
    };
    let pass = true, via = "";
    try {
      const r = await page.goto(BASE + s.path); await settle(page);
      if (s.expect404 && r.status() !== 404) { pass = false; steps.push(`status ${r.status()}`); }
      pass = (await check("fresh", s.expect404)) && pass;
      await page.screenshot({ path: `${OUT}/screens/${vp.w}-${s.id.replace(/\W+/g, "_") || "home"}.png` });
      await page.goto(BASE + (s.path === "/" ? "/docs" : s.inVia === "docs-card" ? "/docs" : "/")); await settle(page);
      if (s.inVia === "nav") { await navClick(page, mobile, NAV[s.path]); via = "header link"; }
      else if (s.inVia === "home") { await navClick(page, mobile, "Home"); via = mobile ? "menu Home" : "Ravenwood home"; }
      else if (s.inVia === "docs-card") { await page.locator(`main a[href="${s.path}"]`).first().click(); via = "/docs card"; }
      else { await page.goto(BASE + s.path); via = "direct URL"; }
      await page.waitForURL((u) => u.pathname === s.path, { timeout: 15000 }); await settle(page);
      pass = (await check("in", s.expect404)) && pass;
      const hasHeader = await page.getByRole("link", { name: "Ravenwood home" }).count();
      if (!hasHeader) { await page.goto(BASE + "/"); steps.push("away-via-url(no site header)"); }
      else if (s.path === "/") { await navClick(page, mobile, "Docs"); } else { await navClick(page, mobile, "Home"); }
      await page.waitForURL((u) => u.pathname !== s.path, { timeout: 15000 }); await settle(page);
      pass = (await check("away")) && pass;
      await page.goBack(); await settle(page);
      pass = (await check("back")) && pass && new URL(page.url()).pathname === s.path;
    } catch (e) { pass = false; steps.push("EXC " + e.message.split("\n")[0]); }
    results.push({ viewport: vp.w, screen: s.id, pass, via, steps: steps.join(" "), pageerrors: errors.length, firstError: errors[0] ?? "" });
    console.log(`${pass ? "PASS" : "FAIL"}  ${vp.w}  ${s.id}  [${via}] ${steps.join(" ")} pageerrors=${errors.length}${errors[0] ? " :: " + errors[0] : ""}`);
    await ctx.close();
  }
}
if (!process.env.ONLY) { // one navigation video
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir: `${OUT}/video`, size: { width: 1440, height: 900 } } });
  const page = await ctx.newPage(); const errors = []; page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(BASE + "/"); await settle(page);
  for (const l of ["Docs", "Motion", "Docs"]) { await navClick(page, false, l); await page.waitForTimeout(1800); }
  await page.locator('main a[href="/docs/map"]').first().click(); await page.waitForTimeout(5000);
  await navClick(page, false, "Home"); await page.waitForTimeout(1500);
  await ctx.close();
  results.push({ viewport: 1440, screen: "video-tour", pass: !errors.length, pageerrors: errors.length, firstError: errors[0] ?? "" });
  console.log(`${errors.length ? "FAIL" : "PASS"}  video-tour  pageerrors=${errors.length}`);
}
await b.close();
fs.writeFileSync(`${OUT}/screens.json`, JSON.stringify(results, null, 2));
const failed = results.filter((r) => !r.pass).length;
console.log(`\nscreens: ${results.length - failed}/${results.length} passed`); process.exit(failed ? 1 : 0);
