/**
 * The booking request: its shape, its validation and its reference format.
 * Shared by the form in the browser and the API route on the server, so the
 * two can never disagree about what a valid request is. No DOM, no Node.
 */

export const CONTACT_METHODS = ["email", "phone", "whatsapp"] as const;
export type ContactMethod = (typeof CONTACT_METHODS)[number];

export const ROOM_TYPES = ["double", "twin", "single", "family", "connecting"] as const;
export type RoomType = (typeof ROOM_TYPES)[number];

export const OCCASIONS = ["none", "honeymoon", "anniversary", "birthday", "retirement", "graduation", "other"] as const;
export type Occasion = (typeof OCCASIONS)[number];

export const DIETARY_OPTIONS = ["vegetarian", "vegan", "halal", "kosher", "glutenFree", "dairyFree", "nutAllergy", "other"] as const;
export type DietaryOption = (typeof DIETARY_OPTIONS)[number];

export interface TravellerDetails {
  fullName: string;
  email: string;
  phone: string;
  /** ISO 3166-1 alpha-2 code, upper case. */
  country: string;
  contactMethod: ContactMethod;
}

export interface Preferences {
  dietary: DietaryOption[];
  dietaryNotes: string;
  accessibility: string;
  roomType: RoomType | "";
  roomNotes: string;
  airportTransfer: "yes" | "no" | "";
  occasion: Occasion;
  occasionNotes: string;
  additionalRequests: string;
}

/** One day of the itinerary as it is sent: enough to read, not to rebuild. */
export interface RequestDay {
  destinationSlug: string;
  experienceSlugs: string[];
  notes: string[];
}

export interface RequestTrip {
  startDate: string | null;
  month: string | null;
  durationDays: number;
  adults: number;
  children: number;
  tier: string;
  tourStyle: "shared" | "private";
  serviceIncluded: boolean;
  currency: string;
  interests: string[];
  days: RequestDay[];
}

/** The estimate as it stood when the request was sent, all USD. */
export interface RequestEstimate {
  accommodation: number;
  experiences: number;
  transport: number;
  serviceFee: number;
  subtotal: number;
  total: number;
  perPerson: number;
}

export interface BookingPayload {
  language: string;
  traveller: TravellerDetails;
  preferences: Preferences;
  trip: RequestTrip;
  estimate: RequestEstimate;
  /** Left empty by people; filled by the kind of script that fills every field. */
  wl_extra?: string;
}

/** What the confirmation page shows, and what the API returns for a reference. */
export interface BookingRecord {
  reference: string;
  createdAt: string;
  status: string;
  language: string;
  firstName: string;
  trip: RequestTrip;
  estimate: RequestEstimate;
}

export const emptyDetails: TravellerDetails = {
  fullName: "",
  email: "",
  phone: "",
  country: "",
  contactMethod: "email",
};

export const emptyPreferences: Preferences = {
  dietary: [],
  dietaryNotes: "",
  accessibility: "",
  roomType: "",
  roomNotes: "",
  airportTransfer: "",
  occasion: "none",
  occasionNotes: "",
  additionalRequests: "",
};

export const LIMITS = {
  name: 120,
  email: 254,
  phone: 30,
  note: 1000,
  /** A free-time or transfer note on one itinerary day. */
  dayNote: 200,
  days: 60,
  itemsPerDay: 12,
  payloadBytes: 60_000,
} as const;

export type DetailsErrorKey = "required" | "tooLong" | "email" | "phone" | "country" | "contact";
export type DetailsErrors = Partial<Record<keyof TravellerDetails, DetailsErrorKey>>;

/** Plain, generous and not a spec: a dot after the at sign is the whole test. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Arabic-Indic and Persian digits become ASCII, so a phone typed on an Arabic keyboard counts. */
export function normalizeDigits(value: string): string {
  return value
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06f0-\u06f9]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}

