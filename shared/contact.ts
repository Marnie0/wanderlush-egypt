import { clipText, isReference, LIMITS as BOOKING_LIMITS } from "./booking.js";

/**
 * A message to a specialist that is not a booking request: a question, a
 * change to a request already sent, a rough idea. Shape, limits and
 * validation, shared by the form and the API route so the two agree.
 */

export interface ContactMessage {
  fullName: string;
  email: string;
  message: string;
  /** A booking reference the message is about, when there is one. */
  reference: string;
}

export interface ContactPayload {
  language: string;
  message: ContactMessage;
  /** The honeypot: empty from people, filled by scripts. */
  wl_extra?: string;
}

export const CONTACT_LIMITS = {
  name: BOOKING_LIMITS.name,
  email: BOOKING_LIMITS.email,
  message: 2000,
  messageMin: 10,
  payloadBytes: 8_000,
} as const;

export const emptyMessage: ContactMessage = { fullName: "", email: "", message: "", reference: "" };

export type ContactErrorKey = "required" | "tooLong" | "tooShort" | "email" | "reference";
export type ContactErrors = Partial<Record<keyof ContactMessage, ContactErrorKey>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateMessage(message: ContactMessage): ContactErrors {
  const errors: ContactErrors = {};
  const name = message.fullName.trim();
  if (!name) errors.fullName = "required";
  else if (name.length > CONTACT_LIMITS.name) errors.fullName = "tooLong";

  const email = message.email.trim();
  if (!email) errors.email = "required";
  else if (email.length > CONTACT_LIMITS.email || !EMAIL.test(email)) errors.email = "email";

  const body = message.message.trim();
  if (!body) errors.message = "required";
  else if (Array.from(body).length < CONTACT_LIMITS.messageMin) errors.message = "tooShort";
  else if (Array.from(body).length > CONTACT_LIMITS.message) errors.message = "tooLong";

  const reference = message.reference.trim().toUpperCase();
  if (reference && !isReference(reference)) errors.reference = "reference";
  return errors;
}

const isString = (value: unknown): value is string => typeof value === "string";
const clip = (value: unknown, max: number): string => (isString(value) ? clipText(value, max) : "");

/** Turns an untrusted body into a payload or a reason it is not one. */
export function parseContactPayload(body: unknown): { payload: ContactPayload } | { error: "body" | "spam" | "message" } {
  if (!body || typeof body !== "object") return { error: "body" };
  const raw = body as Record<string, unknown>;
  if (isString(raw.wl_extra) && raw.wl_extra.trim() !== "") return { error: "spam" };
  const m = (raw.message ?? {}) as Record<string, unknown>;
  const message: ContactMessage = {
    fullName: clip(m.fullName, CONTACT_LIMITS.name),
    email: clip(m.email, CONTACT_LIMITS.email),
    message: clip(m.message, CONTACT_LIMITS.message),
    reference: clip(m.reference, 20).toUpperCase(),
  };
  if (Object.keys(validateMessage(message)).length > 0) return { error: "message" };
  return { payload: { language: isString(raw.language) && raw.language.startsWith("ar") ? "ar" : "en", message } };
}
