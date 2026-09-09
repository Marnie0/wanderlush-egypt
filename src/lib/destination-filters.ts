import type { Destination, Month, Region, TravelStyle } from "@content/types";

export type DurationBucket = "short" | "medium" | "long";

export interface DestinationFilterState {
  query: string;
  regions: Region[];
  styles: TravelStyle[];
  durations: DurationBucket[];
  month: Month | null;
}

export const emptyFilters: DestinationFilterState = {
  query: "",
  regions: [],
  styles: [],
  durations: [],
  month: null,
};

export const DURATION_BUCKETS: DurationBucket[] = ["short", "medium", "long"];

export const MONTHS: Month[] = [
  "jan", "feb", "mar", "apr", "may", "jun",
  "jul", "aug", "sep", "oct", "nov", "dec",
];

/** Buckets read off the upper bound: a 3-4 day place is not a day trip. */
export function durationBucket(destination: Destination): DurationBucket {
  const days = destination.recommendedDays.max;
  if (days <= 2) return "short";
  if (days <= 4) return "medium";
  return "long";
}

export function filterDestinations(
  destinations: Destination[],
  filters: DestinationFilterState,
  language: string,
): Destination[] {
  const needle = filters.query.trim().toLowerCase();
  const arabic = language.startsWith("ar");

  return destinations.filter((destination) => {
    if (needle) {
      const haystack = [
        destination.name.en,
        destination.name.ar,
        destination.tagline.en,
        destination.tagline.ar,
        arabic ? destination.intro.ar : destination.intro.en,
        destination.region.replace(/-/g, " "),
        ...destination.travelStyles,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(needle)) return false;
    }

    if (filters.regions.length > 0 && !filters.regions.includes(destination.region)) {
      return false;
    }

    // Travel styles are inclusive: pick beach and desert and you get either.
    if (
      filters.styles.length > 0 &&
      !filters.styles.some((style) => destination.travelStyles.includes(style))
    ) {
      return false;
    }

    if (
      filters.durations.length > 0 &&
      !filters.durations.includes(durationBucket(destination))
    ) {
      return false;
    }

    if (filters.month && !destination.bestSeason.includes(filters.month)) {
      return false;
    }

    return true;
  });
}

export function countActiveFilters(filters: DestinationFilterState): number {
  return (
    (filters.query.trim() ? 1 : 0) +
    filters.regions.length +
    filters.styles.length +
    filters.durations.length +
    (filters.month ? 1 : 0)
  );
}

/** Filters live in the URL so a filtered view can be shared and reloaded. */
export function filtersToParams(filters: DestinationFilterState): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.query.trim()) params.set("q", filters.query.trim());
  if (filters.regions.length) params.set("region", filters.regions.join(","));
  if (filters.styles.length) params.set("style", filters.styles.join(","));
  if (filters.durations.length) params.set("days", filters.durations.join(","));
  if (filters.month) params.set("month", filters.month);
  return params;
}

export function filtersFromParams(params: URLSearchParams): DestinationFilterState {
  const list = <T extends string>(key: string, allowed: readonly T[]): T[] => {
    const raw = params.get(key);
    if (!raw) return [];
    return raw.split(",").filter((value): value is T => (allowed as readonly string[]).includes(value));
  };

  const month = params.get("month");
  return {
    query: params.get("q") ?? "",
    regions: list("region", [
      "greater-cairo", "fayoum", "mediterranean", "nile-valley", "western-desert", "red-sea",
    ] as const),
    styles: list("style", [
      "history", "beach", "desert", "luxury", "family", "romantic", "nature",
    ] as const),
    durations: list("days", DURATION_BUCKETS),
    month: month && (MONTHS as string[]).includes(month) ? (month as Month) : null,
  };
}
