import { destinationBySlug } from "@content/destinations";
import { experienceBySlug } from "@content/experiences";
import type { AccommodationTierId, Experience, Month } from "@content/types";
import { findRoute } from "./transport";

export const TRIP_STEPS = ["basics", "places", "stay", "experiences", "itinerary"] as const;
export type TripStep = (typeof TRIP_STEPS)[number];
/** Steps whose defaults price the trip: a visitor has to have seen them for the estimate to be theirs. */
export const ASSUMED_STEPS: readonly TripStep[] = ["basics", "stay"];

export type TripItemKind = "experience" | "free" | "transport";

export interface TripItem {
  id: string;
  kind: TripItemKind;
  /** Set when `kind` is "experience". */
  experienceSlug?: string;
  /** A short label for free time or a transfer, written by the traveller. */
  note?: string;
}

export interface TripDay {
  id: string;
  destinationSlug: string;
  items: TripItem[];
}

/** A run of consecutive days in one place. */
export interface TripStop {
  destinationSlug: string;
  nights: number;
  /** Index of the first day of the run in the itinerary. */
  firstDayIndex: number;
}

export const INTERESTS = [
  "history", "culture", "adventure", "beaches", "food", "luxury", "relaxation", "family", "photography",
] as const;
export type Interest = (typeof INTERESTS)[number];

/** Longer than this in one day and the day stops being a holiday. */
export const CROWDED_DAY_MINUTES = 12 * 60;
export const MAX_ITEMS_PER_DAY = 3;
/** Past this, a transfer takes the whole day and deserves its own line. */
export const LONG_TRANSFER_HOURS = 8;

export function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 12);
}

export function stopsFromDays(days: TripDay[]): TripStop[] {
  const stops: TripStop[] = [];
  days.forEach((day, index) => {
    const last = stops[stops.length - 1];
    if (last && last.destinationSlug === day.destinationSlug) last.nights += 1;
    else stops.push({ destinationSlug: day.destinationSlug, nights: 1, firstDayIndex: index });
  });
  return stops;
}

export function experienceSlugsInDays(days: TripDay[]): string[] {
  return days.flatMap((day) =>
    day.items.flatMap((item) => (item.kind === "experience" && item.experienceSlug ? [item.experienceSlug] : [])),
  );
}

function dayMinutes(day: TripDay): number {
  return day.items.reduce((sum, item) => {
    const experience = item.experienceSlug ? experienceBySlug.get(item.experienceSlug) : undefined;
    return sum + (experience ? Math.min(experience.durationMinutes, CROWDED_DAY_MINUTES) : 0);
  }, 0);
}

/**
 * The day in a place with the most room left, so a fourth experience lands
 * on the empty second day rather than on top of the first three.
 */
export function pickDayFor(days: TripDay[], destinationSlug: string): number {
  let best = -1;
  let bestLoad = Infinity;
  days.forEach((day, index) => {
    if (day.destinationSlug !== destinationSlug) return;
    const load = dayMinutes(day) + day.items.length * 60;
    if (load < bestLoad) {
      best = index;
      bestLoad = load;
    }
  });
  return best;
}

export function makeDays(destinationSlug: string, nights: number): TripDay[] {
  return Array.from({ length: nights }, () => ({ id: newId(), destinationSlug, items: [] }));
}

/** Minutes a day is committed to, for the "what fits" line and warnings. */
export function dayLoadMinutes(day: TripDay): number {
  return dayMinutes(day);
}

/**
 * Orders experiences for a traveller: the ones matching what they said they
 * care about first, then by the same weighted rating the marketplace uses.
 */
/** How much of what the traveller said they care about this experience answers. */
export function interestScore(experience: Experience, interests: readonly Interest[]): number {
  let points = 0;
  for (const interest of interests) {
    if (INTEREST_CATEGORIES[interest].includes(experience.category)) points += 2;
    if (INTEREST_STYLES[interest].some((style) => experience.travelStyles.includes(style))) points += 1;
  }
  return points;
}

export function rankForInterests(experiences: Experience[], interests: readonly Interest[], hasChildren: boolean): Experience[] {
  const score = (experience: Experience) => {
    let points = interestScore(experience, interests);
    if (hasChildren && experience.familyFriendly) points += 1;
    if (hasChildren && experience.minAge !== null && experience.minAge >= 12) points -= 2;
    return points * 10 + experience.rating * Math.log10(experience.reviewCount + 10);
  };
  return [...experiences].sort((a, b) => score(b) - score(a));
}

