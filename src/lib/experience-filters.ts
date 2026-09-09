import type { TFunction } from "i18next";
import { destinationBySlug } from "@content/destinations";
import { formatMoney } from "@/lib/format";
import type {
  Experience,
  ExperienceCategory,
  ExperienceEnvironment,
  GroupFormat,
} from "@content/types";

export type PriceBand = "budget" | "mid" | "premium" | "signature";
export type ExperienceDurationBand = "upTo3h" | "halfDay" | "fullDay" | "multiDay";
export type ExperienceSort = "recommended" | "priceAsc" | "priceDesc" | "durationAsc" | "rating";

export interface ExperienceFilterState {
  query: string;
  destinations: string[];
  categories: ExperienceCategory[];
  prices: PriceBand[];
  durations: ExperienceDurationBand[];
  groupFormats: GroupFormat[];
  environments: ExperienceEnvironment[];
  familyFriendly: boolean;
  /** Narrow to the visitor's shortlist, which lives only in their browser. */
  savedOnly: boolean;
  sort: ExperienceSort;
}

export const emptyExperienceFilters: ExperienceFilterState = {
  query: "",
  destinations: [],
  categories: [],
  prices: [],
  durations: [],
  groupFormats: [],
  environments: [],
  familyFriendly: false,
  savedOnly: false,
  sort: "recommended",
};

export const CATEGORIES: ExperienceCategory[] = [
  "culture", "history", "adventure", "food", "nature", "wellness", "nightlife", "water",
];

export const ENVIRONMENTS: ExperienceEnvironment[] = [
  "urban", "desert", "water", "indoor", "outdoor",
];

export const GROUP_FORMATS: GroupFormat[] = ["private", "shared"];

export const SORT_OPTIONS: ExperienceSort[] = [
  "recommended", "priceAsc", "priceDesc", "durationAsc", "rating",
];

/** USD per person. The upper bound is exclusive so the bands cannot overlap. */
export const PRICE_BANDS: { id: PriceBand; min: number; max: number | null }[] = [
  { id: "budget", min: 0, max: 50 },
  { id: "mid", min: 50, max: 100 },
  { id: "premium", min: 100, max: 200 },
  { id: "signature", min: 200, max: null },
];

export const DURATION_BANDS: { id: ExperienceDurationBand; max: number | null }[] = [
  { id: "upTo3h", max: 180 },
  { id: "halfDay", max: 360 },
  // A thirteen-hour day trip is still a day trip, so the full day runs to 14h.
  { id: "fullDay", max: 840 },
  { id: "multiDay", max: null },
];

export function priceBand(experience: Experience): PriceBand {
  const band = PRICE_BANDS.find(
    (candidate) => experience.priceFrom >= candidate.min && (candidate.max === null || experience.priceFrom < candidate.max),
  );
  return band?.id ?? "signature";
}

export function durationBand(experience: Experience): ExperienceDurationBand {
  const band = DURATION_BANDS.find(
    (candidate) => candidate.max === null || experience.durationMinutes <= candidate.max,
  );
  return band?.id ?? "multiDay";
}

/** Turns a locale key into the words the visitor actually sees. */
type Translate = (key: string) => string;

/**
 * Searches the words on the page, not the identifiers behind them: the place
 * name in both languages, and the category and setting as they are labelled,
 * so "الأقصر" and "مغامرة" find things in Arabic the way "Luxor" and
 * "adventure" do in English.
 */
