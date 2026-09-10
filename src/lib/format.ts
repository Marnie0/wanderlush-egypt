import { currencies } from "@content/currencies";
import type { Localized, LocalizedList } from "@content/types";

export type Language = "en" | "ar";

const localeTag: Record<Language, string> = {
  en: "en-GB",
  // Arabic numerals rather than Eastern Arabic digits: prices and dates stay
  // legible to the widest Arabic-reading audience and match Egyptian usage.
  ar: "ar-EG-u-nu-latn",
};

/** Pull the active language out of a localised content field. */
export function pick(value: Localized, language: string): string {
  return language.startsWith("ar") ? value.ar : value.en;
}

export function pickList(value: LocalizedList, language: string): string[] {
  return language.startsWith("ar") ? value.ar : value.en;
}

export function lang(language: string): Language {
  return language.startsWith("ar") ? "ar" : "en";
}

export function convertFromUsd(amountUsd: number, currencyCode: string): number {
  const currency = currencies.find((c) => c.code === currencyCode) ?? currencies[0];
  return amountUsd * currency.perUsd;
}

/** Whole-unit money. Estimates are never shown to the cent. */
export function formatMoney(
  amountUsd: number,
  currencyCode: string,
  language: string,
): string {
  const value = convertFromUsd(amountUsd, currencyCode);
  return new Intl.NumberFormat(localeTag[lang(language)], {
    style: "currency",
    currency: currencyCode,
    // "$95", not "US$95": the currency is stated in the selector, not repeated
    // in every price on the page.
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number, language: string): string {
  return new Intl.NumberFormat(localeTag[lang(language)]).format(value);
}

/** Ratings always carry one decimal, so 5 does not read as a different scale. */
export function formatRating(value: number, language: string): string {
  return new Intl.NumberFormat(localeTag[lang(language)], {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * "2027-03-01" as a local date. `new Date("2027-03-01")` is UTC midnight,
 * which is still the evening of 28 February for anyone west of Greenwich.
 */
export function parseIsoDate(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return new Date(value);
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

export function formatDate(
  value: Date | string,
  language: string,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" },
): string {
  const date = typeof value === "string" ? parseIsoDate(value) : value;
  return new Intl.DateTimeFormat(localeTag[lang(language)], options).format(date);
}

/**
 * "3–5 days", not "3 days–5 days". Ranges use their own string because
 * Arabic's dual form ("يومان") carries no numeral and cannot end a range.
 */
export function formatDayRange(
  min: number,
  max: number,
  t: (key: string, options?: Record<string, unknown>) => string,
  language: string,
): string {
  if (min === max) return t("common.days", { count: min });
  return t("common.dayRange", {
    min: formatNumber(min, language),
    max: formatNumber(max, language),
  });
}

/**
 * Experiences run from 90 minutes to four days. Hours keep their half, so a
 * ninety-minute show is not sold as two hours. Anything past a long day is
 * rounded up to whole days, so an overnight camp reads as two days, not one.
 */
export function formatDuration(
  minutes: number,
  t: (key: string, options?: Record<string, unknown>) => string,
): string {
  if (minutes < 60) return t("common.minutes", { count: minutes });
  const hours = minutes / 60;
  if (hours < 20) return t("common.hours", { count: Math.round(hours * 2) / 2 });
  return t("common.days", { count: Math.ceil(hours / 24) });
}

const MONTH_ORDER = [
  "jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec",
];

/**
 * "October – April", or "September – June" for a coast that only loses high
 * summer, or "All year". Joining the first and last month in the list would
 * hide the gap in the middle and print "January – December" for a place
 * that is unbearable in July.
 */
export function formatMonthRuns(
  months: readonly string[],
  t: (key: string, options?: Record<string, unknown>) => string,
): string {
  const set = new Set(months);
  if (set.size >= 12) return t("destination.allYear");
  if (set.size === 0) return "";
  // Start just after a gap, so a season that wraps the new year reads as one run.
  let start = MONTH_ORDER.findIndex(
    (month, index) => set.has(month) && !set.has(MONTH_ORDER[(index + 11) % 12]),
  );
  if (start < 0) start = 0;
  const runs: string[][] = [];
  for (let step = 0; step < 12; step++) {
    const month = MONTH_ORDER[(start + step) % 12];
    if (!set.has(month)) continue;
    const previous = MONTH_ORDER[(start + step + 11) % 12];
    const last = runs[runs.length - 1];
    if (last && set.has(previous) && step > 0) last.push(month);
    else runs.push([month]);
  }
  return runs
    .map((run) =>
      run.length === 1
        ? t(`months.${run[0]}`)
        : `${t(`months.${run[0]}`)} – ${t(`months.${run[run.length - 1]}`)}`,
    )
    .join(t("common.listSeparator"));
}

/**
 * Lower-cases, folds simple English plurals ("pyramids" finds "Great
 * Pyramid"), and folds the Arabic spellings a visitor may or may not type:
 * the hamza forms of alef, the dotted taa marbuta and the final yaa, and the
 * short-vowel marks that content carries but nobody types into a search box.
 * Applied to both sides of a match, so it only has to be consistent.
 */
export function normalizeSearch(text: string): string {
  return text
    .toLowerCase()
    .replace(/\b([a-z]{3,})s\b/g, "$1")
    .replace(/[\u064B-\u0652\u0640]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي");
}

export function formatMonthYear(value: string, language: string): string {
  const [year, month] = value.split("-").map(Number);
  if (!Number.isFinite(year)) return value;
  return formatDate(new Date(year, (Number.isFinite(month) ? month : 1) - 1, 1), language, {
    month: "long",
    year: "numeric",
  });
}
