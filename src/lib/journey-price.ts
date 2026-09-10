import type { Journey } from "@content/types";
import { estimateTrip } from "./estimate";
import { journeyDays } from "./trip-store";

/**
 * The party a journey's "from" price assumes. The card's figure is the
 * builder's figure for exactly this trip: two adults, no children, seats on
 * shared departures, the planning fee in, the journey's suggested stay level.
 * `content/journeys.ts` carries the same number for the database, and
 * `npm run check:content` fails if the two ever drift.
 */
export const JOURNEY_PRICE_BASIS = { adults: 2, children: 0, tourStyle: "shared", serviceIncluded: true } as const;

const cache = new Map<string, number>();

/** USD per person for the journey as the builder would price it on its defaults. */
export function journeyPriceFrom(journey: Journey): number {
  const cached = cache.get(journey.slug);
  if (cached !== undefined) return cached;
  const price = estimateTrip({ days: journeyDays(journey), tier: journey.suggestedTier, ...JOURNEY_PRICE_BASIS }).perPerson;
  cache.set(journey.slug, price);
  return price;
}
