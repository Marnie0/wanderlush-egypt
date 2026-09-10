import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";

export const TRIP_STEPS = ["basics", "places", "stay", "experiences", "itinerary"] as const;
export type TripStep = (typeof TRIP_STEPS)[number];

/**
 * A row of numbered steps, every one of them reachable at any time: the
 * order is a suggestion for a first pass, not a gate. The tick is stricter
 * than the click, though: a step is only ticked once it and every step
 * before it are done, so all ticks mean the thing is ready, not looked at.
 * Used by the trip builder and the booking request.
 */
export function Stepper<Step extends string>({
  steps,
  label,
  current,
  onSelect,
  reached,
  navLabel,
}: {
  steps: readonly Step[];
  label: (step: Step) => string;
  current: Step;
  onSelect: (step: Step) => void;
  /** Steps that are done, with everything before them done too. */
  reached: Set<Step>;
  navLabel: string;
}) {
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? "en";
  const navRef = useRef<HTMLElement>(null);

  // Five steps do not fit a phone; the current one must not be the one off-screen.
  useEffect(() => {
    navRef.current
      ?.querySelector<HTMLElement>('[aria-current="step"]')
      ?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [current]);

  return (
    <nav ref={navRef} aria-label={navLabel} className="overflow-x-auto">
      <ol className="flex min-w-max gap-2 sm:gap-4">
        {steps.map((step, index) => {
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
                <span className="text-sm font-medium">{label(step)}</span>
              </button>
              {index < steps.length - 1 && (
                <span aria-hidden className="hidden h-px w-6 bg-line sm:block" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
