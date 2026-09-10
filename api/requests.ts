import type { VercelRequest, VercelResponse } from "@vercel/node";
import { query } from "../db/client.js";
import { countryCodes } from "../content/countries.js";
import { currencies } from "../content/currencies.js";
import { accommodationLevels } from "../content/accommodation.js";
import {
  firstNameOf,
  isReference,
  makeReference,
  parsePayload,
  LIMITS,
  type BookingRecord,
  type RequestEstimate,
  type RequestTrip,
} from "../shared/booking.js";

/**
 * POST /api/requests       → stores a booking request, returns its reference
 * GET  /api/requests?ref=  → the request behind a reference, without contact details
 *
 * A request is an inquiry, not a payment: the row is what a specialist picks
 * up. Validation is the same code the form runs (`shared/booking.ts`), so a
 * request that passed in the browser passes here, and one sent by hand is
 * held to the same rules.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "POST") return create(req, res);
  if (req.method === "GET") return read(req, res);
  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed" });
}

interface RequestRow extends Record<string, unknown> {
  reference: string;
  created_at: string;
  status: string;
  language: string;
  full_name: string;
  itinerary: RequestTrip;
  estimate: RequestEstimate;
}

/**
 * A best-effort brake on one address sending request after request. Memory
 * lives as long as the container, which is enough to blunt a loop and no
 * substitute for edge rate limiting on a real deployment.
 */
const WINDOW_MS = 10 * 60 * 1000;
const WINDOW_LIMIT = 8;
const recent = new Map<string, number[]>();
function tooMany(address: string): boolean {
  const now = Date.now();
  const stamps = (recent.get(address) ?? []).filter((at) => now - at < WINDOW_MS);
  stamps.push(now);
  recent.set(address, stamps);
  if (recent.size > 5000) recent.clear();
  return stamps.length > WINDOW_LIMIT;
}

function clientAddress(req: VercelRequest): string {
  const forwarded = req.headers["x-forwarded-for"];
  const first = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(",")[0]?.trim();
  return first || req.socket?.remoteAddress || "unknown";
}

async function create(req: VercelRequest, res: VercelResponse) {
  if (tooMany(clientAddress(req))) {
    res.setHeader("Retry-After", String(WINDOW_MS / 1000));
    return res.status(429).json({ error: "Too many requests" });
  }
  if (JSON.stringify(req.body ?? "").length > LIMITS.payloadBytes) {
    return res.status(413).json({ error: "Request too large" });
  }
  const parsed = parsePayload(req.body, countryCodes, currencyCodes);
  if ("error" in parsed) {
    // A filled honeypot gets the same answer as success: nothing to learn from
    // it. Counted in the log, without the body, so a false-positive rate shows.
    if (parsed.error === "spam") {
      console.warn("requests.create honeypot");
      return res.status(201).json({ reference: makeReference(), createdAt: new Date().toISOString() });
    }
    return res.status(400).json({ error: "Invalid request", field: parsed.error });
  }
  const { traveller, preferences, trip, estimate, language } = parsed.payload;
  const endDate = trip.startDate ? addDays(trip.startDate, trip.days.length - 1) : null;

  // The reference is the primary key; on the rare collision, draw another.
  for (let attempt = 0; attempt < 5; attempt++) {
    const reference = makeReference();
    try {
      const rows = await query<{ created_at: string }>(
        `insert into booking_requests (
           reference, language, full_name, email, phone, country, preferred_contact,
           travellers_adults, travellers_children, start_date, end_date, accommodation_tier,
           currency, estimate_total_usd, itinerary, preferences, estimate, tour_style, service_included
         ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
         returning created_at`,
        [
          reference, language, traveller.fullName, traveller.email, traveller.phone, traveller.country,
          traveller.contactMethod, trip.adults, trip.children, trip.startDate, endDate, trip.tier,
          trip.currency, estimate.total, JSON.stringify(trip), JSON.stringify(preferences), JSON.stringify(estimate),
          trip.tourStyle, trip.serviceIncluded,
        ],
      );
      return res.status(201).json({ reference, createdAt: rows[0]?.created_at ?? new Date().toISOString() });
    } catch (error) {
      if (isUniqueViolation(error)) continue;
      if (isForeignKeyViolation(error)) {
        // A known tier that the database does not know means the levels were
        // never seeded: our problem, not the traveller's.
        if (knownTiers.has(trip.tier)) {
          console.error("requests.create accommodation_levels not seeded", error);
          return res.status(500).json({ error: "Could not save the request" });
        }
        return res.status(400).json({ error: "Invalid request", field: "trip" });
      }
      console.error("requests.create", error);
      return res.status(500).json({ error: "Could not save the request" });
    }
  }
  return res.status(500).json({ error: "Could not save the request" });
}

async function read(req: VercelRequest, res: VercelResponse) {
  const reference = typeof req.query.ref === "string" ? req.query.ref.toUpperCase() : "";
  if (!isReference(reference)) return res.status(400).json({ error: "Invalid reference" });
  try {
    const rows = await query<RequestRow>(
      "select reference, created_at, status, language, full_name, itinerary, estimate from booking_requests where reference = $1",
      [reference],
    );
    const row = rows[0];
    if (!row) return res.status(404).json({ error: "Request not found" });
    const record: BookingRecord = {
      reference: row.reference,
      createdAt: new Date(row.created_at).toISOString(),
      status: row.status,
      language: row.language,
      firstName: firstNameOf(row.full_name),
      trip: row.itinerary,
      estimate: row.estimate,
    };
    return res.status(200).json(record);
  } catch (error) {
    console.error("requests.read", error);
    return res.status(500).json({ error: "Could not load the request" });
  }
}

function addDays(iso: string, days: number): string {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

const currencyCodes = currencies.map((currency) => currency.code);
const knownTiers = new Set<string>(accommodationLevels.map((level) => level.id));

const pgCode = (error: unknown) => (error as { code?: string } | null)?.code;
const isUniqueViolation = (error: unknown) => pgCode(error) === "23505";
const isForeignKeyViolation = (error: unknown) => pgCode(error) === "23503";
