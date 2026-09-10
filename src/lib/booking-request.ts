import type { TripEstimate } from "./estimate";
import type { TripState } from "./trip-store";
import { clipText, LIMITS, type Preferences, type RequestEstimate, type RequestTrip } from "../../shared/booking";

/**
 * The trip as it is sent: places, experiences and notes per day, party,
 * options. Ids and drag state stay behind; a specialist reads this, nobody
 * rebuilds an itinerary from it.
 */
export function snapshotTrip(
  trip: Pick<TripState, "startDate" | "month" | "durationDays" | "adults" | "children" | "tier" | "tourStyle" | "serviceIncluded" | "currency" | "interests" | "days">,
): RequestTrip {
  return {
    startDate: trip.startDate,
    month: trip.month,
    durationDays: trip.durationDays,
    adults: trip.adults,
    children: trip.children,
    tier: trip.tier,
    tourStyle: trip.tourStyle,
    serviceIncluded: trip.serviceIncluded,
    currency: trip.currency,
    interests: [...trip.interests],
    days: trip.days.map((day) => ({
      destinationSlug: day.destinationSlug,
      experienceSlugs: day.items.flatMap((item) => (item.kind === "experience" && item.experienceSlug ? [item.experienceSlug] : [])),
      // Clipped here, so the review shows exactly what the server will keep.
      notes: day.items.flatMap((item) => {
        const note = item.kind !== "experience" && item.note ? clipText(item.note, LIMITS.dayNote) : "";
        return note ? [note] : [];
      }),
    })),
  };
}

export function snapshotEstimate(estimate: TripEstimate): RequestEstimate {
  return {
    accommodation: estimate.accommodation,
    experiences: estimate.experiences,
    transport: estimate.transport,
    serviceFee: estimate.serviceFee,
    subtotal: estimate.subtotal,
    total: estimate.total,
    perPerson: estimate.perPerson,
  };
}

const displayNames = new Map<string, Intl.DisplayNames | null>();
const collators = new Map<string, Intl.Collator>();

/** Region names in the visitor's language, without a translated list of our own. One formatter per language. */
export function countryName(code: string, language: string): string {
  const tag = language.startsWith("ar") ? "ar" : "en";
  if (!displayNames.has(tag)) {
    try {
      displayNames.set(tag, new Intl.DisplayNames([tag], { type: "region" }));
    } catch {
      displayNames.set(tag, null);
    }
  }
  try {
    return displayNames.get(tag)?.of(code) ?? code;
  } catch {
    return code;
  }
}

export function countryCollator(language: string): Intl.Collator {
  const tag = language.startsWith("ar") ? "ar" : "en";
  let collator = collators.get(tag);
  if (!collator) {
    collator = new Intl.Collator(tag);
    collators.set(tag, collator);
  }
  return collator;
}

/** Only what was filled in, as label and value pairs. */
export function preferenceSummary(preferences: Preferences, t: (key: string) => string): { label: string; value: string }[] {
  const lines: { label: string; value: string }[] = [];
  if (preferences.dietary.length > 0) {
    lines.push({ label: t("booking.preferences.dietary"), value: preferences.dietary.map((d) => t(`booking.preferences.dietaryOptions.${d}`)).join(t("common.listSeparator")) });
  }
  if (preferences.dietaryNotes.trim()) lines.push({ label: t("booking.preferences.dietaryNotes"), value: preferences.dietaryNotes.trim() });
  if (preferences.accessibility.trim()) lines.push({ label: t("booking.preferences.accessibility"), value: preferences.accessibility.trim() });
  if (preferences.roomType) lines.push({ label: t("booking.preferences.room"), value: t(`booking.preferences.roomTypes.${preferences.roomType}`) });
  if (preferences.roomNotes.trim()) lines.push({ label: t("booking.preferences.roomNotes"), value: preferences.roomNotes.trim() });
  if (preferences.airportTransfer) {
    lines.push({ label: t("booking.preferences.airportTransfer"), value: t(preferences.airportTransfer === "yes" ? "booking.preferences.transferYes" : "booking.preferences.transferNo") });
  }
  if (preferences.occasion !== "none") {
    lines.push({
      label: t("booking.preferences.occasion"),
      value: [t(`booking.preferences.occasions.${preferences.occasion}`), preferences.occasionNotes.trim()].filter(Boolean).join(": "),
    });
  }
  if (preferences.additionalRequests.trim()) lines.push({ label: t("booking.preferences.additional"), value: preferences.additionalRequests.trim() });
  return lines;
}
