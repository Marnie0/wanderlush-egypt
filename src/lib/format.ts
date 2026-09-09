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

export function formatDate(
  value: Date | string,
  language: string,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" },
): string {
  const date = typeof value === "string" ? new Date(value) : value;
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
 * Experiences run from 90 minutes to four days. Anything past a long day is
 * rounded up to whole days, so an overnight camp reads as two days, not one.
 */
export function formatDuration(
  minutes: number,
  t: (key: string, options?: Record<string, unknown>) => string,
): string {
  if (minutes < 60) return t("common.minutes", { count: minutes });
  const hours = minutes / 60;
  if (hours < 20) return t("common.hours", { count: Math.round(hours) });
  return t("common.days", { count: Math.ceil(hours / 24) });
}

export function formatMonthYear(value: string, language: string): string {
  const [year, month] = value.split("-").map(Number);
  return formatDate(new Date(year, (month ?? 1) - 1, 1), language, {
    month: "long",
    year: "numeric",
  });
}
