/**
 * Records the demonstration video: a scripted walk through the site in
 * headless Chrome, captured frame by frame over the DevTools screencast and
 * assembled by ffmpeg into an MP4 of about seventy seconds.
 *
 *   node scripts/demo-video.mjs http://localhost:4174 docs/portfolio/demo.mp4
 *
 * Needs the API (the walk sends a booking request) and an ffmpeg binary.
 * The request uses an @example.com address; delete such rows afterwards.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { launch } from "./lib/chrome.mjs";

const base = (process.argv[2] ?? "http://localhost:4174").replace(/\/$/, "");
const out = process.argv[3] ?? "docs/portfolio/demo.mp4";
const W = 1440;
const H = 900;

const TRIP = JSON.stringify({
  state: {
    startDate: "2027-03-10", month: "mar", adults: 2, children: 1, durationDays: 9, currency: "USD", interests: ["history", "food"], tier: "comfort", tourStyle: "private", serviceIncluded: true, savedExperienceSlugs: [],
    confirmed: ["basics", "places", "stay", "experiences", "itinerary"], journeySlug: null,
    days: [
      { id: "a", destinationSlug: "giza", items: [{ id: "a1", kind: "experience", experienceSlug: "giza-pyramids-sunrise" }] },
      { id: "b", destinationSlug: "giza", items: [{ id: "b1", kind: "experience", experienceSlug: "grand-egyptian-museum-guided" }] },
      { id: "c", destinationSlug: "luxor", items: [{ id: "c1", kind: "experience", experienceSlug: "luxor-hot-air-balloon" }] },
      { id: "d", destinationSlug: "luxor", items: [{ id: "d1", kind: "experience", experienceSlug: "valley-of-the-kings-private" }, { id: "d2", kind: "experience", experienceSlug: "karnak-sound-and-light" }] },
      { id: "e", destinationSlug: "luxor", items: [{ id: "e1", kind: "free", note: "A late breakfast and the pool" }] },
      { id: "f", destinationSlug: "aswan", items: [{ id: "f1", kind: "experience", experienceSlug: "abu-simbel-sunrise" }] },
      { id: "g", destinationSlug: "aswan", items: [{ id: "g1", kind: "transport", note: "Morning flight to Cairo" }] },
      { id: "h", destinationSlug: "cairo", items: [] },
    ],
  },
  version: 3,
});

const frames = mkdtempSync(join(tmpdir(), "wl-demo-"));
const b = await launch({ port: 9850, width: W, height: H });
await b.viewport({ width: W, height: H });

// Every screencast frame is written with the moment it arrived, so the video
// keeps real time even though frames only come when something changes.
const stamps = [];
let count = 0;
let recording = false;
const started = Date.now();
b.send("Page.startScreencast", { format: "jpeg", quality: 80, maxWidth: W, maxHeight: H, everyNthFrame: 1 });
const onFrame = async (message) => {
  if (message.method !== "Page.screencastFrame") return;
  const { data, sessionId } = message.params;
  b.send("Page.screencastFrameAck", { sessionId });
  if (!recording) return;
  count += 1;
  const file = join(frames, `f${String(count).padStart(5, "0")}.jpg`);
  writeFileSync(file, Buffer.from(data, "base64"));
  stamps.push({ file, at: (Date.now() - started) / 1000 });
};
// The driver hands raw messages to nobody; listen on its socket through send's transport by polling frames via CDP events.
const ws = await b.socket?.();
if (!ws) throw new Error("driver exposes no socket");
ws.addEventListener("message", (event) => void onFrame(JSON.parse(event.data)));

const scrollTo = async (y, ms = 1400) => {
  await b.ev(`window.scrollTo({ top: ${y}, behavior: 'smooth' })`);
  await b.sleep(ms);
};
const scrollToEl = async (expression, ms = 1400) => {
  await b.ev(`(${expression})?.scrollIntoView({ block: 'start', behavior: 'smooth' })`);
  await b.sleep(ms);
};
const clickText = (selector, pattern) => b.click(`[...document.querySelectorAll(${JSON.stringify(selector)})].find(e => ${pattern}.test(e.textContent))`);
const typeInto = async (selector, text) => {
  await b.click(`document.querySelector(${JSON.stringify(selector)})`);
  for (const ch of text) {
    await b.send("Input.insertText", { text: ch });
    await b.sleep(40);
  }
};

// Fresh visitor, English.
await b.go(`${base}/?lng=en`, 1500);
await b.ev("localStorage.clear(); localStorage.setItem('wanderlush.language','en')");
await b.go(`${base}/`, 300);
recording = true;
await b.sleep(2600); // the hero settles
await scrollTo(760, 1300);
await scrollToEl("document.querySelector('#map')", 1500);
await clickText("#map button", "/^Luxor$/");
await b.sleep(1200);
await clickText("#map button", "/^Aswan$/");
await b.sleep(1300);

// A guide, its gallery, and adding it to the trip.
await b.go(`${base}/destinations/luxor`, 2400);
await scrollTo(900, 1300);
await scrollToEl("[...document.querySelectorAll('h2')].find(h => /Gallery|Photographs|In pictures/i.test(h.textContent))", 1300);
await b.click("document.querySelector('button[aria-label^=\"Open image\"]')");
await b.sleep(1500);
await b.key("ArrowRight");
await b.sleep(1100);
await b.key("Escape");
await b.sleep(400);
await scrollTo(0, 1000);
await clickText("main button", "/^Add to trip$/");
await b.sleep(1800);

// The builder, with a week already planned so the itinerary has something to say.
await b.ev(`localStorage.setItem('wanderlush.trip', ${JSON.stringify(TRIP)})`);
await b.go(`${base}/trip-builder?step=places`, 2200);
await scrollToEl("[...document.querySelectorAll('h2')].find(h => /route/i.test(h.textContent))", 1500);
await b.click("[...document.querySelectorAll('button[aria-label]')].find(b => /One day more in Luxor/.test(b.getAttribute('aria-label')))");
await b.sleep(1400);
await clickText("nav[aria-label] button", "/Itinerary/");
await b.sleep(1800);
await scrollTo(520, 1400);
await scrollTo(1100, 1500);

// The estimate, in another currency and with private tours.
await b.go(`${base}/trip-summary`, 2400);
await b.fill("#page-currency", "EGP");
await b.sleep(1800);
await b.fill("#page-currency", "USD");
await b.sleep(1400);
await scrollToEl("document.querySelector('#estimate-days')", 1500);
await scrollTo(0, 800);
await b.click("[...document.querySelectorAll('aside a')].find(a => /Request this trip/.test(a.textContent))");
await b.sleep(1600);

// The request: details typed, then sent.
await b.go(`${base}/booking?step=details`, 1800);
await typeInto("#full-name", "Nour Hassan");
await typeInto("#email", "nour.demo@example.com");
await typeInto("#phone", "+20 100 123 4567");
await b.fill("#country", "EG");
await b.click("document.querySelector('input[name=contactMethod][value=whatsapp]')");
await b.sleep(900);
await clickText("main button[type=submit]", "/preferences/i");
await b.sleep(1500);
await clickText("main button", "/^Halal$/");
await b.sleep(900);
await clickText("main button[type=submit]", "/Check and send/");
await b.sleep(1800);
await b.click("document.querySelector('#consent')");
await b.sleep(700);
await clickText("main button[type=submit]", "/Send the request/");
await b.until("/booking\\/confirmation/.test(location.pathname)", 20000);
await b.sleep(3200); // the tick draws, the reference lands

// The same site in Arabic.
await b.go(`${base}/?lng=ar`, 2800);
await scrollTo(700, 1300);
await b.go(`${base}/trip-builder?step=itinerary`, 2400);
await scrollTo(600, 1600);
await b.sleep(400);
recording = false;
await b.send("Page.stopScreencast");
b.close();

// Assemble: each frame is shown until the next one arrived. Frames come in
// bursts while the page scrolls, so the real gaps are kept, however small;
// the fps filter resamples them to a steady rate without stretching time.
const list = stamps.map((s, i) => `file '${s.file}'\nduration ${Math.max(0.001, (stamps[i + 1]?.at ?? s.at + 1.5) - s.at).toFixed(3)}`).join("\n") + `\nfile '${stamps[stamps.length - 1].file}'\n`;
const listFile = join(frames, "frames.txt");
writeFileSync(listFile, list);
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", listFile, "-vf", `scale=1280:800:force_original_aspect_ratio=decrease,pad=1280:800:(ow-iw)/2:(oh-ih)/2:color=#12100c,fps=30,format=yuv420p`, "-c:v", "libx264", "-preset", "medium", "-crf", "23", "-movflags", "+faststart", out]);
rmSync(frames, { recursive: true, force: true });
console.log(`${out}: ${stamps.length} frames over ${stamps[stamps.length - 1].at.toFixed(1)}s`);
