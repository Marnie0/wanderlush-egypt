import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";

export const TRIP_STEPS = ["basics", "places", "stay", "experiences", "itinerary"] as const;
export type TripStep = (typeof TRIP_STEPS)[number];

/**
 * Five steps, every one of them reachable at any time. The order is a
 * suggestion for a first pass, not a gate: someone who arrives from a
 * journey page already has an itinerary and should be able to go straight
 * to it.
 */
export function Stepper({
  current,
  onSelect,
  reached,
}: {
  current: TripStep;
  onSelect: (step: TripStep) => void;
  /** Steps the traveller has visited or that already hold something. */
  reached: Set<TripStep>;
}) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? "en";

  return (
    <nav aria-label={t("builder.stepsLabel")} className="overflow-x-auto">
      <ol className="flex min-w-max gap-2 sm:gap-4">
        {TRIP_STEPS.map((step, index) => {
          const isCurrent = step === current;
          const done = reached.has(step) && !isCurrent;
          return (
            <li key={step} className="flex items-center gap-2 sm:gap-4">
              <button
                type="button"
                onClick={() => onSelect(step)}
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-sm py-2 pe-3 ps-1 text-start transition-colors",
                  isCurrent ? "text-charcoal-900" : "text-ink-muted hover:text-charcoal-900",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm tabular-nums transition-colors",
                    isCurrent
                      ? "border-ember-600 bg-ember-600 text-ivory"
                      : done
                        ? "border-teal-700 bg-teal-700 text-ivory"
                        : "border-charcoal-800/25 text-charcoal-600 group-hover:border-charcoal-800/60",
                  )}
                >
                  {done ? "✓" : formatNumber(index + 1, language)}
                </span>
                <span className="text-sm font-medium">{t(`builder.steps.${step}`)}</span>
              </button>
              {index < TRIP_STEPS.length - 1 && (
                <span aria-hidden className="hidden h-px w-6 bg-line sm:block" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
