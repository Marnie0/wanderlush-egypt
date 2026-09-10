import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
import { destinationBySlug } from "@content/destinations";
import { experienceBySlug } from "@content/experiences";
import { defaultCurrency } from "@content/currencies";
import type { AccommodationTierId, Journey, Month } from "@content/types";
import type { TourStyle } from "./estimate";
import {
  ASSUMED_STEPS,
  experienceSlugsInDays,
  makeDays,
  newId,
  pickDayFor,
  stopsFromDays,
  type Interest,
  type TripDay,
  type TripItem,
  type TripStep,
} from "./trip-plan";

export const TRIP_STORAGE_KEY = "wanderlush.trip";

export interface TripState {
  /** ISO date, or null when only a month is known. */
  startDate: string | null;
  month: Month | null;
  adults: number;
  children: number;
  /** How long the whole trip is meant to be; the itinerary is checked against it. */
  durationDays: number;
  currency: string;
  interests: Interest[];
  tier: AccommodationTierId;
  /** Seats on scheduled departures, or a guide and vehicle of your own where offered. */
  tourStyle: TourStyle;
  /** Whether the planning and support fee is part of the estimate. */
  serviceIncluded: boolean;
  /**
   * The itinerary is the trip. Destinations, nights and experiences are all
   * read off it, so the setup steps and the editor can never disagree.
   */
  days: TripDay[];
  /** Shortlisted experiences: kept for later, not yet part of the trip. */
  savedExperienceSlugs: string[];
  /**
   * Builder steps the visitor has actually seen. Dates, party and stay level
   * all have defaults, and a trip that arrives from a journey or a
   * destination page is priced on them; until those steps are seen, the
   * estimate says so and the request cannot be sent.
   */
  confirmed: TripStep[];
  /** The curated journey this trip started from, if any. */
  journeySlug: string | null;

  setBasics: (basics: Partial<Pick<TripState, "startDate" | "month" | "adults" | "children" | "durationDays" | "currency">>) => void;
  toggleInterest: (interest: Interest) => void;
  setTier: (tier: AccommodationTierId) => void;
  setPricing: (pricing: Partial<Pick<TripState, "tourStyle" | "serviceIncluded" | "currency">>) => void;

  addDestination: (slug: string, nights?: number) => void;
  /** Every visit to the place, wherever it sits in the route. */
  removeDestination: (slug: string) => void;
  toggleDestination: (slug: string) => void;
  /**
   * Stops are addressed by position, because Cairo at the start and Cairo
   * at the end of a route are two different stays with their own nights.
   */
  setStopNights: (stopIndex: number, nights: number) => void;
  moveStop: (stopIndex: number, direction: -1 | 1) => void;
  removeStop: (stopIndex: number) => void;

  addExperience: (slug: string, dayId?: string) => void;
  removeExperience: (slug: string) => void;
  toggleExperience: (slug: string) => void;

  moveDay: (fromIndex: number, toIndex: number) => void;
  moveItem: (itemId: string, toDayId: string, toIndex: number) => void;
  removeItem: (itemId: string) => void;
  addNote: (dayId: string, kind: "free" | "transport", note: string) => void;
  updateNote: (itemId: string, note: string) => void;

  toggleSavedExperience: (slug: string) => void;
  clearSaved: () => void;
  confirmStep: (step: TripStep) => void;
  loadJourney: (journey: Journey) => void;
  reset: () => void;
}

/** The priced steps the visitor has not seen, once there is something to price. */
export function unconfirmedSteps(state: Pick<TripState, "days" | "confirmed">): TripStep[] {
  if (state.days.length === 0) return [];
  return ASSUMED_STEPS.filter((step) => !state.confirmed.includes(step));
}

const toggleIn = (list: string[], slug: string) =>
  list.includes(slug) ? list.filter((item) => item !== slug) : [...list, slug];

const initialTrip = {
  startDate: null,
  month: null,
  adults: 2,
  children: 0,
  durationDays: 7,
  currency: defaultCurrency,
  interests: [] as Interest[],
  tier: "comfort" as AccommodationTierId,
  tourStyle: "shared" as TourStyle,
  serviceIncluded: true,
  days: [] as TripDay[],
  confirmed: [] as TripStep[],
  journeySlug: null as string | null,
};

/** Days for a place, inserted after its last existing day or at the end. */
function withDestination(days: TripDay[], slug: string, nights: number): TripDay[] {
  if (!destinationBySlug.has(slug)) return days;
  const existing = days.filter((day) => day.destinationSlug === slug).length;
  if (existing >= nights) return days;
  const fresh = makeDays(slug, nights - existing);
  const lastIndex = days.map((day) => day.destinationSlug).lastIndexOf(slug);
  if (lastIndex < 0) return [...days, ...fresh];
  return [...days.slice(0, lastIndex + 1), ...fresh, ...days.slice(lastIndex + 1)];
}

/**
 * Resizes one run of days. Extra days go on the end of the run; days taken
 * away come off its end, and anything planned on them moves to the run's
 * emptiest remaining day rather than disappearing.
 */
