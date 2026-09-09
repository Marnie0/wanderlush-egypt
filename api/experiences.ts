import type { VercelRequest, VercelResponse } from "@vercel/node";
import { query } from "../db/client.js";

/**
 * GET /api/experiences
 *   ?slug=            one experience
 *   ?destination=     filter by destination slug
 *   ?category=        filter by category
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { slug, destination, category } = req.query;

  try {
    if (typeof slug === "string") {
      const rows = await query("select * from experiences where slug = $1", [slug]);
      if (rows.length === 0) return res.status(404).json({ error: "Experience not found" });
      res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
      return res.status(200).json(rows[0]);
    }

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (typeof destination === "string") {
      params.push(destination);
      conditions.push(`destination_slug = $${params.length}`);
    }
    if (typeof category === "string") {
      params.push(category);
      conditions.push(`category = $${params.length}`);
    }

    const where = conditions.length ? `where ${conditions.join(" and ")}` : "";
    const rows = await query(
      `select * from experiences ${where} order by price_from asc`,
      params,
    );

    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    return res.status(200).json(rows);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to load experiences",
      message: error instanceof Error ? error.message : "unknown error",
    });
  }
}
