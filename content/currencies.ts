import type { CurrencyOption } from "./types";

/**
 * Static indicative rates. Live FX is deliberately out of scope: every price
 * on the site is an estimate and is labelled as one.
 */
export const currencies: CurrencyOption[] = [
  { code: "USD", symbol: { en: "$", ar: "$" }, name: { en: "US Dollar", ar: "دولار أمريكي" }, perUsd: 1 },
  { code: "EUR", symbol: { en: "€", ar: "€" }, name: { en: "Euro", ar: "يورو" }, perUsd: 0.85 },
  { code: "GBP", symbol: { en: "£", ar: "£" }, name: { en: "British Pound", ar: "جنيه إسترليني" }, perUsd: 0.74 },
  { code: "EGP", symbol: { en: "E£", ar: "ج.م" }, name: { en: "Egyptian Pound", ar: "جنيه مصري" }, perUsd: 48.5 },
  { code: "AED", symbol: { en: "AED", ar: "د.إ" }, name: { en: "UAE Dirham", ar: "درهم إماراتي" }, perUsd: 3.67 },
  { code: "SAR", symbol: { en: "SAR", ar: "ر.س" }, name: { en: "Saudi Riyal", ar: "ريال سعودي" }, perUsd: 3.75 },
];

export const defaultCurrency = "USD";
