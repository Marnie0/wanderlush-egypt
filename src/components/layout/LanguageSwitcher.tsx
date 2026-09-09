import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";

/**
 * A two-state toggle rather than a dropdown: with exactly two languages, a
 * menu costs a click and tells the user nothing extra.
 */
export function LanguageSwitcher({
  className,
  onDark = false,
}: {
  className?: string;
  onDark?: boolean;
}) {
  const { t, i18n } = useTranslation();
  const isArabic = (i18n.resolvedLanguage ?? "en").startsWith("ar");
  const next = isArabic ? "en" : "ar";

  return (
    <button
      type="button"
      onClick={() => void i18n.changeLanguage(next)}
      lang={next}
      aria-label={isArabic ? t("language.switchToEnglish") : t("language.switchToArabic")}
      className={cn(
        "rounded-sm px-3 py-2 text-sm font-medium transition-colors duration-200",
        onDark ? "text-ivory/80 hover:text-ivory" : "text-charcoal-600 hover:text-charcoal-900",
        className,
      )}
    >
      {isArabic ? t("language.english") : t("language.arabic")}
    </button>
  );
}
