import { destinationBySlug } from "@content/destinations";
import { experienceBySlug } from "@content/experiences";
import type { AccommodationTierId, Experience } from "@content/types";
import { findRoute } from "./transport";
import { stopsFromDays, type TripDay } from "./trip-plan";

/**
 * The pricing rules, in one place. `docs/pricing.md` says the same thing in
 * prose, with a worked example; keep the two together when either changes.
 */

/** Planning and on-the-ground support, on everything except accommodation. */
export const SERVICE_FEE_RATE = 0.08;
/** Two to a room; a lone traveller still needs a room. */
export const GUESTS_PER_ROOM = 2;
/** A child pays this share of an adult's price on an experience. */
export const CHILD_RATE = 0.5;
/** "Children" on this site are under twelve. */
export const CHILD_MAX_AGE = 11;
/** An experience this long sleeps its guests: a cruise cabin, a desert camp. */
const OVERNIGHT_MINUTES = 20 * 60;

export type TourStyle = "shared" | "private";
export const TOUR_STYLES: TourStyle[] = ["shared", "private"];

/**
 * How many nights an experience sleeps its guests: a four-day cruise is
 * three nights, an overnight camp one. Zero for anything shorter than a night.
 */
export function nightsCoveredBy(experience: Experience): number {
  if (experience.durationMinutes < OVERNIGHT_MINUTES) return 0;
  return Math.max(1, Math.ceil(experience.durationMinutes / (24 * 60)) - 1);
}

/**
 * The indices of days whose night is already covered by something on the
 * itinerary, so no hotel is charged for them. A cruise placed on day 2 of a
 * six-day trip covers the nights of days 2, 3 and 4.
 */
export function coveredNights(days: TripDay[]): Set<number> {
  const covered = new Set<number>();
  days.forEach((day, index) => {
    for (const item of day.items) {
      const experience = item.experienceSlug ? experienceBySlug.get(item.experienceSlug) : undefined;
      if (!experience) continue;
      for (let n = 0; n < nightsCoveredBy(experience); n++) covered.add(index + n);
    }
  });
  return covered;
}

/** Whether a child can come along, so whether one is charged. */
export function childCanJoin(experience: Experience): boolean {
  return experience.minAge === null || experience.minAge <= CHILD_MAX_AGE;
}

/** Whether choosing private tours changes this experience at all. */
export function canBePrivate(experience: Experience): boolean {
  return experience.groupFormat.includes("private") && experience.privateSupplement > 0;
}

/** USD per adult for one experience in the chosen style. */
export function experiencePrice(experience: Experience, tourStyle: TourStyle): number {
  return experience.priceFrom + (tourStyle === "private" && canBePrivate(experience) ? experience.privateSupplement : 0);
}

export interface DayEstimate {
  accommodation: number;
  experiences: number;
  transport: number;
  total: number;
}

export interface TripEstimate {
  days: DayEstimate[];
  accommodation: number;
  experiences: number;
  transport: number;
  /** Everything before the fee. */
  subtotal: number;
  serviceFee: number;
  total: number;
  /** Total divided equally among everyone travelling. */
  perPerson: number;
  /** What an adult, and a child, actually account for; see `docs/pricing.md`. */
  perAdult: number;
  perChild: number;
  travellers: number;
  adults: number;
  children: number;
  rooms: number;
  /** Nights a hotel is charged for. */
  nights: number;
  experienceCount: number;
  /** Experiences priced privately, when private tours are chosen. */
  privateCount: number;
  /** Experiences that only run as shared departures, when private tours are chosen. */
  sharedOnlyCount: number;
  /** Experiences with a minimum age above a child's, so not charged for children. */
  childFreeCount: number;
  transferCount: number;
  tourStyle: TourStyle;
  serviceIncluded: boolean;
}

export interface EstimateInput {
  days: TripDay[];
  tier: AccommodationTierId;
  adults: number;
  children: number;
  tourStyle?: TourStyle;
  serviceIncluded?: boolean;
}

