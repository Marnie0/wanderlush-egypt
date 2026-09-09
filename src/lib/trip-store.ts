import { create } from "zustand";
import { persist } from "zustand/middleware";

export const TRIP_STORAGE_KEY = "wanderlush.trip";

interface TripState {
  destinationSlugs: string[];
  experienceSlugs: string[];
  /** Shortlisted experiences: kept for later, not yet part of the trip. */
  savedExperienceSlugs: string[];
  toggleDestination: (slug: string) => void;
  removeDestination: (slug: string) => void;
  toggleExperience: (slug: string) => void;
  removeExperience: (slug: string) => void;
  toggleSavedExperience: (slug: string) => void;
  clearSaved: () => void;
  reset: () => void;
}

const toggle = (list: string[], slug: string) =>
  list.includes(slug) ? list.filter((item) => item !== slug) : [...list, slug];

/**
 * The trip a visitor is assembling. It lives in their own browser and is never
 * sent anywhere until a booking request is submitted, which is what lets the
 * whole site work without an account.
 *
 * Saving and adding are deliberately separate. Saving is a bookmark while a
 * visitor is still comparing; adding commits an experience to the trip. Phase 5
 * extends this with dates, party size, accommodation and the day-by-day
 * itinerary, so the persisted shape carries a version.
 */
export const useTripStore = create<TripState>()(
  persist(
    (set) => ({
      destinationSlugs: [],
      experienceSlugs: [],
      savedExperienceSlugs: [],
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
      toggleSavedExperience: (slug) =>
        set((state) => ({ savedExperienceSlugs: toggle(state.savedExperienceSlugs, slug) })),
      clearSaved: () => set({ savedExperienceSlugs: [] }),
      reset: () => set({ destinationSlugs: [], experienceSlugs: [], savedExperienceSlugs: [] }),
    }),
    {
      name: TRIP_STORAGE_KEY,
      version: 2,
      // A trip saved before the shortlist existed has no saved list at all,
      // and zustand would hand the store `undefined` for it.
      migrate: (persisted, version) => {
        const state = (persisted ?? {}) as Partial<TripState>;
        if (version < 2) return { ...state, savedExperienceSlugs: [] };
        return state;
      },
    },
  ),
);

/** Subscribe to one slug rather than the whole list, so cards do not all re-render. */
export const useHasDestination = (slug: string) =>
  useTripStore((state) => state.destinationSlugs.includes(slug));

export const useHasExperience = (slug: string) =>
  useTripStore((state) => state.experienceSlugs.includes(slug));

export const useHasSavedExperience = (slug: string) =>
  useTripStore((state) => state.savedExperienceSlugs.includes(slug));

export const useTripCount = () =>
  useTripStore((state) => state.destinationSlugs.length + state.experienceSlugs.length);

export const useSavedCount = () =>
  useTripStore((state) => state.savedExperienceSlugs.length);
