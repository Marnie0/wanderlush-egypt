import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { switchLanguage as loadAndSwitch } from "@/i18n";
import { cn } from "@/lib/cn";

/**
 * A two-state toggle rather than a dropdown: with exactly two languages, a
 * menu costs a click and tells the user nothing extra. The visible word is
 * the accessible name; it is already in the language it switches to, and a
 * label in the other language would not contain it.
 */
export function LanguageSwitcher({
  className,
  onDark = false,
}: {
  className?: string;
  onDark?: boolean;
}) {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const isArabic = (i18n.resolvedLanguage ?? "en").startsWith("ar");
  const next = isArabic ? "en" : "ar";

  const switchLanguage = () => {
    void loadAndSwitch(next);
    // A shared link carries ?lng=, and the detector reads the URL before it
    // reads the saved choice. Left in place, one reload would flip the page
    // straight back to the language the visitor just left.
    if (searchParams.has("lng")) {
      const rest = new URLSearchParams(searchParams);
      rest.delete("lng");
      setSearchParams(rest, { replace: true });
    }
  };

  return (
    <button
      type="button"
      onClick={switchLanguage}
      lang={next}
      title={isArabic ? t("language.switchToEnglish") : t("language.switchToArabic")}
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
