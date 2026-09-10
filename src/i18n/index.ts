import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en.json";

export const supportedLanguages = ["en", "ar"] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

export const languageDirection: Record<SupportedLanguage, "ltr" | "rtl"> = {
  en: "ltr",
  ar: "rtl",
};

export const STORAGE_KEY = "wanderlush.language";

/**
 * English ships in the bundle; Arabic is a chunk of its own, fetched before
 * the first render for an Arabic visitor and on the first switch for anyone
 * else. Every English page load is a locale file lighter for it.
 */
const bundles: Record<SupportedLanguage, () => Promise<{ default: typeof en }>> = {
  en: () => Promise.resolve({ default: en }),
  ar: () => import("./locales/ar.json"),
};

export async function loadLanguage(language: SupportedLanguage): Promise<void> {
  if (i18n.hasResourceBundle(language, "translation")) return;
  const bundle = await bundles[language]();
  i18n.addResourceBundle(language, "translation", bundle.default, true, true);
}

/** The switcher's entry point: the bundle first, then the change, so nothing renders as keys. */
export async function switchLanguage(language: SupportedLanguage): Promise<void> {
  await loadLanguage(language);
  await i18n.changeLanguage(language);
}

const init = i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
    },
    partialBundledLanguages: true,
    fallbackLng: "en",
    supportedLngs: [...supportedLanguages],
    nonExplicitSupportedLngs: true,
    detection: {
      // `?lng=ar` wins, so a language can be linked to and shared.
      order: ["querystring", "localStorage", "navigator", "htmlTag"],
      lookupQuerystring: "lng",
      lookupLocalStorage: STORAGE_KEY,
      caches: ["localStorage"],
    },
    interpolation: { escapeValue: false },
  });

/**
 * Direction is applied to the document rather than a wrapper element so that
 * portals, dialogs and scrollbars all inherit it. Called once on boot and
 * again on every language change.
 */
export function applyDocumentLanguage(language: string) {
  const lang = (supportedLanguages as readonly string[]).includes(language)
    ? (language as SupportedLanguage)
    : "en";
  const root = document.documentElement;
  root.lang = lang;
  root.dir = languageDirection[lang];
}

/**
 * Resolves once the detected language has its strings, so the app can wait
 * for it and never paint English under an Arabic visitor. `resolvedLanguage`
 * only counts languages with a bundle, so the raw detection is what to read.
 */
export const ready: Promise<void> = init.then(async () => {
  if ((i18n.language ?? "").startsWith("ar")) {
    await loadLanguage("ar");
    // Re-resolve now that the bundle exists; before this, "ar" fell back to English.
    await i18n.changeLanguage(i18n.language);
  }
  applyDocumentLanguage(i18n.resolvedLanguage ?? "en");
});
// The event carries the raw code, which can be regional ("ar-EG"); the
// resolved language is always one of the two the site supports.
i18n.on("languageChanged", () => applyDocumentLanguage(i18n.resolvedLanguage ?? "en"));

export default i18n;
