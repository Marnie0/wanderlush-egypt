import { create } from "zustand";
import { persist } from "zustand/middleware";
import { destinationBySlug } from "@content/destinations";
import { experienceBySlug } from "@content/experiences";
import { defaultCurrency } from "@content/currencies";
import type { AccommodationTierId, Journey, Month } from "@content/types";
import {
  experienceSlugsInDays,
  makeDays,
  newId,
  pickDayFor,
  stopsFromDays,
  type Interest,
  type TripDay,
  type TripItem,
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
  /**
   * The itinerary is the trip. Destinations, nights and experiences are all
   * read off it, so the setup steps and the editor can never disagree.
   */
  days: TripDay[];
  /** Shortlisted experiences: kept for later, not yet part of the trip. */
  savedExperienceSlugs: string[];

  setBasics: (basics: Partial<Pick<TripState, "startDate" | "month" | "adults" | "children" | "durationDays" | "currency">>) => void;
  toggleInterest: (interest: Interest) => void;
  setTier: (tier: AccommodationTierId) => void;

  addDestination: (slug: string, nights?: number) => void;
  removeDestination: (slug: string) => void;
  toggleDestination: (slug: string) => void;
  setNights: (slug: string, nights: number) => void;
  moveStop: (slug: string, direction: -1 | 1) => void;

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
  loadJourney: (journey: Journey) => void;
  reset: () => void;
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
  days: [] as TripDay[],
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

/** Drops days from the end of a place's run, keeping what was planned on the rest. */
function withFewerNights(days: TripDay[], slug: string, nights: number): TripDay[] {
  let remaining = days.filter((day) => day.destinationSlug === slug).length - nights;
  if (remaining <= 0) return days;
  const result = [...days];
  for (let i = result.length - 1; i >= 0 && remaining > 0; i--) {
    if (result[i].destinationSlug !== slug) continue;
    const removed = result.splice(i, 1)[0];
    remaining -= 1;
    // Anything planned on a removed day moves to the place's remaining days.
    const target = pickDayFor(result, slug);
    if (target >= 0 && removed.items.length > 0) {
      result[target] = { ...result[target], items: [...result[target].items, ...removed.items] };
    }
  }
  return result;
}

function placeExperience(days: TripDay[], slug: string, dayId?: string): TripDay[] {
  const experience = experienceBySlug.get(slug);
  if (!experience) return days;
  let next = days;
  let index = dayId ? next.findIndex((day) => day.id === dayId) : -1;
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
      setNights: (slug, nights) =>
        set((state) => {
          const wanted = Math.max(1, Math.min(14, Math.round(nights)));
          const current = state.days.filter((day) => day.destinationSlug === slug).length;
          if (wanted === current) return {};
          return {
            days: wanted > current
              ? withDestination(state.days, slug, wanted)
              : withFewerNights(state.days, slug, wanted),
          };
        }),
      moveStop: (slug, direction) =>
        set((state) => {
          const stops = stopsFromDays(state.days);
          const index = stops.findIndex((stop) => stop.destinationSlug === slug);
          const target = index + direction;
          if (index < 0 || target < 0 || target >= stops.length) return {};
          const blocks = stops.map((stop) => state.days.slice(stop.firstDayIndex, stop.firstDayIndex + stop.nights));
          [blocks[index], blocks[target]] = [blocks[target], blocks[index]];
          return { days: blocks.flat() };
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

      // A curated journey becomes the traveller's own: its places in order
      // with the nights its outline gives them, its experiences placed, its
      // suggested tier. Everything after that is editable.
      loadJourney: (journey) => {
        const nightsFor = new Map<string, number>();
        for (const slug of journey.destinationSlugs) nightsFor.set(slug, 0);
        // Share the days out in outline order, then correct the rounding.
        const share = Math.max(1, Math.floor(journey.days / journey.destinationSlugs.length));
        for (const slug of journey.destinationSlugs) nightsFor.set(slug, share);
        let leftover = journey.days - share * journey.destinationSlugs.length;
        for (const slug of journey.destinationSlugs) {
          if (leftover <= 0) break;
          nightsFor.set(slug, (nightsFor.get(slug) ?? 0) + 1);
          leftover -= 1;
        }
        let days: TripDay[] = [];
        for (const slug of journey.destinationSlugs) days = [...days, ...makeDays(slug, nightsFor.get(slug) ?? 1)];
        for (const slug of journey.experienceSlugs) days = placeExperience(days, slug);
        set({ days, durationDays: journey.days, tier: journey.suggestedTier });
      },
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
        days: state.days,
        savedExperienceSlugs: state.savedExperienceSlugs,
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

export const useSavedCount = () =>
  useTripStore((state) => state.savedExperienceSlugs.length);
