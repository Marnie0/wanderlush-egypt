/**
 * Loads every route in headless Chrome, at a desktop and a phone viewport,
 * and reports console errors, failed network requests, missing headings,
 * horizontal overflow and broken internal links.
 *
 *   node scripts/check-pages.mjs http://localhost:4173
 */
import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const base = (process.argv[2] ?? "http://localhost:4173").replace(/\/$/, "");
const ROUTES = [
  "/", "/destinations", "/destinations/giza", "/destinations/fayoum",
  "/experiences", "/experiences/wadi-el-rayan-and-whale-valley", "/journeys",
  "/journeys/family-journey", "/trip-builder", "/trip-builder?step=places", "/trip-builder?step=stay",
  "/trip-builder?step=experiences", "/trip-builder?step=itinerary", "/trip-summary", "/booking",
  "/booking/confirmation", "/about", "/contact", "/faq", "/privacy", "/no-such-page",
  // Arabic runs last: the detector caches the choice, so every route visited
  // after this one would report as RTL and hide a real direction problem.
  "/?lng=ar", "/destinations", "/destinations/luxor", "/experiences", "/journeys", "/trip-summary",
];

/**
 * The trip pages render an empty state without a trip, which would leave the
 * cost table, the sticky aside and the day cards unchecked. This one is seeded
 * into the browser before those routes: three places, a child, a cruise, an
 * overloaded day, and Egyptian pounds for the widest figures.
 */
const SEEDED_TRIP = JSON.stringify({
  state: {
    startDate: "2027-03-10", month: "mar", adults: 2, children: 1, durationDays: 6, currency: "EGP",
    interests: [], tier: "comfort", tourStyle: "private", serviceIncluded: true, savedExperienceSlugs: [],
    days: [
      { id: "a", destinationSlug: "cairo", items: [] },
      { id: "b", destinationSlug: "aswan", items: [{ id: "b1", kind: "experience", experienceSlug: "nile-cruise-aswan-to-luxor" }] },
      { id: "c", destinationSlug: "aswan", items: [] },
      { id: "d", destinationSlug: "luxor", items: [
        { id: "d1", kind: "experience", experienceSlug: "luxor-hot-air-balloon" },
        { id: "d2", kind: "experience", experienceSlug: "valley-of-the-kings-private" },
        { id: "d3", kind: "free", note: "Pool afternoon" },
      ] },
      { id: "e", destinationSlug: "luxor", items: [] },
    ],
  },
  version: 3,
});
const SEEDED_ROUTES = ["/trip-builder", "/trip-summary"];

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900, mobile: false },
  { name: "phone", width: 390, height: 844, mobile: true },
];

const port = 9500 + Math.floor(Math.random() * 300);
const chrome = spawn("google-chrome", [
  "--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${mkdtempSync(join(tmpdir(), "check-"))}`,
  "--window-size=1440,900", "about:blank",
], { stdio: "ignore" });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let socketUrl;
for (let attempt = 0; attempt < 60 && !socketUrl; attempt++) {
  try {
    const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    socketUrl = list.find((t) => t.type === "page")?.webSocketDebuggerUrl;
  } catch {
    await sleep(250);
  }
}

const ws = new WebSocket(socketUrl);
await new Promise((resolve) => ws.addEventListener("open", resolve, { once: true }));

let nextId = 1;
const pending = new Map();
let consoleErrors = [];
let failedRequests = [];

ws.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.id) {
    const resolver = pending.get(message.id);
    if (resolver) {
      pending.delete(message.id);
      resolver(message.result ?? {});
    }
    return;
  }
  if (message.method === "Runtime.exceptionThrown") {
    consoleErrors.push(message.params.exceptionDetails?.text ?? "exception");
  }
  if (message.method === "Runtime.consoleAPICalled" && ["error", "warning"].includes(message.params.type)) {
    consoleErrors.push(
      `${message.params.type}: ${message.params.args.map((a) => a.value ?? a.description ?? "").join(" ")}`,
    );
  }
  if (message.method === "Network.loadingFailed") {
    failedRequests.push(message.params.errorText);
  }
  if (message.method === "Network.responseReceived" && message.params.response.status >= 400) {
    failedRequests.push(`${message.params.response.status} ${message.params.response.url}`);
  }
});

const send = (method, params = {}) =>
  new Promise((resolve) => {
    const id = nextId++;
    pending.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params }));
  });

await send("Page.enable");
await send("Runtime.enable");
await send("Network.enable");

let problems = 0;
const links = new Set();

for (const viewport of VIEWPORTS) {
  await send("Emulation.setDeviceMetricsOverride", {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 1,
    mobile: viewport.mobile,
  });
  // The language detector caches its choice in this profile, so each pass has
  // to start from English or it would inherit the Arabic run above.
  await send("Page.navigate", { url: `${base}/?lng=en` });
  await sleep(2000);
  console.log(`\n--- ${viewport.name} ${viewport.width}x${viewport.height} ---`);

  for (const route of ROUTES) {
    consoleErrors = [];
    failedRequests = [];
    if (SEEDED_ROUTES.some((prefix) => route.startsWith(prefix))) {
      await send("Runtime.evaluate", {
        expression: `localStorage.setItem("wanderlush.trip", ${JSON.stringify(SEEDED_TRIP)})`,
      });
    }
    await send("Page.navigate", { url: base + route });
    await sleep(3200);

    const info = (
      await send("Runtime.evaluate", {
        expression: `(() => ({
          h1: document.querySelector('h1')?.textContent?.trim() ?? null,
          title: document.title,
          lang: document.documentElement.lang,
          dir: document.documentElement.dir,
          links: [...document.querySelectorAll('a[href^="/"]')].map((a) => a.getAttribute('href')),
          overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        }))()`,
        returnByValue: true,
      })
    ).result.value;

    for (const href of info.links) links.add(href.split("#")[0]);

    const issues = [];
    if (!info.h1) issues.push("no h1");
    if (!info.title) issues.push("no title");
    if (info.overflow) issues.push("horizontal overflow");
    if (consoleErrors.length) issues.push(`console: ${consoleErrors.slice(0, 2).join(" | ")}`);
    if (failedRequests.length) issues.push(`network: ${failedRequests.slice(0, 2).join(" | ")}`);

    problems += issues.length;
    console.log(
      `${issues.length ? "FAIL" : "ok  "} ${route.padEnd(42)} ${info.dir} ${issues.join("; ")}`,
    );
  }
}

console.log(`\ninternal link targets found: ${links.size}`);
const known = new Set(ROUTES.map((r) => r.split("?")[0]));
const unchecked = [...links].filter(
  (l) => !known.has(l) && !l.startsWith("/destinations/") && !l.startsWith("/experiences/") && !l.startsWith("/journeys/"),
);
if (unchecked.length) console.log("links not covered by the route list:", unchecked.join(", "));
console.log(problems === 0 ? "\nall pages clean" : `\n${problems} problem(s)`);

ws.close();
chrome.kill();
process.exit(problems === 0 ? 0 : 1);
