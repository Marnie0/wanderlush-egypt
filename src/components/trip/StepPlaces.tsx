import { useTranslation } from "react-i18next";
import { destinations, destinationBySlug } from "@content/destinations";
import { SmartImage } from "@/components/ui/SmartImage";
import { EgyptMap } from "@/components/ui/EgyptMap";
import { Counter } from "./Counter";
import { TransportIcon } from "./TransportIcon";
import { useTripStore } from "@/lib/trip-store";
import { stopsFromDays, LONG_TRANSFER_HOURS } from "@/lib/trip-plan";
import { findRoute, distanceKm } from "@/lib/transport";
import { formatDayRange, formatNumber, pick } from "@/lib/format";
import { cn } from "@/lib/cn";

/**
 * Pick the places, give each its nights, put them in order. The transfer
 * between each pair is spelled out here, before anything is planned on top
 * of it, because a nine-hour drive changes what the next day can hold.
 */
export function StepPlaces() {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? "en";
  const days = useTripStore((state) => state.days);
  const durationDays = useTripStore((state) => state.durationDays);
  const month = useTripStore((state) => state.month);
  const toggleDestination = useTripStore((state) => state.toggleDestination);
  const setNights = useTripStore((state) => state.setNights);
  const moveStop = useTripStore((state) => state.moveStop);
  const stops = stopsFromDays(days);
  const selected = new Set(stops.map((stop) => stop.destinationSlug));
  const remaining = durationDays - days.length;

  return (
    <div className="space-y-12">
      <section>
        <h2 className="font-display text-2xl text-charcoal-900">{t("builder.places.chooseTitle")}</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">{t("builder.places.chooseHint")}</p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {destinations.map((destination) => {
            const active = selected.has(destination.slug);
            const inSeason = !month || destination.bestSeason.includes(month);
            return (
              <li key={destination.slug}>
                <button
                  type="button"
                  onClick={() => toggleDestination(destination.slug)}
                  aria-pressed={active}
                  className={cn(
                    "group flex w-full items-stretch gap-4 border text-start transition-colors",
                    active
                      ? "border-charcoal-800 bg-canvas"
                      : "border-line bg-canvas hover:border-charcoal-800/50",
                  )}
                >
                  <SmartImage
                    src={destination.heroImage.src}
                    alt=""
                    accent={destination.accent}
                    sizes="8rem"
                    className="w-28 shrink-0"
                  />
                  <span className="flex min-w-0 flex-1 flex-col justify-center py-3 pe-4">
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-display text-lg text-charcoal-900">
                        {pick(destination.name, language)}
                      </span>
                      <span
                        aria-hidden
                        className={cn(
                          "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs transition-colors",
                          active
                            ? "border-ember-600 bg-ember-600 text-ivory"
                            : "border-charcoal-800/30 text-transparent group-hover:border-charcoal-800/60",
                        )}
                      >
                        ✓
                      </span>
                    </span>
                    <span className="mt-1 text-xs text-ink-muted">
                      {t("builder.places.recommended", {
                        days: formatDayRange(destination.recommendedDays.min, destination.recommendedDays.max, t, language),
                      })}
                    </span>
                    {!inSeason && (
                      <span className="mt-1 text-xs text-ember-700">{t("builder.places.outOfSeason")}</span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {stops.length > 0 && (
        <section>
          <h2 className="font-display text-2xl text-charcoal-900">{t("builder.places.routeTitle")}</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            {remaining > 0
              ? t("builder.places.daysLeft", { count: remaining })
              : remaining < 0
                ? t("builder.places.daysOver", { count: -remaining })
                : t("builder.places.daysExact")}
          </p>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_18rem]">
            <ol className="space-y-3">
              {stops.map((stop, index) => {
                const destination = destinationBySlug.get(stop.destinationSlug);
                if (!destination) return null;
                const previous = index > 0 ? destinationBySlug.get(stops[index - 1].destinationSlug) : undefined;
                const route = previous ? findRoute(previous.slug, destination.slug) : null;
                const km = previous ? distanceKm(previous.coordinates, destination.coordinates) : 0;
                return (
                  <li key={`${stop.destinationSlug}-${index}`} className="space-y-3">
                    {previous && (
                      <div className="ms-5 flex items-start gap-3 border-s border-dashed border-charcoal-800/30 ps-5 text-sm text-charcoal-700">
                        {route ? (
                          <>
                            <TransportIcon mode={route.legs[0].option.mode} className="mt-0.5 shrink-0 text-ink-muted" />
                            <p className="leading-relaxed">
                              {t(`builder.transport.${route.legs[0].option.mode}`)}
                              {" · "}
                              {t("builder.transport.hours", { count: route.hours })}
                              {" · "}
                              {t("builder.transport.km", { km: formatNumber(km, language) })}
                              {route.via && (
                                <>
                                  {" · "}
                                  {t("builder.transport.via", { place: pick(destinationBySlug.get(route.via)?.name ?? { en: route.via, ar: route.via }, language) })}
                                </>
                              )}
                              {route.legs[0].option.note && (
                                <span className="block text-ink-muted">{pick(route.legs[0].option.note, language)}</span>
                              )}
                              {route.hours >= LONG_TRANSFER_HOURS && (
                                <span className="block text-ember-700">{t("builder.transport.long")}</span>
                              )}
                            </p>
                          </>
                        ) : (
                          <p className="text-ember-700">{t("builder.transport.none")}</p>
                        )}
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-4 border border-line bg-canvas p-4">
                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ember-600 font-display text-lg text-ivory">
                        {formatNumber(index + 1, language)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-display text-lg text-charcoal-900">{pick(destination.name, language)}</p>
                        <p className="text-xs text-ink-muted">{pick(destination.gettingThere, language)}</p>
                      </div>
                      <Counter
                        id={`nights-${destination.slug}`}
                        label={t("builder.places.nights")}
                        value={stop.nights}
                        min={1}
                        max={14}
                        onChange={(nights) => setNights(destination.slug, nights)}
                        language={language}
                        decrementLabel={t("builder.places.fewerNights", { place: pick(destination.name, language) })}
                        incrementLabel={t("builder.places.moreNights", { place: pick(destination.name, language) })}
                        className="gap-3"
                      />
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => moveStop(destination.slug, -1)}
                          disabled={index === 0}
                          aria-label={t("builder.places.moveEarlier", { place: pick(destination.name, language) })}
                          className="rounded-sm border border-charcoal-800/25 p-2 text-charcoal-700 hover:bg-sand-100 disabled:opacity-30"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden><path d="m6 15 6-6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => moveStop(destination.slug, 1)}
                          disabled={index === stops.length - 1}
                          aria-label={t("builder.places.moveLater", { place: pick(destination.name, language) })}
                          className="rounded-sm border border-charcoal-800/25 p-2 text-charcoal-700 hover:bg-sand-100 disabled:opacity-30"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden><path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
            <div className="self-start lg:sticky lg:top-28">
              <EgyptMap
                destinations={destinations}
                route={stops.map((stop) => stop.destinationSlug)}
                onSelect={toggleDestination}
                selectOnHover={false}
              />
              <p className="mt-2 text-center text-xs text-ink-muted">{t("builder.places.mapHint")}</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
