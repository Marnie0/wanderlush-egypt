import { destinationBySlug } from "@content/destinations";
import { experienceBySlug } from "@content/experiences";
import type { AccommodationTierId } from "@content/types";
import { findRoute } from "./transport";
import { stopsFromDays, type TripDay } from "./trip-plan";

/** Planning and on-the-ground support, on everything except accommodation. */
export const SERVICE_FEE_RATE = 0.08;
/** Two to a room; a lone traveller still needs a room. */
export const GUESTS_PER_ROOM = 2;
/** An experience this long sleeps its guests: a cruise cabin, a desert camp. */
const OVERNIGHT_MINUTES = 20 * 60;

/** A trip of n days has n - 1 hotel nights; the last day is the flight home. */
export function nightsOf(days: readonly unknown[]): number {
  return Math.max(0, days.length - 1);
}

/** Whether a day's own plan covers the night, so no hotel is charged for it. */
export function dayCoversNight(day: TripDay): boolean {
  return day.items.some((item) => {
    const experience = item.experienceSlug ? experienceBySlug.get(item.experienceSlug) : undefined;
    return experience !== undefined && experience.durationMinutes >= OVERNIGHT_MINUTES;
  });
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
  serviceFee: number;
  total: number;
  perPerson: number;
  travellers: number;
  rooms: number;
}

export interface EstimateInput {
  days: TripDay[];
  tier: AccommodationTierId;
  adults: number;
  children: number;
}

/**
 * All figures USD. Every night but the last is charged at the destination's
 * rate for the chosen tier, unless that day's plan already sleeps its guests;
 * every experience at its shared price per traveller; every change of place
 * at the quickest transfer. Children are charged as adults: honest rather
 * than optimistic, and the specialist can do better.
 */
export function estimateTrip({ days, tier, adults, children }: EstimateInput): TripEstimate {
  const travellers = Math.max(1, adults + children);
  const rooms = Math.max(1, Math.ceil(travellers / GUESTS_PER_ROOM));
  const stops = stopsFromDays(days);
  const transferDays = new Map<number, number>();
  for (let i = 1; i < stops.length; i++) {
    const route = findRoute(stops[i - 1].destinationSlug, stops[i].destinationSlug);
    if (route) transferDays.set(stops[i].firstDayIndex, route.priceFrom * travellers);
  }

  const perDay = days.map((day, index): DayEstimate => {
    const destination = destinationBySlug.get(day.destinationSlug);
    const lastDay = index === days.length - 1;
    const accommodation =
      lastDay || dayCoversNight(day) ? 0 : (destination?.nightlyRates[tier] ?? 0) * rooms;
    const experiences = day.items.reduce((sum, item) => {
      const experience = item.experienceSlug ? experienceBySlug.get(item.experienceSlug) : undefined;
      return sum + (experience ? experience.priceFrom * travellers : 0);
    }, 0);
    const transport = transferDays.get(index) ?? 0;
    return { accommodation, experiences, transport, total: accommodation + experiences + transport };
  });

  const accommodation = perDay.reduce((sum, d) => sum + d.accommodation, 0);
  const experiences = perDay.reduce((sum, d) => sum + d.experiences, 0);
  const transport = perDay.reduce((sum, d) => sum + d.transport, 0);
  const serviceFee = Math.round((experiences + transport) * SERVICE_FEE_RATE);
  const total = accommodation + experiences + transport + serviceFee;
  return {
    days: perDay,
    accommodation,
    experiences,
    transport,
    serviceFee,
    total,
    perPerson: Math.round(total / travellers),
    travellers,
    rooms,
  };
}
