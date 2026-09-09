import { useTranslation } from "react-i18next";
import { languageDirection, type SupportedLanguage } from "@/i18n";

/** Reading direction for the active language, for motion that must mirror. */
export function useDirection() {
  const { i18n } = useTranslation();
  const language = (i18n.resolvedLanguage ?? "en").startsWith("ar") ? "ar" : "en";
  const dir = languageDirection[language as SupportedLanguage];
  return { dir, isRtl: dir === "rtl", language } as const;
}
