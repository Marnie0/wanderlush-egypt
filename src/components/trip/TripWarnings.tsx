import { useTranslation } from "react-i18next";
import type { TripWarning } from "@/lib/trip-plan";
import { cn } from "@/lib/cn";

/**
 * What a specialist would write back about, said now. Warnings are things
 * to fix; notes are things to know.
 */
export function TripWarnings({ warnings, className }: { warnings: TripWarning[]; className?: string }) {
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
          <span>{t(`builder.warnings.${warning.kind}`, warning.params)}</span>
        </li>
      ))}
    </ul>
  );
}