/**
 * A phone number is digits, with the usual punctuation people type around
 * them. Between seven and fifteen digits is every national plan on earth.
 */
export function phoneDigits(value: string): string {
  return normalizeDigits(value).replace(/\D/g, "");
}

/**
 * Trims, drops control characters the database would refuse, and cuts by
 * code point rather than code unit, so a limit never splits an emoji into a
 * lone surrogate that no JSON column accepts.
 */
export function clipText(value: string, max: number): string {
  // eslint-disable-next-line no-control-regex
  const clean = value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim();
  return Array.from(clean).slice(0, max).join("");
}

export function validateDetails(details: TravellerDetails, countries: readonly string[]): DetailsErrors {
  const errors: DetailsErrors = {};
  const name = details.fullName.trim();
  if (!name) errors.fullName = "required";
  else if (name.length > LIMITS.name) errors.fullName = "tooLong";

  const email = details.email.trim();
  if (!email) errors.email = "required";
  else if (email.length > LIMITS.email || !EMAIL.test(email)) errors.email = "email";

  const phone = normalizeDigits(details.phone.trim());
  const digits = phoneDigits(phone);
  if (!phone) errors.phone = "required";
  else if (phone.length > LIMITS.phone || digits.length < 7 || digits.length > 15 || !/^[+\d\s().-]+$/.test(phone)) errors.phone = "phone";

  if (!details.country) errors.country = "required";
  else if (!countries.includes(details.country)) errors.country = "country";

  if (!CONTACT_METHODS.includes(details.contactMethod)) errors.contactMethod = "contact";
  return errors;
}

const REFERENCE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const REFERENCE_PATTERN = /^WL-[A-Z2-9]{4}-[A-Z2-9]{4}$/;

/** "WL-K7M2-P9XA": no zero, one, I or O, so nobody misreads it over the phone. */
export function makeReference(random: () => number = Math.random): string {
  const pick = () => REFERENCE_ALPHABET[Math.floor(random() * REFERENCE_ALPHABET.length)];
  const block = () => Array.from({ length: 4 }, pick).join("");
  return `WL-${block()}-${block()}`;
}

export function isReference(value: unknown): value is string {
  return typeof value === "string" && REFERENCE_PATTERN.test(value);
}

/** What the traveller is called on the confirmation and in the reply. */
export function firstNameOf(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? "";
}

const isString = (value: unknown): value is string => typeof value === "string";
const isInt = (value: unknown, min: number, max: number): value is number =>
  typeof value === "number" && Number.isInteger(value) && value >= min && value <= max;
