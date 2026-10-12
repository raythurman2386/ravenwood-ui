// Fail early (before any screen runs) if Playwright or its browsers are missing on this box.
import fs from "node:fs";
const mod = process.env.PLAYWRIGHT_MODULE;
let chromium;
try { ({ chromium } = await import(mod ?? "playwright")); }
catch (e) { console.error(`PREFLIGHT FAIL: cannot import Playwright from PLAYWRIGHT_MODULE=${mod ?? "(unset)"}: ${e.message.split("\n")[0]}\n  fix: see "Fresh box setup" in SKILL.md`); process.exit(3); }
const exe = process.env.PW_CHROMIUM || chromium.executablePath();
if (!exe || !fs.existsSync(exe)) {
  console.error(`PREFLIGHT FAIL: Chromium not found at ${exe || "(none)"} (PLAYWRIGHT_BROWSERS_PATH=${process.env.PLAYWRIGHT_BROWSERS_PATH ?? "(unset, default ~/.cache/ms-playwright)"}, PW_CHROMIUM=${process.env.PW_CHROMIUM ?? "(unset)"})\n  fix: PLAYWRIGHT_BROWSERS_PATH=<dir> npx playwright@<same version> install chromium ffmpeg, or set PW_CHROMIUM to a chromium binary`);
  process.exit(3);
}
const bp = process.env.PLAYWRIGHT_BROWSERS_PATH || `${process.env.HOME}/.cache/ms-playwright`;
const ff = fs.existsSync(bp) && fs.readdirSync(bp).some((d) => d.startsWith("ffmpeg"));
if (!ff) { console.error(`PREFLIGHT FAIL: no ffmpeg-* under ${bp}; the navigation video needs it.\n  fix: PLAYWRIGHT_BROWSERS_PATH=${bp} npx playwright@<same version> install ffmpeg`); process.exit(3); }
console.log(`preflight OK: chromium ${exe}; ffmpeg in ${bp}`);
