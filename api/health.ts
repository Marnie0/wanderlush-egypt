import type { VercelRequest, VercelResponse } from "@vercel/node";
import { query } from "../db/client.js";

/** Liveness plus a real round trip to Neon, so a bad DATABASE_URL is obvious. */
export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const rows = await query<{ now: string }>("select now() as now");
    res.status(200).json({ status: "ok", database: "connected", time: rows[0]?.now });
  } catch (error) {
    res.status(503).json({
      status: "degraded",
      database: "unreachable",
      message: error instanceof Error ? error.message : "unknown error",
    });
  }
}
