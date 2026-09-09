/**
 * Wanderlush Egypt — content model.
 *
 * These types are the single source of truth for demo content. The same
 * objects feed the React app directly and are pushed into PostgreSQL by
 * `db/seed.ts`, so the shape here and the shape in `db/schema.sql` must
 * stay in step.
 */

export type Locale = "en" | "ar";

/** Every visible string exists in both languages. No fallback shrugging. */
export interface Localized {
  en: string;
  ar: string;
}

export interface LocalizedList {
  en: string[];
  ar: string[];
}

export type Region =
  | "greater-cairo"
  | "fayoum"
  | "mediterranean"
  | "nile-valley"
  | "western-desert"
  | "red-sea";

export type TravelStyle =
  | "history"
  | "beach"
  | "desert"
  | "luxury"
  | "family"
  | "romantic"
  | "nature";

export type Month =
  | "jan" | "feb" | "mar" | "apr" | "may" | "jun"
  | "jul" | "aug" | "sep" | "oct" | "nov" | "dec";

export type ExperienceCategory =
  | "culture"
  | "history"
  | "adventure"
  | "food"
  | "nature"
  | "wellness"
  | "nightlife"
  | "water";

export type GroupFormat = "private" | "shared";

export type ExperienceEnvironment =
  | "urban"
  | "desert"
  | "water"
  | "indoor"
  | "outdoor";

export type AccommodationTierId = "essential" | "comfort" | "premium" | "luxury";

/**
 * Images resolve to `/images/...` in `public/`. When a file is absent the
 * `SmartImage` component renders a deterministic warm gradient built from
 * `accent`, so the layout never collapses while photography is pending.
 */
export interface ImageRef {
  src: string;
  alt: Localized;
  credit?: string;
}

export interface Attraction {
  name: Localized;
  blurb: Localized;
}

export interface SuggestedDay {
  day: number;
  title: Localized;
  detail: Localized;
}

export interface TierPrices {
  essential: number;
  comfort: number;
  premium: number;
  luxury: number;
}

export interface Destination {
  id: string;
  slug: string;
  name: Localized;
  tagline: Localized;
  region: Region;
  /** Real geographic position, used by the Phase 3 interactive map. */
  coordinates: { lat: number; lng: number };
  travelStyles: TravelStyle[];
  bestSeason: Month[];
  bestSeasonNote: Localized;
  recommendedDays: { min: number; max: number };
  /** Per-person, per-night accommodation guidance in USD. */
  nightlyRates: TierPrices;
  /** Headline "from" figure shown on cards, USD per person per day. */
  dailyBudgetFrom: number;
  intro: Localized;
  heroImage: ImageRef;
  gallery: ImageRef[];
  attractions: Attraction[];
  suggestedItinerary: SuggestedDay[];
  localAdvice: LocalizedList;
  gettingThere: Localized;
  accommodationNote: Localized;
  relatedSlugs: string[];
  /** Drives the gradient placeholder and per-destination accents. */
  accent: string;
}

export interface Experience {
  id: string;
  slug: string;
  name: Localized;
  destinationSlug: string;
  category: ExperienceCategory;
  travelStyles: TravelStyle[];
  environment: ExperienceEnvironment;
  groupFormat: GroupFormat[];
  familyFriendly: boolean;
  /** Minutes. Rendered as hours/days by the locale formatter. */
  durationMinutes: number;
  /** USD per person, on the shared departure. */
  priceFrom: number;
  /**
   * Extra USD per person to take the experience privately. Chartering the
   * whole balloon or boat costs far more than a seat on it, so on a few of
   * these the supplement is larger than the base price.
   */
  privateSupplement: number;
  rating: number;
  reviewCount: number;
  maxGroupSize: number;
  minAge: number | null;
  summary: Localized;
  description: Localized;
  schedule: Localized;
  meetingPoint: Localized;
  inclusions: LocalizedList;
  exclusions: LocalizedList;
  whatToBring: LocalizedList;
  accessibility: Localized;
  cancellation: Localized;
  heroImage: ImageRef;
  gallery: ImageRef[];
  accent: string;
}

export interface Journey {
  id: string;
  slug: string;
  name: Localized;
  tagline: Localized;
  summary: Localized;
  days: number;
  destinationSlugs: string[];
  experienceSlugs: string[];
  travelStyles: TravelStyle[];
  suggestedTier: AccommodationTierId;
  /** USD per person at the suggested tier, excluding international flights. */
  priceFrom: number;
  bestSeasonNote: Localized;
  heroImage: ImageRef;
  outline: SuggestedDay[];
  accent: string;
}

export interface AccommodationLevel {
  id: AccommodationTierId;
  order: number;
  name: Localized;
  summary: Localized;
  description: Localized;
  /** Indicative USD per room per night, national average across destinations. */
  nightlyFrom: number;
  nightlyTo: number;
  inclusions: LocalizedList;
  exampleProperties: Localized;
  accent: string;
}

export interface Review {
  id: string;
  author: Localized;
  origin: Localized;
  journeySlug: string | null;
  destinationSlug: string | null;
  rating: number;
  quote: Localized;
  travelledOn: string;
  /** Every testimonial is fictional and labelled as such in the UI. */
  isDemo: true;
}

export interface FaqCategory {
  id: string;
  name: Localized;
}

export interface Faq {
  id: string;
  categoryId: string;
  question: Localized;
  answer: Localized;
}

export interface CurrencyOption {
  code: string;
  symbol: Localized;
  name: Localized;
  /** Indicative rate against USD. Static by design: no live FX in scope. */
  perUsd: number;
}
