import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import type { TripWarning } from "@/lib/trip-plan";
import { cn } from "@/lib/cn";

/**
 * What a specialist would write back about, said now. Warnings are things
 * to fix; notes are things to know.
 */
export function TripWarnings({
  warnings,
  linked = false,
  className,
}: {
  warnings: TripWarning[];
  /** Away from the itinerary, each line links to the day it is about. */
  linked?: boolean;
  className?: string;
}) {
  const { t } = useTranslation();
  const shown = warnings.filter((warning) => warning.kind !== "empty");
  if (shown.length === 0) return null;
  return (
    <ul className={cn("space-y-2", className)} aria-label={t("builder.warnings.label")}>
      {shown.map((warning, index) => (
        <li
          key={`${warning.kind}-${warning.dayIndex ?? "trip"}-${index}`}
          className={cn(
            "flex gap-3 border-s-2 px-4 py-2.5 text-sm leading-relaxed",
            warning.severity === "warning"
              ? "border-ember-600 bg-ember-50 text-ember-800"
              : "border-gold-500 bg-gold-50 text-gold-800",
          )}
        >
          <span aria-hidden className="mt-0.5 shrink-0 text-xs font-semibold uppercase tracking-wide">
            {warning.severity === "warning" ? t("builder.warnings.warning") : t("builder.warnings.note")}
          </span>
          {linked ? (
            <Link
              to={`/trip-builder?step=itinerary${warning.dayIndex !== undefined ? `#day-${warning.dayIndex + 1}` : ""}`}
              className="underline decoration-current/40 underline-offset-4 hover:decoration-current"
            >
              {t(`builder.warnings.${warning.kind}`, warning.params)}
            </Link>
          ) : (
            <span>{t(`builder.warnings.${warning.kind}`, warning.params)}</span>
          )}
        </li>
      ))}
    </ul>
  );
}