/**
 * All figures USD. Every night but the last is charged at the destination's
 * rate for the chosen tier, unless a cruise or camp already sleeps its guests
 * that night;
 * every experience per traveller, children at half and not at all where the
 * minimum age rules them out, with the private supplement when private tours
 * are chosen and the experience offers them; every change of place at the
 * quickest transfer, per traveller; then the fee on everything but the hotel.
 */
export function estimateTrip({
  days,
  tier,
  adults,
  children,
  tourStyle = "shared",
  serviceIncluded = true,
}: EstimateInput): TripEstimate {
  const safeAdults = Math.max(1, adults);
  const safeChildren = Math.max(0, children);
  const travellers = safeAdults + safeChildren;
  const rooms = Math.max(1, Math.ceil(travellers / GUESTS_PER_ROOM));
  const stops = stopsFromDays(days);
  const covered = coveredNights(days);
  const transferDays = new Map<number, number>();
  for (let i = 1; i < stops.length; i++) {
    const route = findRoute(stops[i - 1].destinationSlug, stops[i].destinationSlug);
    if (route) transferDays.set(stops[i].firstDayIndex, route.priceFrom * travellers);
  }

  let nights = 0;
  let experienceCount = 0;
  let privateCount = 0;
  let sharedOnlyCount = 0;
  let childFreeCount = 0;
  let adultExperiences = 0;
  let childExperiences = 0;

  const perDay = days.map((day, index): DayEstimate => {
    const destination = destinationBySlug.get(day.destinationSlug);
    const lastDay = index === days.length - 1;
    const charged = !lastDay && !covered.has(index);
    if (charged) nights += 1;
    const accommodation = charged ? (destination?.nightlyRates[tier] ?? 0) * rooms : 0;
    let experiences = 0;
    for (const item of day.items) {
      const experience = item.experienceSlug ? experienceBySlug.get(item.experienceSlug) : undefined;
      if (!experience) continue;
      experienceCount += 1;
      if (tourStyle === "private") {
        if (canBePrivate(experience)) privateCount += 1;
        else if (!experience.groupFormat.includes("private")) sharedOnlyCount += 1;
      }
      const adultPrice = experiencePrice(experience, tourStyle);
      const forAdults = adultPrice * safeAdults;
      let forChildren = 0;
      if (safeChildren > 0) {
        if (childCanJoin(experience)) forChildren = Math.round(adultPrice * CHILD_RATE) * safeChildren;
        else childFreeCount += 1;
      }
      adultExperiences += forAdults;
      childExperiences += forChildren;
      experiences += forAdults + forChildren;
    }
    const transport = transferDays.get(index) ?? 0;
    return { accommodation, experiences, transport, total: accommodation + experiences + transport };
  });

  const accommodation = perDay.reduce((sum, d) => sum + d.accommodation, 0);
  const experiences = perDay.reduce((sum, d) => sum + d.experiences, 0);
  const transport = perDay.reduce((sum, d) => sum + d.transport, 0);
  const subtotal = accommodation + experiences + transport;
  const serviceFee = serviceIncluded ? Math.round((experiences + transport) * SERVICE_FEE_RATE) : 0;
  const total = subtotal + serviceFee;
  // Rooms, transfers and the fee are shared equally; experiences are what
  // each person is actually charged, so an adult's figure is higher than a child's.
  const shared = (accommodation + transport + serviceFee) / travellers;
  return {
    days: perDay,
    accommodation,
    experiences,
    transport,
    subtotal,
    serviceFee,
    total,
    perPerson: Math.round(total / travellers),
    perAdult: Math.round(shared + adultExperiences / safeAdults),
    perChild: safeChildren > 0 ? Math.round(shared + childExperiences / safeChildren) : 0,
    travellers,
    adults: safeAdults,
    children: safeChildren,
    rooms,
    nights,
    experienceCount,
    privateCount,
    sharedOnlyCount,
    childFreeCount,
    transferCount: transferDays.size,
    tourStyle,
    serviceIncluded,
  };
}
