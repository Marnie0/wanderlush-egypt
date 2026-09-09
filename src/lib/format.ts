import { currencies } from "@content/index";
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
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number, language: string): string {
  return new Intl.NumberFormat(localeTag[lang(language)]).format(value);
}

export function formatDate(
  value: Date | string,
  language: string,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" },
): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat(localeTag[lang(language)], options).format(date);
}

export function formatMonthYear(value: string, language: string): string {
  const [year, month] = value.split("-").map(Number);
  return formatDate(new Date(year, (month ?? 1) - 1, 1), language, {
    month: "long",
    year: "numeric",
  });
}
