/**
 * Serves the production build with the API routes attached, the way Vercel
 * does, so the booking journey can be exercised end to end on this machine
 * against the real database.
 *
 *   npm run build && npx tsx scripts/serve-local.mjs [port]
 *
 * Reads DATABASE_URL from .env.local. Not used in deployment.
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { config } from "dotenv";

config({ path: ".env.local" });

const port = Number(process.argv[2] ?? 4174);
const dist = "dist";
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".webp": "image/webp", ".svg": "image/svg+xml", ".json": "application/json", ".woff2": "font/woff2", ".txt": "text/plain", ".xml": "application/xml", ".png": "image/png", ".ico": "image/x-icon" };
const routes = {
  "/api/requests": () => import("../api/requests.ts"),
  "/api/health": () => import("../api/health.ts"),
  "/api/destinations": () => import("../api/destinations.ts"),
  "/api/experiences": () => import("../api/experiences.ts"),
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${port}`);
  const load = routes[url.pathname];
  if (load) {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const raw = Buffer.concat(chunks).toString("utf8");
    let body = raw;
    if (raw && (req.headers["content-type"] ?? "").includes("application/json")) {
      try {
        body = JSON.parse(raw);
      } catch {
        body = raw;
      }
    }
    const vreq = Object.assign(req, { query: Object.fromEntries(url.searchParams), body, cookies: {} });
    const vres = Object.assign(res, {
      status(code) {
        res.statusCode = code;
        return vres;
      },
      json(value) {
        res.setHeader("content-type", "application/json");
        res.end(JSON.stringify(value));
        return vres;
      },
      send(value) {
        res.end(typeof value === "string" ? value : JSON.stringify(value));
        return vres;
      },
    });
    const { default: handler } = await load();
    try {
      await handler(vreq, vres);
    } catch (error) {
      console.error(error);
      if (!res.headersSent) vres.status(500).json({ error: "handler failed" });
    }
    return;
  }
  let path = normalize(join(dist, url.pathname));
  try {
    const info = await stat(path);
    if (info.isDirectory()) path = join(path, "index.html");
    await stat(path);
  } catch {
    path = join(dist, "index.html");
  }
  res.setHeader("content-type", types[extname(path)] ?? "application/octet-stream");
  res.end(await readFile(path));
});

server.listen(port, () => console.log(`serving ${dist} with API on http://localhost:${port}`));
