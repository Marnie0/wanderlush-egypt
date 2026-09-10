import type { VercelRequest, VercelResponse } from "@vercel/node";
import { query } from "../db/client.js";
import { parseContactPayload, CONTACT_LIMITS } from "../shared/contact.js";
import { clientAddress, makeLimiter } from "../shared/rate-limit.js";

/**
 * POST /api/contact → stores a message for a specialist, returns when it arrived.
 *
 * The contact form's other half. Validation is the same code the form runs
 * (`shared/contact.ts`); a message that passed in the browser passes here.
 * Nothing is read back: a message has no reference and no receipt page,
 * the reply comes by email.
 */
const tooMany = makeLimiter();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (tooMany(clientAddress(req))) {
    res.setHeader("Retry-After", "600");
    return res.status(429).json({ error: "Too many requests" });
  }
  if (JSON.stringify(req.body ?? "").length > CONTACT_LIMITS.payloadBytes) {
    return res.status(413).json({ error: "Request too large" });
  }
  const parsed = parseContactPayload(req.body);
  if ("error" in parsed) {
    // A filled honeypot gets the same answer as success and is stored nowhere.
    if (parsed.error === "spam") {
      console.warn("contact.create honeypot");
      return res.status(201).json({ createdAt: new Date().toISOString() });
    }
    return res.status(400).json({ error: "Invalid message", field: parsed.error });
  }
  const { language, message } = parsed.payload;
  try {
    const rows = await query<{ created_at: string }>(
      `insert into contact_messages (language, full_name, email, booking_reference, message)
       values ($1, $2, $3, $4, $5) returning created_at`,
      [language, message.fullName, message.email, message.reference || null, message.message],
    );
    return res.status(201).json({ createdAt: rows[0]?.created_at ?? new Date().toISOString() });
  } catch (error) {
    console.error("contact.create", error);
    return res.status(500).json({ error: "Could not save the message" });
  }
}
