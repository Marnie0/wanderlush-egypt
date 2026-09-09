import type { VercelRequest, VercelResponse } from "@vercel/node";
import { query } from "../db/client.js";
import { rowToDestination } from "../db/rows.js";

/**
 * GET /api/destinations          → every destination
 * GET /api/destinations?slug=... → one destination
 *
 * The React app reads the bundled content modules directly today; this
 * endpoint is the same data over HTTP, ready for the phases that need it.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const slug = typeof req.query.slug === "string" ? req.query.slug : undefined;

  try {
    const rows = slug
      ? await query("select * from destinations where slug = $1", [slug])
      : await query("select * from destinations order by slug");

    if (slug && rows.length === 0) {
      return res.status(404).json({ error: "Destination not found" });
    }

    const destinations = rows.map(rowToDestination);
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    return res.status(200).json(slug ? destinations[0] : destinations);
  } catch (error) {
    // The message names the database host and role; it belongs in the log.
    console.error("destinations", error);
    return res.status(500).json({ error: "Failed to load destinations" });
  }
}