function withRunLength(days: TripDay[], stop: { destinationSlug: string; nights: number; firstDayIndex: number }, nights: number): TripDay[] {
  const before = days.slice(0, stop.firstDayIndex);
  let run = days.slice(stop.firstDayIndex, stop.firstDayIndex + stop.nights);
  const after = days.slice(stop.firstDayIndex + stop.nights);
  if (nights > run.length) {
    run = [...run, ...makeDays(stop.destinationSlug, nights - run.length)];
  } else {
    while (run.length > nights) {
      const removed = run.pop() as TripDay;
      if (removed.items.length > 0) {
        const target = pickDayFor(run, stop.destinationSlug);
        run[target] = { ...run[target], items: [...run[target].items, ...removed.items] };
      }
    }
  }
  return [...before, ...run, ...after];
}

function placeExperience(days: TripDay[], slug: string, dayId?: string): TripDay[] {
  const experience = experienceBySlug.get(slug);
  if (!experience) return days;
  // Without a chosen day, an experience already in the trip stays where it is.
  if (!dayId && experienceSlugsInDays(days).includes(slug)) return days;
  let next = days;
  let index = dayId ? next.findIndex((day) => day.id === dayId) : -1;
  // A day in another place is not a home for it; fall back to its own place.
  if (index >= 0 && next[index].destinationSlug !== experience.destinationSlug) index = -1;
  if (index < 0) {
    // No day in that place yet: the place joins the trip at its shortest stay.
    if (!next.some((day) => day.destinationSlug === experience.destinationSlug)) {
      const destination = destinationBySlug.get(experience.destinationSlug);
      next = withDestination(next, experience.destinationSlug, destination?.recommendedDays.min ?? 1);
    }
    index = pickDayFor(next, experience.destinationSlug);
  }
  if (index < 0) return next;
  const item: TripItem = { id: newId(), kind: "experience", experienceSlug: slug };
  return next.map((day, i) => (i === index ? { ...day, items: [...day.items, item] } : day));
}

/**
 * A journey as an itinerary: its places in order with the nights its outline
 * gives them, and its experiences placed on the emptiest days. The same
 * function loads a journey into the builder and prices it on its card, so
 * the two can never disagree.
 */
export function journeyDays(journey: Journey): TripDay[] {
  let days: TripDay[] = [];
  journey.destinationSlugs.forEach((slug, index) => {
    days = [...days, ...makeDays(slug, journey.stopNights[index] ?? 1)];
  });
  for (const slug of journey.experienceSlugs) days = placeExperience(days, slug);
  return days;
}

