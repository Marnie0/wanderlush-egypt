import type { TripEstimate } from "./estimate";
import type { TripState } from "./trip-store";
import type { RequestEstimate, RequestTrip } from "../../shared/booking";

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
      notes: day.items.flatMap((item) => (item.kind !== "experience" && item.note?.trim() ? [item.note.trim()] : [])),
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

/** Region names in the visitor's language, without a translated list of our own. */
export function countryName(code: string, language: string): string {
  try {
    return new Intl.DisplayNames([language.startsWith("ar") ? "ar" : "en"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}
