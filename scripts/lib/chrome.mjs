/**
 * A small driver for headless Chrome over the DevTools protocol, shared by the
 * QA scripts. Nothing here knows about the site: it launches a browser,
 * evaluates JavaScript in the page, clicks, types, presses keys, takes
 * screenshots and collects console errors and failed requests.
 */
import { spawn } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export async function launch({ port = 9222 + Math.floor(Math.random() * 400), width = 1440, height = 900, downloadPath } = {}) {
  const chrome = spawn(
    "google-chrome",
    ["--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars", `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), "wl-qa-"))}`, `--window-size=${width},${height}`, "about:blank"],
    { stdio: "ignore" },
  );
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  let target;
  for (let i = 0; i < 80 && !target; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      target = list.find((t) => t.type === "page")?.webSocketDebuggerUrl;
    } catch {
      await sleep(250);
    }
  }
  if (!target) throw new Error("Chrome did not start");
  const ws = new WebSocket(target);
  await new Promise((resolve) => ws.addEventListener("open", resolve, { once: true }));
  let nextId = 1;
  const pending = new Map();
  const errors = [];
  const failed = [];
  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    const resolve = pending.get(message.id);
    if (resolve) {
      pending.delete(message.id);
      resolve(message.result ?? {});
    }
    if (message.method === "Runtime.exceptionThrown") errors.push(message.params.exceptionDetails.exception?.description?.slice(0, 200) || message.params.exceptionDetails.text);
    if (message.method === "Log.entryAdded" && message.params.entry.level === "error") errors.push(message.params.entry.text.slice(0, 200));
    if (message.method === "Runtime.consoleAPICalled" && (message.params.type === "error" || message.params.type === "warning")) {
      errors.push(`${message.params.type}: ${message.params.args.map((a) => a.value || a.description || "").join(" ").slice(0, 200)}`);
    }
    if (message.method === "Network.loadingFailed") failed.push(message.params.errorText);
    if (message.method === "Network.responseReceived" && message.params.response.status >= 400) failed.push(`${message.params.response.status} ${message.params.response.url.slice(-80)}`);
  });
  const send = (method, params = {}) =>
    new Promise((resolve) => {
      const id = nextId++;
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  const ev = async (expression) => {
    const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(`in page: ${(result.exceptionDetails.exception?.description || result.exceptionDetails.text).slice(0, 300)}`);
    return result.result?.value;
  };
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Log.enable");
  await send("Network.enable");
  if (downloadPath) await send("Browser.setDownloadBehavior", { behavior: "allow", downloadPath, eventsEnabled: true });

  const go = async (url, wait = 2500) => {
    await send("Page.navigate", { url });
    await sleep(wait);
  };
  /** Waits until the expression is truthy, up to `ms`. */
  const until = async (expression, ms = 8000) => {
    const started = Date.now();
    while (Date.now() - started < ms) {
      if (await ev(expression)) return true;
      await sleep(150);
    }
    return false;
  };
  /**
   * Clicks the centre of an element found by a JavaScript expression, as a
   * real pointer would. The scroll is instant on purpose: the site scrolls
   * smoothly, and a rectangle measured mid-scroll sends the click to whatever
   * slides into that spot.
   */
  const click = async (expression) => {
    const measure = () => ev(`(()=>{const e=${expression};if(!e)return null;e.scrollIntoView({block:'center',behavior:'instant'});const r=e.getBoundingClientRect();return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};})()`);
    // Panels slide and lists stagger in; a click aimed at a moving element
    // misses. Wait until two measurements agree before pressing.
    let box = await measure();
    if (!box) return false;
    for (let i = 0; i < 8; i++) {
      await sleep(120);
      const again = await measure();
      if (!again) return false;
      if (again.x === box.x && again.y === box.y) break;
      box = again;
    }
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: box.x, y: box.y });
    await send("Input.dispatchMouseEvent", { type: "mousePressed", x: box.x, y: box.y, button: "left", clickCount: 1 });
    await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: box.x, y: box.y, button: "left", clickCount: 1 });
    await sleep(300);
    return true;
  };
  const KEYS = { Escape: 27, ArrowRight: 39, ArrowLeft: 37, ArrowDown: 40, ArrowUp: 38, Enter: 13, Tab: 9, Space: 32 };
  const key = async (name, modifiers = 0) => {
    const code = KEYS[name];
    await send("Input.dispatchKeyEvent", { type: "keyDown", key: name === "Space" ? " " : name, code: name, windowsVirtualKeyCode: code, modifiers });
    await send("Input.dispatchKeyEvent", { type: "keyUp", key: name === "Space" ? " " : name, code: name, windowsVirtualKeyCode: code, modifiers });
    await sleep(250);
  };
  const type = async (text) => {
    for (const ch of text) {
      await send("Input.insertText", { text: ch });
      await sleep(30);
    }
  };
  /** Sets a React-controlled input's value the way typing would. */
  const fill = (selector, value) =>
    ev(`(()=>{const i=document.querySelector(${JSON.stringify(selector)});if(!i)return 'missing ${selector}';const proto=i.tagName==='SELECT'?HTMLSelectElement.prototype:i.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(i,${JSON.stringify(value)});i.dispatchEvent(new Event('input',{bubbles:true}));i.dispatchEvent(new Event('change',{bubbles:true}));return 'ok';})()`);
  const viewport = async ({ width: w, height: h, mobile = false } = {}) => {
    if (!w) return send("Emulation.clearDeviceMetricsOverride");
    return send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile });
  };
  const shot = async (file, { full = false, quality = 60 } = {}) => {
    let clip;
    if (full) {
      const metrics = await send("Page.getLayoutMetrics");
      const h = Math.min(Math.ceil(metrics.cssContentSize.height), 12000);
      clip = { x: 0, y: 0, width: metrics.cssLayoutViewport.clientWidth, height: h, scale: 1 };
    }
    const data = await send("Page.captureScreenshot", { format: file.endsWith(".png") ? "png" : "jpeg", ...(file.endsWith(".png") ? {} : { quality }), ...(clip ? { clip, captureBeyondViewport: true } : {}) });
    writeFileSync(file, Buffer.from(data.data, "base64"));
  };
  const drain = () => {
    const out = [...errors, ...failed];
    errors.length = 0;
    failed.length = 0;
    return out;
  };
  const close = () => {
    ws.close();
    chrome.kill();
  };
  /** The raw DevTools socket, for scripts that need to listen to events the driver does not surface. */
  const socket = async () => ws;
  return { send, ev, go, until, click, key, type, fill, viewport, shot, sleep, drain, close, socket };
}