export const useTripStore = create<TripState>()(
  persist(
    (set, get) => ({
      ...initialTrip,
      savedExperienceSlugs: [],

      setBasics: (basics) => set(basics),
      toggleInterest: (interest) =>
        set((state) => ({
          interests: state.interests.includes(interest)
            ? state.interests.filter((item) => item !== interest)
            : [...state.interests, interest],
        })),
      setTier: (tier) => set({ tier }),
      setPricing: (pricing) => set(pricing),

      addDestination: (slug, nights) =>
        set((state) => ({
          days: withDestination(state.days, slug, nights ?? destinationBySlug.get(slug)?.recommendedDays.min ?? 1),
        })),
      removeDestination: (slug) =>
        set((state) => ({ days: state.days.filter((day) => day.destinationSlug !== slug) })),
      toggleDestination: (slug) => {
        const { days, addDestination, removeDestination } = get();
        if (days.some((day) => day.destinationSlug === slug)) removeDestination(slug);
        else addDestination(slug);
      },
      setStopNights: (stopIndex, nights) =>
        set((state) => {
          const stop = stopsFromDays(state.days)[stopIndex];
          if (!stop) return {};
          const wanted = Math.max(1, Math.min(14, Math.round(nights)));
          if (wanted === stop.nights) return {};
          return { days: withRunLength(state.days, stop, wanted) };
        }),
      moveStop: (stopIndex, direction) =>
        set((state) => {
          const stops = stopsFromDays(state.days);
          const target = stopIndex + direction;
          if (stopIndex < 0 || stopIndex >= stops.length || target < 0 || target >= stops.length) return {};
          const blocks = stops.map((stop) => state.days.slice(stop.firstDayIndex, stop.firstDayIndex + stop.nights));
          [blocks[stopIndex], blocks[target]] = [blocks[target], blocks[stopIndex]];
          return { days: blocks.flat() };
        }),
      removeStop: (stopIndex) =>
        set((state) => {
          const stop = stopsFromDays(state.days)[stopIndex];
          if (!stop) return {};
          return {
            days: [
              ...state.days.slice(0, stop.firstDayIndex),
              ...state.days.slice(stop.firstDayIndex + stop.nights),
            ],
          };
        }),

      addExperience: (slug, dayId) => set((state) => ({ days: placeExperience(state.days, slug, dayId) })),
      removeExperience: (slug) =>
        set((state) => ({
          days: state.days.map((day) => ({
            ...day,
            items: day.items.filter((item) => item.experienceSlug !== slug),
          })),
        })),
      toggleExperience: (slug) => {
        const { days, addExperience, removeExperience } = get();
        if (experienceSlugsInDays(days).includes(slug)) removeExperience(slug);
        else addExperience(slug);
      },

      moveDay: (fromIndex, toIndex) =>
        set((state) => {
          if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= state.days.length || toIndex >= state.days.length) return {};
          const days = [...state.days];
          const [day] = days.splice(fromIndex, 1);
          days.splice(toIndex, 0, day);
          return { days };
        }),
      moveItem: (itemId, toDayId, toIndex) =>
        set((state) => {
          if (!state.days.some((day) => day.id === toDayId)) return {};
          let moving: TripItem | undefined;
          const stripped = state.days.map((day) => {
            const found = day.items.find((item) => item.id === itemId);
            if (found) moving = found;
            return found ? { ...day, items: day.items.filter((item) => item.id !== itemId) } : day;
          });
          if (!moving) return {};
          return {
            days: stripped.map((day) => {
              if (day.id !== toDayId) return day;
              const items = [...day.items];
              items.splice(Math.max(0, Math.min(toIndex, items.length)), 0, moving as TripItem);
              return { ...day, items };
            }),
          };
        }),
      removeItem: (itemId) =>
        set((state) => ({
          days: state.days.map((day) => ({ ...day, items: day.items.filter((item) => item.id !== itemId) })),
        })),
      addNote: (dayId, kind, note) =>
        set((state) => ({
          days: state.days.map((day) =>
            day.id === dayId ? { ...day, items: [...day.items, { id: newId(), kind, note }] } : day,
          ),
        })),
      updateNote: (itemId, note) =>
        set((state) => ({
          days: state.days.map((day) => ({
            ...day,
            items: day.items.map((item) => (item.id === itemId ? { ...item, note } : item)),
          })),
        })),

      toggleSavedExperience: (slug) =>
        set((state) => ({ savedExperienceSlugs: toggleIn(state.savedExperienceSlugs, slug) })),
      clearSaved: () => set({ savedExperienceSlugs: [] }),
      confirmStep: (step) =>
        set((state) => (state.confirmed.includes(step) ? {} : { confirmed: [...state.confirmed, step] })),

      // A curated journey becomes the traveller's own: its places in order
      // with the nights its outline gives them, its experiences placed, its
      // suggested tier. Everything after that is editable, and nothing about
      // who is travelling or where they sleep counts as decided yet.
      loadJourney: (journey) =>
        set({ days: journeyDays(journey), durationDays: journey.days, tier: journey.suggestedTier, confirmed: [], journeySlug: journey.slug }),
      reset: () => set({ ...initialTrip, savedExperienceSlugs: [] }),
    }),
    {
      name: TRIP_STORAGE_KEY,
      version: 3,
      partialize: (state) => ({
        startDate: state.startDate,
        month: state.month,
        adults: state.adults,
        children: state.children,
        durationDays: state.durationDays,
        currency: state.currency,
        interests: state.interests,
        tier: state.tier,
        tourStyle: state.tourStyle,
        serviceIncluded: state.serviceIncluded,
        days: state.days,
        savedExperienceSlugs: state.savedExperienceSlugs,
        confirmed: state.confirmed,
        journeySlug: state.journeySlug,
      }),
      // Earlier versions kept two flat lists. They become days at each
      // place's shortest stay, with the chosen experiences placed on them.
      migrate: (persisted, version) => {
        const old = (persisted ?? {}) as Partial<TripState> & {
          destinationSlugs?: string[];
          experienceSlugs?: string[];
        };
        if (version >= 3) return old as TripState;
        let days: TripDay[] = [];
        for (const slug of old.destinationSlugs ?? []) {
          days = withDestination(days, slug, destinationBySlug.get(slug)?.recommendedDays.min ?? 1);
        }
        for (const slug of old.experienceSlugs ?? []) days = placeExperience(days, slug);
        return {
          ...initialTrip,
          days,
          savedExperienceSlugs: old.savedExperienceSlugs ?? [],
        } as TripState;
      },
    },
  ),
);

/** Subscribe to one slug rather than the whole list, so cards do not all re-render. */
export const useHasDestination = (slug: string) =>
  useTripStore((state) => state.days.some((day) => day.destinationSlug === slug));

export const useHasExperience = (slug: string) =>
  useTripStore((state) =>
    state.days.some((day) => day.items.some((item) => item.experienceSlug === slug)),
  );

export const useHasSavedExperience = (slug: string) =>
  useTripStore((state) => state.savedExperienceSlugs.includes(slug));

/** Places plus experiences: what the header badge counts. */
export const useTripCount = () =>
  useTripStore(
    (state) =>
      stopsFromDays(state.days).length +
      state.days.reduce((sum, day) => sum + day.items.filter((item) => item.kind === "experience").length, 0),
  );

/** Which priced steps still hold defaults nobody has looked at. */
export const useUnconfirmedSteps = () => useTripStore(useShallow((state) => unconfirmedSteps(state)));

export const useSavedCount = () =>
  useTripStore((state) => state.savedExperienceSlugs.length);
