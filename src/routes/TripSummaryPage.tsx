import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { destinationBySlug } from "@content/destinations";
import { experienceBySlug } from "@content/experiences";
import { Container, Section } from "@/components/ui/Layout";
import { PageHeader } from "@/components/ui/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { TripWarnings } from "@/components/trip/TripWarnings";
import {
  ConversionNote,
  CostBar,
  CostLines,
  CostTotal,
  EstimateControls,
  EstimateDisclaimer,
  EstimateRules,
} from "@/components/trip/CostBreakdown";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useTripStore } from "@/lib/trip-store";
import { estimateTrip } from "@/lib/estimate";
import { stopsFromDays, tripWarnings } from "@/lib/trip-plan";
import { addDays, formatDate, formatMoney, formatNumber, pick } from "@/lib/format";
import { cn } from "@/lib/cn";

/**
 * The estimate in full: every line with what it is made of, the same figures
 * day by day, the rules that produced them, and the three choices that move
 * the number without touching the itinerary. Phase 7's booking request
 * starts from here.
 */
export function TripSummaryPage() {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? "en";
  usePageMeta(t("meta.tripSummary"), t("pages.tripSummary.intro"), { noindex: true });
  const trip = useTripStore();
  const money = (usd: number) => formatMoney(usd, trip.currency, language);

  const estimate = useMemo(
    () =>
      estimateTrip({
        days: trip.days,
        tier: trip.tier,
        adults: trip.adults,
        children: trip.children,
        tourStyle: trip.tourStyle,
        serviceIncluded: trip.serviceIncluded,
      }),
    [trip.days, trip.tier, trip.adults, trip.children, trip.tourStyle, trip.serviceIncluded],
  );
  const warnings = useMemo(
    () => tripWarnings({ days: trip.days, durationDays: trip.durationDays, month: trip.month, children: trip.children }),
    [trip.days, trip.durationDays, trip.month, trip.children],
  );
  const problems = warnings.filter((warning) => warning.severity === "warning");
  const stops = stopsFromDays(trip.days);

  if (trip.days.length === 0) {
    return (
      <>
        <PageHeader eyebrow={t("pages.tripSummary.eyebrow")} title={t("pages.tripSummary.title")} intro={t("pages.tripSummary.intro")} />
        <Section className="pt-0 lg:pt-0">
          <Container>
            <div className="border border-line bg-sand-50 px-6 py-14 text-center">
              <h2 className="font-display text-2xl text-charcoal-900">{t("estimate.page.emptyTitle")}</h2>
              <p className="mx-auto mt-3 max-w-md leading-relaxed text-charcoal-600">{t("estimate.page.emptyBody")}</p>
              <ButtonLink to="/trip-builder" className="mt-6">
                {t("estimate.page.emptyAction")}
              </ButtonLink>
            </div>
          </Container>
        </Section>
      </>
    );
  }

  const when = trip.startDate
    ? formatDate(trip.startDate, language, { day: "numeric", month: "short", year: "numeric" })
    : trip.month
      ? t(`months.${trip.month}`)
      : t("builder.summary.datesOpen");

  return (
    <>
      <PageHeader eyebrow={t("pages.tripSummary.eyebrow")} title={t("pages.tripSummary.title")} intro={t("pages.tripSummary.intro")} />
      <Section className="pt-0 lg:pt-0">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_22rem] lg:gap-14">
            {/* The breakdown first in the source, because it is what the page is for;
                on a wide screen it sits beside everything else, pinned. */}
            <aside className="lg:order-last">
              <div className="border border-line bg-sand-50 p-6 lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
                <p className="eyebrow text-ink-muted">{t("estimate.title")}</p>
                <CostBar estimate={estimate} className="mt-4" />
                <CostLines estimate={estimate} currency={trip.currency} tier={trip.tier} detailed className="mt-5" />
                <CostTotal estimate={estimate} currency={trip.currency} className="mt-3 border-t border-line pt-3" />
                <ConversionNote currency={trip.currency} className="mt-2 text-end" />
                <ButtonLink to="/booking" className="mt-6 w-full">
                  {t("estimate.page.request")}
                </ButtonLink>
                <p className="mt-2 text-center text-xs leading-relaxed text-ink-muted">{t("estimate.page.requestHint")}</p>
                <EstimateDisclaimer compact className="mt-4 border-t border-line pt-4" />
              </div>
            </aside>

            <div className="min-w-0 space-y-14">
              <section aria-labelledby="trip-recap">
                <h2 id="trip-recap" className="font-display text-2xl text-charcoal-900">{t("estimate.page.tripTitle")}</h2>
                <dl className="mt-5 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
                  <Row label={t("builder.summary.when")} value={when} />
                  <Row
                    label={t("builder.summary.travellers")}
                    value={
                      t("builder.summary.adults", { count: trip.adults }) +
                      (trip.children > 0 ? `${t("common.listSeparator")}${t("builder.summary.children", { count: trip.children })}` : "")
                    }
                  />
                  <Row
                    label={t("builder.summary.length")}
                    value={t(trip.days.length > trip.durationDays ? "builder.summary.plannedOver" : "builder.summary.planned", {
                      planned: formatNumber(trip.days.length, language),
                      duration: formatNumber(trip.durationDays, language),
                    })}
                  />
                  <Row label={t("builder.summary.stay")} value={t(`tiers.${trip.tier}`)} />
                  <Row label={t("estimate.controls.tours")} value={t(`estimate.controls.${trip.tourStyle}`)} />
                  <Row label={t("estimate.controls.currency")} value={trip.currency} />
                </dl>
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
                {problems.length > 0 && (
                  <div className="mt-6">
                    <p className="text-sm font-medium text-ember-700">{t("builder.summary.problems", { count: problems.length })}</p>
                    <TripWarnings warnings={problems} linked className="mt-2" />
                  </div>
                )}
                <div className="mt-6 flex flex-wrap gap-3">
                  <ButtonLink to="/trip-builder?step=itinerary" variant="secondary" size="sm">
                    {t("estimate.page.editTrip")}
                  </ButtonLink>
                </div>
              </section>

              <section aria-labelledby="estimate-adjust">
                <h2 id="estimate-adjust" className="font-display text-2xl text-charcoal-900">{t("estimate.controls.title")}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">{t("estimate.controls.hint")}</p>
                <EstimateControls
                  idPrefix="page"
                  tourStyle={trip.tourStyle}
                  serviceIncluded={trip.serviceIncluded}
                  currency={trip.currency}
                  onChange={trip.setPricing}
                  className="mt-6"
                />
              </section>

              <section aria-labelledby="estimate-days">
                <h2 id="estimate-days" className="font-display text-2xl text-charcoal-900">{t("estimate.page.daysTitle")}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">{t("estimate.page.daysHint")}</p>
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full min-w-[40rem] border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-charcoal-800/40 text-start text-xs uppercase tracking-wide text-ink-muted">
                        <th scope="col" className="py-2 pe-4 text-start font-medium">{t("estimate.page.day")}</th>
                        <th scope="col" className="py-2 pe-4 text-start font-medium">{t("estimate.page.plan")}</th>
                        <th scope="col" className="py-2 pe-4 text-end font-medium">{t("estimate.accommodation")}</th>
                        <th scope="col" className="py-2 pe-4 text-end font-medium">{t("estimate.experiences")}</th>
                        <th scope="col" className="py-2 pe-4 text-end font-medium">{t("estimate.transport")}</th>
                        <th scope="col" className="py-2 text-end font-medium">{t("estimate.page.dayTotal")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trip.days.map((day, index) => {
                        const destination = destinationBySlug.get(day.destinationSlug);
                        const cost = estimate.days[index];
                        const names = day.items.flatMap((item) => {
                          if (item.kind === "experience") {
                            const experience = item.experienceSlug ? experienceBySlug.get(item.experienceSlug) : undefined;
                            return experience ? [pick(experience.name, language)] : [];
                          }
                          return item.note ? [item.note] : [t(`builder.itinerary.${item.kind === "free" ? "freeTime" : "transfer"}`)];
                        });
                        return (
                          <tr key={day.id} className="border-b border-line align-top">
                            <th scope="row" className="py-3 pe-4 text-start font-normal">
                              <span className="block text-charcoal-900">{t("builder.itinerary.dayLabel", { day: formatNumber(index + 1, language) })}</span>
                              <span className="block text-xs text-ink-muted">
                                {trip.startDate && `${formatDate(addDays(trip.startDate, index), language, { weekday: "short", day: "numeric", month: "short" })} · `}
                                {destination ? pick(destination.name, language) : day.destinationSlug}
                              </span>
                            </th>
                            <td className="py-3 pe-4 text-charcoal-700">
                              {names.length > 0 ? names.join(t("common.listSeparator")) : <span className="text-ink-muted">{t("estimate.page.freeDay")}</span>}
                            </td>
                            <Amount value={cost.accommodation} money={money} />
                            <Amount value={cost.experiences} money={money} />
                            <Amount value={cost.transport} money={money} />
                            <Amount value={cost.total} money={money} strong last />
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="text-charcoal-900">
                        <th scope="row" colSpan={2} className="py-3 pe-4 text-start font-medium">{t("estimate.subtotal")}</th>
                        <Amount value={estimate.accommodation} money={money} strong />
                        <Amount value={estimate.experiences} money={money} strong />
                        <Amount value={estimate.transport} money={money} strong />
                        <Amount value={estimate.subtotal} money={money} strong last />
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-ink-muted">{t("estimate.page.tableNote")}</p>
              </section>

              <EstimateRules />
              <EstimateDisclaimer />

              <div className="flex flex-wrap items-center gap-4 border-t border-line pt-6">
                <ButtonLink to="/booking">{t("estimate.page.request")}</ButtonLink>
                <Link to="/trip-builder?step=itinerary" className="text-sm text-charcoal-800 underline underline-offset-4 hover:text-ember-700">
                  {t("estimate.page.editTrip")}
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line pb-2">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="text-end text-charcoal-800">{value}</dd>
    </div>
  );
}

function Amount({ value, money, strong, last }: { value: number; money: (usd: number) => string; strong?: boolean; last?: boolean }) {
  return (
    <td className={cn("py-3 text-end tabular-nums", !last && "pe-4", strong ? "text-charcoal-900" : value === 0 ? "text-ink-muted" : "text-charcoal-800")}>
      {value === 0 && !strong ? "–" : money(value)}
    </td>
  );
}
