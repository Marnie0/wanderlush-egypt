import { create } from "zustand";
import { persist } from "zustand/middleware";

export const TRIP_STORAGE_KEY = "wanderlush.trip";

interface TripState {
  destinationSlugs: string[];
  experienceSlugs: string[];
  toggleDestination: (slug: string) => void;
  removeDestination: (slug: string) => void;
  toggleExperience: (slug: string) => void;
  removeExperience: (slug: string) => void;
  reset: () => void;
}

const toggle = (list: string[], slug: string) =>
  list.includes(slug) ? list.filter((item) => item !== slug) : [...list, slug];

/**
 * The trip a visitor is assembling. It lives in their own browser and is never
 * sent anywhere until a booking request is submitted, which is what lets the
 * whole site work without an account.
 *
 * Phase 3 only needs the chosen destinations and experiences. Phase 5 extends
 * this with dates, party size, accommodation and the day-by-day itinerary, so
 * the persisted shape carries a version from the start.
 */
export const useTripStore = create<TripState>()(
  persist(
    (set) => ({
      destinationSlugs: [],
      experienceSlugs: [],
      toggleDestination: (slug) =>
        set((state) => ({ destinationSlugs: toggle(state.destinationSlugs, slug) })),
      removeDestination: (slug) =>
        set((state) => ({
          destinationSlugs: state.destinationSlugs.filter((item) => item !== slug),
        })),
      toggleExperience: (slug) =>
        set((state) => ({ experienceSlugs: toggle(state.experienceSlugs, slug) })),
      removeExperience: (slug) =>
        set((state) => ({
          experienceSlugs: state.experienceSlugs.filter((item) => item !== slug),
        })),
      reset: () => set({ destinationSlugs: [], experienceSlugs: [] }),
    }),
    { name: TRIP_STORAGE_KEY, version: 1 },
  ),
);

/** Subscribe to one slug rather than the whole list, so cards do not all re-render. */
export const useHasDestination = (slug: string) =>
  useTripStore((state) => state.destinationSlugs.includes(slug));

export const useHasExperience = (slug: string) =>
  useTripStore((state) => state.experienceSlugs.includes(slug));

export const useTripCount = () =>
  useTripStore((state) => state.destinationSlugs.length + state.experienceSlugs.length);
