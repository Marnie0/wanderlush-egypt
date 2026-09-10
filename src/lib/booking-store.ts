import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  emptyDetails,
  emptyPreferences,
  type BookingRecord,
  type Preferences,
  type TravellerDetails,
} from "../../shared/booking";

export const BOOKING_STORAGE_KEY = "wanderlush.booking";

/** What was sent, kept so the confirmation survives a refresh and can be printed later. */
export interface SentRequest extends BookingRecord {
  traveller: TravellerDetails;
  preferences: Preferences;
}

interface BookingState {
  details: TravellerDetails;
  preferences: Preferences;
  consent: boolean;
  /** The most recent request from this browser. */
  lastRequest: SentRequest | null;
  setDetails: (patch: Partial<TravellerDetails>) => void;
  setPreferences: (patch: Partial<Preferences>) => void;
  setConsent: (consent: boolean) => void;
  recordSent: (request: SentRequest) => void;
  clearDraft: () => void;
  /** Removes the sent copy, contact details included, from this browser. */
  forgetLastRequest: () => void;
}

/**
 * The half-filled form, kept in the browser: a refresh, or a detour back to
 * the itinerary to fix a day, must not cost the traveller their details.
 * Cleared once the request is sent; the record of what was sent stays.
 */
export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      details: emptyDetails,
      preferences: emptyPreferences,
      consent: false,
      lastRequest: null,
      setDetails: (patch) => set((state) => ({ details: { ...state.details, ...patch } })),
      setPreferences: (patch) => set((state) => ({ preferences: { ...state.preferences, ...patch } })),
      setConsent: (consent) => set({ consent }),
      recordSent: (request) => set({ lastRequest: request, details: emptyDetails, preferences: emptyPreferences, consent: false }),
      clearDraft: () => set({ details: emptyDetails, preferences: emptyPreferences, consent: false }),
      forgetLastRequest: () => set({ lastRequest: null }),
    }),
    {
      name: BOOKING_STORAGE_KEY,
      version: 1,
      partialize: (state) => ({
        details: state.details,
        preferences: state.preferences,
        consent: state.consent,
        lastRequest: state.lastRequest,
      }),
    },
  ),
);