const isMoney = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value) && value >= 0 && value < 10_000_000;
const clip = (value: unknown, max: number): string => (isString(value) ? clipText(value, max) : "");
export const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"] as const;
/** A real calendar date, not just the shape of one: "2026-02-30" fails. */
export function isIsoDate(value: unknown): value is string {
  if (!isString(value) || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}
const oneOf = <T extends string>(value: unknown, options: readonly T[], fallback: T): T =>
  isString(value) && (options as readonly string[]).includes(value) ? (value as T) : fallback;

/**
 * Turns an untrusted body into a payload or a reason it is not one. Strings
 * are clipped rather than rejected: a long note is a note, not an attack.
 */
export function parsePayload(
  body: unknown,
  countries: readonly string[],
  currencies: readonly string[] = ["USD"],
): { payload: BookingPayload } | { error: string } {
  if (!body || typeof body !== "object") return { error: "body" };
  const raw = body as Record<string, unknown>;
  if (isString(raw.wl_extra) && raw.wl_extra.trim() !== "") return { error: "spam" };

  const t = (raw.traveller ?? {}) as Record<string, unknown>;
  const traveller: TravellerDetails = {
    fullName: clip(t.fullName, LIMITS.name),
    email: clip(t.email, LIMITS.email),
    phone: normalizeDigits(clip(t.phone, LIMITS.phone)),
    country: isString(t.country) ? t.country.toUpperCase().slice(0, 2) : "",
    contactMethod: oneOf(t.contactMethod, CONTACT_METHODS, "email"),
  };
  const errors = validateDetails(traveller, countries);
  if (Object.keys(errors).length > 0) return { error: "traveller" };

  const p = (raw.preferences ?? {}) as Record<string, unknown>;
  const preferences: Preferences = {
    dietary: Array.isArray(p.dietary) ? p.dietary.filter((d): d is DietaryOption => isString(d) && (DIETARY_OPTIONS as readonly string[]).includes(d)) : [],
    dietaryNotes: clip(p.dietaryNotes, LIMITS.note),
    accessibility: clip(p.accessibility, LIMITS.note),
    roomType: oneOf(p.roomType, [...ROOM_TYPES, ""] as const, ""),
    roomNotes: clip(p.roomNotes, LIMITS.note),
    airportTransfer: oneOf(p.airportTransfer, ["yes", "no", ""] as const, ""),
    occasion: oneOf(p.occasion, OCCASIONS, "none"),
    occasionNotes: clip(p.occasionNotes, LIMITS.note),
    additionalRequests: clip(p.additionalRequests, LIMITS.note * 2),
  };

  const tr = (raw.trip ?? {}) as Record<string, unknown>;
  if (!Array.isArray(tr.days) || tr.days.length === 0 || tr.days.length > LIMITS.days) return { error: "trip" };
  const days: RequestDay[] = [];
  for (const day of tr.days as unknown[]) {
    const d = (day ?? {}) as Record<string, unknown>;
    if (!isString(d.destinationSlug) || !/^[a-z0-9-]{1,60}$/.test(d.destinationSlug)) return { error: "trip" };
    const experienceSlugs = Array.isArray(d.experienceSlugs)
      ? d.experienceSlugs.filter((s): s is string => isString(s) && /^[a-z0-9-]{1,80}$/.test(s)).slice(0, LIMITS.itemsPerDay)
      : [];
    const notes = Array.isArray(d.notes) ? d.notes.filter(isString).map((n) => clipText(n, LIMITS.dayNote)).filter(Boolean).slice(0, LIMITS.itemsPerDay) : [];
    days.push({ destinationSlug: d.destinationSlug, experienceSlugs, notes });
  }
  const startDate = isIsoDate(tr.startDate) ? tr.startDate : null;
  if (!isInt(tr.durationDays, 1, LIMITS.days) || !isInt(tr.adults, 1, 40) || !isInt(tr.children, 0, 40)) return { error: "trip" };
  const trip: RequestTrip = {
    startDate,
    month: isString(tr.month) && (MONTHS as readonly string[]).includes(tr.month) ? tr.month : null,
    durationDays: tr.durationDays,
    adults: tr.adults,
    children: tr.children,
    tier: clip(tr.tier, 20) || "comfort",
    tourStyle: oneOf(tr.tourStyle, ["shared", "private"] as const, "shared"),
    serviceIncluded: tr.serviceIncluded !== false,
    currency: isString(tr.currency) && currencies.includes(tr.currency) ? tr.currency : "USD",
    interests: Array.isArray(tr.interests) ? tr.interests.filter((i): i is string => isString(i) && /^[a-z]{1,20}$/.test(i)).slice(0, 12) : [],
    days,
  };

  const e = (raw.estimate ?? {}) as Record<string, unknown>;
  const fields = ["accommodation", "experiences", "transport", "serviceFee", "subtotal", "total", "perPerson"] as const;
  const estimate = {} as RequestEstimate;
  for (const field of fields) {
    if (!isMoney(e[field])) return { error: "estimate" };
    estimate[field] = Math.round(e[field] as number);
  }

  return {
    payload: {
      language: isString(raw.language) && raw.language.startsWith("ar") ? "ar" : "en",
      traveller,
      preferences,
      trip,
      estimate,
    },
  };
}