function matchesQuery(
  experience: Experience,
  needle: string,
  arabic: boolean,
  translate?: Translate,
): boolean {
  const destination = destinationBySlug.get(experience.destinationSlug);
  const haystack = [
    experience.name.en,
    experience.name.ar,
    experience.summary.en,
    experience.summary.ar,
    arabic ? experience.description.ar : experience.description.en,
    experience.destinationSlug.replace(/-/g, " "),
    destination?.name.en ?? "",
    destination?.name.ar ?? "",
    experience.category,
    experience.environment,
    translate?.(`categories.${experience.category}`) ?? "",
    translate?.(`environments.${experience.environment}`) ?? "",
    ...experience.travelStyles,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(needle);
}

/**
 * Choices inside a group widen the result, choices across groups narrow it:
 * pick food and adventure and you get both, then add Luxor and you get only
 * the ones in Luxor.
 */
export function filterExperiences(
  experiences: Experience[],
  filters: ExperienceFilterState,
  language: string,
  savedSlugs: string[] = [],
  translate?: Translate,
): Experience[] {
  const needle = filters.query.trim().toLowerCase();
  const arabic = language.startsWith("ar");

  const results = experiences.filter((experience) => {
    if (needle && !matchesQuery(experience, needle, arabic, translate)) return false;

    if (filters.destinations.length > 0 && !filters.destinations.includes(experience.destinationSlug)) {
      return false;
    }
    if (filters.categories.length > 0 && !filters.categories.includes(experience.category)) {
      return false;
    }
    if (filters.prices.length > 0 && !filters.prices.includes(priceBand(experience))) {
      return false;
    }
    if (filters.durations.length > 0 && !filters.durations.includes(durationBand(experience))) {
      return false;
    }
    if (
      filters.groupFormats.length > 0 &&
      !filters.groupFormats.some((format) => experience.groupFormat.includes(format))
    ) {
      return false;
    }
    if (
      filters.environments.length > 0 &&
      !filters.environments.includes(experience.environment)
    ) {
      return false;
    }
    if (filters.familyFriendly && !experience.familyFriendly) return false;
    if (filters.savedOnly && !savedSlugs.includes(experience.slug)) return false;

    return true;
  });

  return sortExperiences(results, filters.sort);
}

export function sortExperiences(experiences: Experience[], sort: ExperienceSort): Experience[] {
  const sorted = [...experiences];
  switch (sort) {
    case "priceAsc":
      return sorted.sort((a, b) => a.priceFrom - b.priceFrom);
    case "priceDesc":
      return sorted.sort((a, b) => b.priceFrom - a.priceFrom);
    case "durationAsc":
      return sorted.sort((a, b) => a.durationMinutes - b.durationMinutes);
    case "rating":
      return sorted.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    default:
      // Recommended weighs the rating by how many people gave it, so a lone
      // five-star review does not outrank four hundred at 4.8.
      return sorted.sort(
        (a, b) => b.rating * Math.log10(b.reviewCount + 10) - a.rating * Math.log10(a.reviewCount + 10),
      );
  }
}

export function countActiveExperienceFilters(filters: ExperienceFilterState): number {
  return (
    (filters.query.trim() ? 1 : 0) +
    filters.destinations.length +
    filters.categories.length +
    filters.prices.length +
    filters.durations.length +
    filters.groupFormats.length +
    filters.environments.length +
    (filters.familyFriendly ? 1 : 0) +
    (filters.savedOnly ? 1 : 0)
  );
}

/** Filters live in the URL so a filtered view can be shared and reloaded. */
export function experienceFiltersToParams(filters: ExperienceFilterState): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.query.trim()) params.set("q", filters.query.trim());
  if (filters.destinations.length) params.set("place", filters.destinations.join(","));
  if (filters.categories.length) params.set("category", filters.categories.join(","));
  if (filters.prices.length) params.set("price", filters.prices.join(","));
  if (filters.durations.length) params.set("length", filters.durations.join(","));
  if (filters.groupFormats.length) params.set("group", filters.groupFormats.join(","));
  if (filters.environments.length) params.set("setting", filters.environments.join(","));
  if (filters.familyFriendly) params.set("family", "1");
  if (filters.savedOnly) params.set("saved", "1");
  if (filters.sort !== "recommended") params.set("sort", filters.sort);
  return params;
}

export function experienceFiltersFromParams(
  params: URLSearchParams,
  destinationSlugs: readonly string[],
): ExperienceFilterState {
  const list = <T extends string>(key: string, allowed: readonly T[]): T[] => {
    const raw = params.get(key);
    if (!raw) return [];
    return raw
      .split(",")
      .filter((value): value is T => (allowed as readonly string[]).includes(value));
  };

  const sort = params.get("sort");
  return {
    query: params.get("q") ?? "",
    destinations: list("place", destinationSlugs),
    categories: list("category", CATEGORIES),
    prices: list("price", PRICE_BANDS.map((band) => band.id)),
    durations: list("length", DURATION_BANDS.map((band) => band.id)),
    groupFormats: list("group", GROUP_FORMATS),
    environments: list("setting", ENVIRONMENTS),
    familyFriendly: params.get("family") === "1",
    savedOnly: params.get("saved") === "1",
    sort: sort && (SORT_OPTIONS as string[]).includes(sort) ? (sort as ExperienceSort) : "recommended",
  };
}

/**
 * Price bands read as money rather than as band names, and the currency has to
 * follow the locale, so the label is built here and shared by the filter panel
 * and the active-filter chips.
 */
export function priceBandLabel(band: PriceBand, t: TFunction, language: string): string {
  const money = (value: number) => formatMoney(value, "USD", language);
  switch (band) {
    case "budget":
      return t("experiences.priceUnder", { amount: money(50) });
    case "mid":
      return `${money(50)} – ${money(100)}`;
    case "premium":
      return `${money(100)} – ${money(200)}`;
    default:
      return t("experiences.priceOver", { amount: money(200) });
  }
}