const INTEREST_CATEGORIES: Record<Interest, Experience["category"][]> = {
  history: ["history"],
  culture: ["culture", "food"],
  adventure: ["adventure"],
  beaches: ["water"],
  food: ["food"],
  luxury: ["water", "wellness"],
  relaxation: ["wellness", "nature"],
  family: ["nature", "water", "culture"],
  photography: ["nature", "history"],
};

const INTEREST_STYLES: Record<Interest, Experience["travelStyles"]> = {
  history: ["history"],
  culture: ["history"],
  adventure: ["desert", "nature"],
  beaches: ["beach"],
  food: [],
  luxury: ["luxury", "romantic"],
  relaxation: ["beach", "luxury"],
  family: ["family"],
  photography: ["desert", "nature", "history"],
};

export type TripWarningKind =
  | "exceedsDuration"
  | "underDuration"
  | "crowdedDay"
  | "duplicate"
  | "duplicateSameDay"
  | "longTransfer"
  | "noRoute"
  | "outOfSeason"
  | "minAge"
  | "multiDay"
  | "empty";

export interface TripWarning {
  kind: TripWarningKind;
  /** Warnings stop a request being sensible; notes are worth knowing. */
  severity: "warning" | "note";
  /** Index of the day the warning is about, when it is about one day. */
  dayIndex?: number;
  params?: Record<string, string | number>;
}

export interface TripFacts {
  days: TripDay[];
  durationDays: number;
  month: Month | null;
  children: number;
}

/**
 * Everything that would make a specialist write back with a question,
 * checked while the trip is being built rather than after it is sent.
 */
export function tripWarnings({ days, durationDays, month, children }: TripFacts): TripWarning[] {
  const warnings: TripWarning[] = [];
  if (days.length === 0) return [{ kind: "empty", severity: "note" }];

  if (days.length > durationDays) {
    warnings.push({ kind: "exceedsDuration", severity: "warning", params: { planned: days.length, duration: durationDays, count: days.length - durationDays } });
  } else if (days.length < durationDays) {
    warnings.push({ kind: "underDuration", severity: "note", params: { planned: days.length, duration: durationDays, count: durationDays - days.length } });
  }

  const seen = new Map<string, number>();
  days.forEach((day, index) => {
    const experiences = day.items.flatMap((item) =>
      item.experienceSlug ? [experienceBySlug.get(item.experienceSlug)].filter(Boolean) : [],
    ) as Experience[];
    const minutes = experiences.reduce((sum, e) => sum + Math.min(e.durationMinutes, CROWDED_DAY_MINUTES), 0);
    if (experiences.length > MAX_ITEMS_PER_DAY || minutes > CROWDED_DAY_MINUTES) {
      warnings.push({ kind: "crowdedDay", severity: "warning", dayIndex: index, params: { day: index + 1, hours: Math.round(minutes / 60) } });
    }
    for (const experience of experiences) {
      const first = seen.get(experience.slug);
      if (first !== undefined) {
        warnings.push({
          kind: first === index ? "duplicateSameDay" : "duplicate",
          severity: "warning",
          dayIndex: index,
          params: { day: index + 1, first: first + 1 },
        });
      } else {
        seen.set(experience.slug, index);
      }
      if (experience.durationMinutes > 20 * 60) {
        const span = Math.ceil(experience.durationMinutes / (24 * 60));
        warnings.push({ kind: "multiDay", severity: "note", dayIndex: index, params: { day: index + 1, count: span } });
      }
      if (children > 0 && experience.minAge !== null && experience.minAge >= 12) {
        warnings.push({ kind: "minAge", severity: "note", dayIndex: index, params: { day: index + 1, age: experience.minAge } });
      }
    }
  });

  const stops = stopsFromDays(days);
  for (let i = 1; i < stops.length; i++) {
    const route = findRoute(stops[i - 1].destinationSlug, stops[i].destinationSlug);
    const dayIndex = stops[i].firstDayIndex;
    if (!route) {
      warnings.push({ kind: "noRoute", severity: "warning", dayIndex, params: { day: dayIndex + 1 } });
    } else if (route.hours >= LONG_TRANSFER_HOURS) {
      warnings.push({ kind: "longTransfer", severity: "warning", dayIndex, params: { day: dayIndex + 1, hours: Math.round(route.hours) } });
    }
  }

  if (month) {
    for (const stop of stops) {
      const destination = destinationBySlug.get(stop.destinationSlug);
      if (destination && !destination.bestSeason.includes(month)) {
        warnings.push({ kind: "outOfSeason", severity: "note", dayIndex: stop.firstDayIndex, params: { day: stop.firstDayIndex + 1 } });
      }
    }
  }

  return warnings;
}

export const TIER_ORDER: AccommodationTierId[] = ["essential", "comfort", "premium", "luxury"];
