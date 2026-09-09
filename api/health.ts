import type { VercelRequest, VercelResponse } from "@vercel/node";
import { query } from "../db/client.js";

/** Liveness plus a real round trip to Neon, so a bad DATABASE_URL is obvious. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
  // A health check that could be served from a cache would not be one.
  res.setHeader("Cache-Control", "no-store");
  try {
    const rows = await query<{ now: string }>("select now() as now");
    return res.status(200).json({ status: "ok", database: "connected", time: rows[0]?.now });
  } catch (error) {
    console.error("health", error);
    return res.status(503).json({ status: "degraded", database: "unreachable" });
  }
}
