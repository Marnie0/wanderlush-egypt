import type { Destination, Month, Region, TravelStyle } from "@content/types";
import { normalizeSearch, pick } from "@/lib/format";

export type DurationBucket = "short" | "medium" | "long";

export interface DestinationFilterState {
  query: string;
  regions: Region[];
  styles: TravelStyle[];
  durations: DurationBucket[];
  /**
   * The window the trip falls in, inclusive, and it may wrap the new year:
   * October to April is one range. A single month is a range of one.
   */
  monthRange: [Month, Month] | null;
}

export const emptyFilters: DestinationFilterState = {
  query: "",
  regions: [],
  styles: [],
  durations: [],
  monthRange: null,
};

/** The months from one to another, wrapping December into January. */
export function monthsInRange([from, to]: [Month, Month]): Month[] {
  const start = MONTHS.indexOf(from);
  const end = MONTHS.indexOf(to);
  const length = ((end - start + 12) % 12) + 1;
  return Array.from({ length }, (_, i) => MONTHS[(start + i) % 12]);
}

/**
 * Tapping months builds a range: the first tap starts it, the second ends
 * it, a tap inside an existing range starts over, and tapping the only
 * month of a range clears it.
 */
export function nextMonthRange(current: [Month, Month] | null, month: Month): [Month, Month] | null {
  if (!current) return [month, month];
  const [from, to] = current;
  if (from === to) return month === from ? null : [from, month];
  return [month, month];
}

export const DURATION_BUCKETS: DurationBucket[] = ["short", "medium", "long"];

export const MONTHS: Month[] = [
  "jan", "feb", "mar", "apr", "may", "jun",
  "jul", "aug", "sep", "oct", "nov", "dec",
];

/** The days each bucket covers; the last one is open-ended. */
const BUCKET_RANGES: Record<DurationBucket, [number, number]> = {
  short: [1, 2],
  medium: [3, 4],
  long: [5, Infinity],
};

/**
 * The filter asks how long the visitor has, so a place matches when any of
 * its recommended stay fits: Hurghada at three to six days belongs under
 * "3 to 4 days" as much as under "5 days or more".
 */
export function matchesDuration(destination: Destination, buckets: DurationBucket[]): boolean {
  const { min, max } = destination.recommendedDays;
  return buckets.some((bucket) => {
    const [from, to] = BUCKET_RANGES[bucket];
    return min <= to && max >= from;
  });
}

/** Turns a locale key into the words the visitor actually sees. */
type Translate = (key: string) => string;

export function filterDestinations(
  destinations: Destination[],
  filters: DestinationFilterState,
  language: string,
  translate?: Translate,
): Destination[] {
  const needle = normalizeSearch(filters.query.trim());
  const arabic = language.startsWith("ar");

  return destinations.filter((destination) => {
    if (needle) {
      // The words on the page, not the identifiers behind them, so the
      // region and style labels match in whichever language they are shown.
      const haystack = normalizeSearch(
        [
          destination.name.en,
          destination.name.ar,
          destination.tagline.en,
          destination.tagline.ar,
          arabic ? destination.intro.ar : destination.intro.en,
          destination.region.replace(/-/g, " "),
          translate?.(`regions.${destination.region}`) ?? "",
          ...destination.travelStyles,
          ...destination.travelStyles.map((style) => translate?.(`travelStyles.${style}`) ?? ""),
          ...destination.attractions.map((attraction) => pick(attraction.name, language)),
        ].join(" "),
      );
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

    if (filters.durations.length > 0 && !matchesDuration(destination, filters.durations)) {
      return false;
    }

    // At its best for the whole window, because the trip spans it.
    if (
      filters.monthRange &&
      !monthsInRange(filters.monthRange).every((month) => destination.bestSeason.includes(month))
    ) {
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
    (filters.monthRange ? 1 : 0)
  );
}

/** Filters live in the URL so a filtered view can be shared and reloaded. */
export function filtersToParams(filters: DestinationFilterState): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.query.trim()) params.set("q", filters.query.trim());
  if (filters.regions.length) params.set("region", filters.regions.join(","));
  if (filters.styles.length) params.set("style", filters.styles.join(","));
  if (filters.durations.length) params.set("days", filters.durations.join(","));
  if (filters.monthRange) {
    const [from, to] = filters.monthRange;
    params.set("month", from === to ? from : `${from}-${to}`);
  }
  return params;
}

export function filtersFromParams(params: URLSearchParams): DestinationFilterState {
  const list = <T extends string>(key: string, allowed: readonly T[]): T[] => {
    const raw = params.get(key);
    if (!raw) return [];
    // De-duplicated, so a hand-edited URL cannot produce two identical chips.
    return [...new Set(raw.split(","))].filter((value): value is T =>
      (allowed as readonly string[]).includes(value),
    );
  };

  const month = params.get("month");
  const [from, to = from] = (month ?? "").split("-");
  const validMonths = MONTHS as string[];
  const monthRange: [Month, Month] | null =
    from && validMonths.includes(from) && validMonths.includes(to) ? [from as Month, to as Month] : null;
  return {
    query: params.get("q") ?? "",
    regions: list("region", [
      "greater-cairo", "fayoum", "mediterranean", "nile-valley", "western-desert", "red-sea",
    ] as const),
    styles: list("style", [
      "history", "beach", "desert", "luxury", "family", "romantic", "nature",
    ] as const),
    durations: list("days", DURATION_BUCKETS),
    monthRange,
  };
}
