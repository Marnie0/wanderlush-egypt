import { memo } from "react";
import { useTranslation } from "react-i18next";
import { destinationBySlug } from "@content/destinations";
import { experienceBySlug } from "@content/experiences";
import type { RequestEstimate, RequestTrip } from "../../../shared/booking";
import { addDays, formatDate, formatMoney, formatNumber, pick } from "@/lib/format";
import { cn } from "@/lib/cn";

/**
 * The trip as it will be sent, readable in one pass: when, who, where each
 * day, what it costs. Built from the request snapshot rather than the live
 * store, so the same block renders on the form, on the confirmation and on
 * paper, and always shows what was actually sent.
 */
export const TripReview = memo(function TripReview({
  trip,
  estimate,
  compact = false,
  className,
}: {
  trip: RequestTrip;
  estimate: RequestEstimate;
  compact?: boolean;
  className?: string;
}) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? "en";
  const money = (usd: number) => formatMoney(usd, trip.currency, language);
  const dateOptions: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };
  const when = trip.startDate
    ? t("booking.summary.dates", {
        start: formatDate(trip.startDate, language, dateOptions),
        end: formatDate(addDays(trip.startDate, Math.max(0, trip.days.length - 1)), language, dateOptions),
      })
    : trip.month
      ? t(`months.${trip.month}`)
      : t("builder.summary.datesOpen");
  const travellers =
    t("builder.summary.adults", { count: trip.adults }) +
    (trip.children > 0 ? `${t("common.listSeparator")}${t("builder.summary.children", { count: trip.children })}` : "");

  return (
    <div className={className}>
      <dl className={cn("grid gap-x-8 gap-y-2 text-sm", compact ? "grid-cols-1" : "sm:grid-cols-2")}>
        <Row label={t("builder.summary.when")} value={when} />
        <Row label={t("builder.summary.travellers")} value={travellers} />
        <Row label={t("builder.summary.length")} value={t("common.days", { count: trip.days.length })} />
        <Row label={t("builder.summary.stay")} value={t(`tiers.${trip.tier}`)} />
        <Row label={t("estimate.controls.tours")} value={t(`estimate.controls.${trip.tourStyle}`)} />
      </dl>

      <ol className={cn("mt-5 divide-y divide-line border-y border-line", compact && "text-sm")}>
        {trip.days.map((day, index) => {
          const destination = destinationBySlug.get(day.destinationSlug);
          const experiences = day.experienceSlugs.map((slug) => experienceBySlug.get(slug)).filter(Boolean);
          return (
            <li key={index} className={cn("flex gap-4", compact ? "py-2" : "py-3")}>
              <span className="w-14 shrink-0 text-xs text-ink-muted tabular-nums">
                {t("builder.itinerary.dayLabel", { day: formatNumber(index + 1, language) })}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-charcoal-900">
                  {destination ? pick(destination.name, language) : day.destinationSlug}
                  {trip.startDate && (
                    <span className="ms-2 text-xs text-ink-muted">
                      {formatDate(addDays(trip.startDate, index), language, { weekday: "short", day: "numeric", month: "short" })}
                    </span>
                  )}
                </p>
                {experiences.length === 0 && day.notes.length === 0 ? (
                  <p className="text-xs text-ink-muted">{t("booking.summary.freeDay")}</p>
                ) : (
                  <ul className="mt-0.5 space-y-0.5 text-sm text-charcoal-700">
                    {experiences.map((experience) => (
                      <li key={experience!.slug}>{pick(experience!.name, language)}</li>
                    ))}
                    {day.notes.map((note, i) => (
                      <li key={`note-${i}`} className="text-ink-muted">
                        {note}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <dl className="mt-5 space-y-1.5 text-sm">
        <Amount label={t("estimate.accommodation")} value={money(estimate.accommodation)} />
        <Amount label={t("estimate.experiences")} value={money(estimate.experiences)} />
        <Amount label={t("estimate.transport")} value={money(estimate.transport)} />
        <Amount
          label={t("estimate.serviceFee")}
          value={trip.serviceIncluded ? money(estimate.serviceFee) : t("estimate.feeExcluded")}
          muted={!trip.serviceIncluded}
        />
        <div className="flex items-baseline justify-between gap-4 border-t border-line pt-2">
          <dt className="font-medium text-charcoal-900">{t("estimate.total")}</dt>
          <dd className={cn("font-display text-charcoal-900 tabular-nums", compact ? "text-2xl" : "text-3xl")}>{money(estimate.total)}</dd>
        </div>
        <div className="flex justify-between gap-4 text-ink-muted">
          <dt>{t("booking.summary.perTraveller")}</dt>
          <dd className="tabular-nums">{money(estimate.perPerson)}</dd>
        </div>
      </dl>
      <p className="mt-3 text-xs leading-relaxed text-ink-muted">{t("booking.summary.note")}</p>
    </div>
  );
});

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line pb-1.5">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="text-end text-charcoal-800">{value}</dd>
    </div>
  );
}

function Amount({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-charcoal-700">{label}</dt>
      <dd className={cn("tabular-nums", muted ? "text-ink-muted" : "text-charcoal-800")}>{value}</dd>
    </div>
  );
}
