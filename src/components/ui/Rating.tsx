import { useTranslation } from "react-i18next";
import { formatNumber, formatRating } from "@/lib/format";
import { cn } from "@/lib/cn";

/**
 * A rating and the number of reviews behind it. The count is not decoration:
 * 4.9 from twelve people and 4.9 from four hundred are different claims.
 */
export function Rating({
  value,
  count,
  className,
}: {
  value: number;
  count: number;
  className?: string;
}) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? "en";

  return (
    <span
      className={cn("inline-flex items-baseline gap-1.5 text-sm text-charcoal-700", className)}
      aria-label={t("experience.ratingLabel", {
        rating: formatRating(value, language),
        count,
      })}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
        className="translate-y-0.5 text-gold-500"
      >
        <path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z" />
      </svg>
      <span aria-hidden>{formatRating(value, language)}</span>
      <span aria-hidden className="text-ink-muted">
        ({formatNumber(count, language)})
      </span>
    </span>
  );
}
