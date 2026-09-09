import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en.json";
import ar from "./locales/ar.json";

export const supportedLanguages = ["en", "ar"] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

export const languageDirection: Record<SupportedLanguage, "ltr" | "rtl"> = {
  en: "ltr",
  ar: "rtl",
};

export const STORAGE_KEY = "wanderlush.language";

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
    },
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

applyDocumentLanguage(i18n.resolvedLanguage ?? "en");
i18n.on("languageChanged", applyDocumentLanguage);

export default i18n;
