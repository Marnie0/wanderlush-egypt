/**
 * Screenshot helper for reviewing the site during development.
 *
 *   node scripts/screenshot.mjs <url> <out.png> [--width=1440] [--height=900]
 *                                              [--scroll=#selector] [--wait=2500]
 *
 * Drives headless Chrome over the DevTools protocol rather than the one-shot
 * `--screenshot` flag, because that flag cannot scroll, cannot wait for lazy
 * sections, and races entrance animations.
 */
import { spawn } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const [url, out, ...flags] = process.argv.slice(2);
if (!url || !out) {
  console.error("usage: node scripts/screenshot.mjs <url> <out.png> [--flags]");
  process.exit(1);
}
const flag = (name, fallback) => {
  const found = flags.find((f) => f.startsWith(`--${name}=`));
  return found ? found.split("=").slice(1).join("=") : fallback;
};

const width = Number(flag("width", 1440));
const height = Number(flag("height", 900));
const scrollTo = flag("scroll", "");
const wait = Number(flag("wait", 2500));
const port = 9222 + Math.floor(Math.random() * 400);

const chrome = spawn(
  "google-chrome",
  [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--hide-scrollbars",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${mkdtempSync(join(tmpdir(), "shot-"))}`,
    `--window-size=${width},${height}`,
    "about:blank",
  ],
  { stdio: "ignore" },
);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function endpoint() {
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/list`);
      const targets = await res.json();
      const page = targets.find((t) => t.type === "page");
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {
      /* chrome is still starting */
    }
    await sleep(250);
  }
  throw new Error("chrome did not expose a debugging endpoint");
}

const ws = new WebSocket(await endpoint());
await new Promise((resolve) => ws.addEventListener("open", resolve, { once: true }));

let nextId = 1;
const pending = new Map();
ws.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  const resolver = pending.get(message.id);
  if (resolver) {
    pending.delete(message.id);
    resolver(message.result ?? {});
  }
});
const send = (method, params = {}) =>
  new Promise((resolve) => {
    const id = nextId++;
    pending.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params }));
  });

await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", {
  width,
  height,
  deviceScaleFactor: 1,
  mobile: width < 700,
});
await send("Page.navigate", { url });
await sleep(wait);

if (scrollTo) {
  await send("Runtime.evaluate", {
    expression: `document.querySelector(${JSON.stringify(scrollTo)})
      ?.scrollIntoView({ behavior: "instant", block: "start" })`,
    awaitPromise: false,
  });
  // Entrance animations fire on scroll, so give them time to settle.
  await sleep(1600);
}

const { data } = await send("Page.captureScreenshot", { format: "png" });
writeFileSync(out, Buffer.from(data, "base64"));
console.log(`${out} (${width}x${height})`);

ws.close();
chrome.kill();
