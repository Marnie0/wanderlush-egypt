import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { destinationBySlug } from "@content/destinations";
import { Button } from "@/components/ui/Button";
import { CostLines, CostTotal, EstimateControls, EstimateDisclaimer } from "./CostBreakdown";
import { ConfirmNotice } from "./ConfirmNotice";
import type { TripStep } from "@/lib/trip-plan";
import { formatDate, formatNumber, pick } from "@/lib/format";
import type { TripEstimate } from "@/lib/estimate";
import type { TripWarning } from "@/lib/trip-plan";
import type { TripState } from "@/lib/trip-store";
import { stopsFromDays } from "@/lib/trip-plan";
import { cn } from "@/lib/cn";

/**
 * The running total and the shape of the trip, always in view. On a wide
 * screen it is the sticky column beside the step; on a phone the builder
 * shows the number in a bar along the bottom, with this breakdown a tap away.
 */
export function TripSummary({
  trip,
  estimate,
  warnings,
  unconfirmed,
  nextLabel,
  onNext,
  onReset,
  className,
}: {
  trip: Pick<TripState, "startDate" | "month" | "adults" | "children" | "durationDays" | "currency" | "days" | "tier" | "tourStyle" | "serviceIncluded" | "setPricing">;
  estimate: TripEstimate;
  warnings: TripWarning[];
  /** Priced steps whose defaults the visitor has not seen. */
  unconfirmed: TripStep[];
  nextLabel: string | null;
  onNext: () => void;
  onReset: () => void;
  className?: string;
}) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? "en";
  const stops = stopsFromDays(trip.days);
  const problems = warnings.filter((w) => w.severity === "warning");
  const shownProblems = problems.slice(0, 3);
  const when = trip.startDate
    ? formatDate(trip.startDate, language, { day: "numeric", month: "short", year: "numeric" })
    : trip.month
      ? t(`months.${trip.month}`)
      : t("builder.summary.datesOpen");

  return (
    <div className={cn("border border-line bg-sand-50", className)}>
      <div className="p-6">
        <p className="eyebrow text-ink-muted">{t("builder.summary.title")}</p>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">{t("builder.summary.when")}</dt>
            <dd className="text-end text-charcoal-800">{when}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">{t("builder.summary.travellers")}</dt>
            <dd className="text-end text-charcoal-800">
              {t("builder.summary.adults", { count: trip.adults })}
              {trip.children > 0 && `${t("common.listSeparator")}${t("builder.summary.children", { count: trip.children })}`}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">{t("builder.summary.length")}</dt>
            <dd
              className={cn(
                "text-end",
                trip.days.length > trip.durationDays ? "text-ember-700" : "text-charcoal-800",
              )}
            >
              {t(trip.days.length > trip.durationDays ? "builder.summary.plannedOver" : "builder.summary.planned", {
                planned: formatNumber(trip.days.length, language),
                duration: formatNumber(trip.durationDays, language),
              })}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">{t("builder.summary.stay")}</dt>
            <dd className="text-end text-charcoal-800">{t(`tiers.${trip.tier}`)}</dd>
          </div>
        </dl>

        {stops.length > 0 && (
          <ol className="mt-5 flex flex-wrap gap-1.5">
            {stops.map((stop, index) => {
              const destination = destinationBySlug.get(stop.destinationSlug);
              return (
                <li
                  key={`${stop.destinationSlug}-${index}`}
                  className="inline-flex items-center gap-1.5 border border-line bg-canvas px-2.5 py-1 text-xs text-charcoal-700"
                >
                  <span className="text-ink-muted tabular-nums">{formatNumber(index + 1, language)}</span>
                  {destination ? pick(destination.name, language) : stop.destinationSlug}
                  <span className="text-ink-muted">· {t("common.days", { count: stop.nights })}</span>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <div className="border-t border-line p-6">
        <ConfirmNotice unconfirmed={unconfirmed} trip={trip} compact className="mb-4" />
        <CostLines estimate={estimate} currency={trip.currency} tier={trip.tier} />
        <CostTotal estimate={estimate} currency={trip.currency} size="md" className="mt-3 border-t border-line pt-3" />
        <EstimateControls
          compact
          idPrefix="aside"
          tourStyle={trip.tourStyle}
          serviceIncluded={trip.serviceIncluded}
          currency={trip.currency}
          onChange={trip.setPricing}
          className="mt-5 border-t border-line pt-4"
        />
        <EstimateDisclaimer compact className="mt-4" />
        <Link
          to="/trip-summary"
          className="mt-2 inline-block text-sm text-charcoal-800 underline decoration-charcoal-800/30 underline-offset-4 transition-colors hover:text-ember-700"
        >
          {t("estimate.fullLink")}
        </Link>
        {/* The problems themselves, not a count of them: each one names the
            day and links to it, so fixing it is one click away. */}
        {problems.length > 0 && (
          <div className="mt-4 border-t border-line pt-4">
            <p className="text-sm font-medium text-ember-700" aria-live="polite">
              {t("builder.summary.problems", { count: problems.length })}
            </p>
            <ul className="mt-2 space-y-2">
              {shownProblems.map((warning, index) => (
                <li key={`${warning.kind}-${warning.dayIndex ?? "trip"}-${index}`} className="text-sm leading-snug text-charcoal-700">
                  <Link
                    to={`/trip-builder?step=itinerary${warning.dayIndex !== undefined ? `#day-${warning.dayIndex + 1}` : ""}`}
                    className="underline decoration-ember-600/40 underline-offset-4 transition-colors hover:text-ember-700"
                  >
                    {t(`builder.warnings.${warning.kind}`, warning.params)}
                  </Link>
                </li>
              ))}
              {problems.length > shownProblems.length && (
                <li className="text-sm text-ink-muted">
                  {t("builder.summary.moreProblems", { count: problems.length - shownProblems.length })}
                </li>
              )}
            </ul>
          </div>
        )}
        {nextLabel && (
          <Button className="mt-5 w-full" onClick={onNext}>
            {nextLabel}
          </Button>
        )}
        <button
          type="button"
          onClick={onReset}
          className="mt-4 w-full text-center text-sm text-ink-muted underline decoration-charcoal-800/30 underline-offset-4 transition-colors hover:text-charcoal-900"
        >
          {t("builder.reset.action")}
        </button>
      </div>
    </div>
  );
}
