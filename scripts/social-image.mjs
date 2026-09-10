/**
 * Renders the social preview image (1200×630) and the favicon set.
 *
 *   node scripts/social-image.mjs
 *
 * The preview is a page rendered in headless Chrome, so it uses the site's
 * own typefaces and photograph rather than a font the server happens to
 * have; the favicons are rasterised from public/favicon.svg with sharp.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { launch } from "./lib/chrome.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const publicDir = `${root}public/`;
const hero = readFileSync(`${publicDir}images/hero/egypt-hero-1600.6367532e.webp`).toString("base64");
const fraunces = readFileSync(`${root}node_modules/@fontsource-variable/fraunces/files/fraunces-latin-opsz-normal.woff2`).toString("base64");
const inter = readFileSync(`${root}node_modules/@fontsource/inter/files/inter-latin-500-normal.woff2`).toString("base64");

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: "Fraunces"; src: url(data:font/woff2;base64,${fraunces}) format("woff2"); font-weight: 100 900; }
@font-face { font-family: "Inter"; src: url(data:font/woff2;base64,${inter}) format("woff2"); font-weight: 500; }
html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; }
.card { position: relative; width: 1200px; height: 630px; background: #12100c url(data:image/webp;base64,${hero}) center 40% / cover no-repeat; font-family: Inter, sans-serif; color: #fdfbf7; }
.scrim { position: absolute; inset: 0; background: linear-gradient(to top, rgba(10,9,7,.82) 0%, rgba(10,9,7,.45) 45%, rgba(10,9,7,.15) 75%, rgba(10,9,7,.35) 100%); }
.wash { position: absolute; inset: 0; background: linear-gradient(to right, rgba(10,9,7,.55) 0%, rgba(10,9,7,.2) 50%, transparent 80%); }
.copy { position: absolute; left: 72px; right: 72px; bottom: 64px; }
.eyebrow { font-size: 18px; letter-spacing: .18em; text-transform: uppercase; color: #e4ce96; font-weight: 500; }
h1 { font-family: Fraunces, Georgia, serif; font-weight: 400; font-size: 84px; line-height: 1; letter-spacing: -.02em; margin: 22px 0 0; max-width: 900px; text-shadow: 0 1px 24px rgba(10,9,7,.55); }
p { font-size: 26px; margin: 24px 0 0; color: rgba(253,251,247,.88); max-width: 760px; line-height: 1.4; }
.brand { position: absolute; top: 56px; left: 72px; display: flex; align-items: baseline; gap: 10px; font-family: Fraunces, Georgia, serif; font-size: 34px; }
.brand i { display: inline-block; width: 9px; height: 9px; border-radius: 50%; background: #dc7c45; }
</style></head><body><div class="card"><div class="scrim"></div><div class="wash"></div>
<div class="brand">Wanderlush Egypt <i></i></div>
<div class="copy"><div class="eyebrow">Experience Egypt beyond the ordinary</div><h1>Egypt, arranged around you</h1>
<p>Explore the destinations, build a day-by-day itinerary and see a transparent estimate before you request a booking.</p></div></div></body></html>`;

const page = `${publicDir}social-preview.html`;
writeFileSync(page, html);
const b = await launch({ width: 1200, height: 630 });
await b.viewport({ width: 1200, height: 630 });
await b.go(`file://${page}`, 2500);
await b.shot(`${publicDir}social-preview.png`);
b.close();
await sharp(`${publicDir}social-preview.png`).jpeg({ quality: 82, mozjpeg: true }).toFile(`${publicDir}social-preview.jpg`);
const { unlinkSync } = await import("node:fs");
unlinkSync(page);
unlinkSync(`${publicDir}social-preview.png`);

const svg = readFileSync(`${publicDir}favicon.svg`);
for (const [name, size] of [["favicon-32.png", 32], ["apple-touch-icon.png", 180], ["icon-192.png", 192], ["icon-512.png", 512]]) {
  await sharp(svg, { density: 512 }).resize(size, size).png().toFile(`${publicDir}${name}`);
}
writeFileSync(
  `${publicDir}site.webmanifest`,
  JSON.stringify({ name: "Wanderlush Egypt", short_name: "Wanderlush", start_url: "/", display: "standalone", background_color: "#fdfbf7", theme_color: "#143331", icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }, { src: "/icon-512.png", sizes: "512x512", type: "image/png" }] }, null, 2) + "\n",
);
console.log("social-preview.jpg, favicon-32.png, apple-touch-icon.png, icon-192.png, icon-512.png, site.webmanifest");
