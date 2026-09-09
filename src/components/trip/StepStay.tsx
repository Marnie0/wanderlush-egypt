import { useTranslation } from "react-i18next";
import { accommodationLevels } from "@content/accommodation";
import { destinationBySlug } from "@content/destinations";
import { useTripStore } from "@/lib/trip-store";
import { stopsFromDays } from "@/lib/trip-plan";
import { GUESTS_PER_ROOM } from "@/lib/estimate";
import { formatMoney, pick, pickList } from "@/lib/format";
import { cn } from "@/lib/cn";

/**
 * Four levels, each priced for the places actually in the trip rather than
 * a national average, so the difference between Comfort and Premium is a
 * real number for this route and this many nights.
 */
export function StepStay() {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? "en";
  const days = useTripStore((state) => state.days);
  const tier = useTripStore((state) => state.tier);
  const currency = useTripStore((state) => state.currency);
  const adults = useTripStore((state) => state.adults);
  const children = useTripStore((state) => state.children);
  const setTier = useTripStore((state) => state.setTier);
  const stops = stopsFromDays(days);
  const rooms = Math.max(1, Math.ceil((adults + children) / GUESTS_PER_ROOM));
  const money = (usd: number) => formatMoney(usd, currency, language);

  return (
    <div>
      <h2 className="font-display text-2xl text-charcoal-900">{t("builder.stay.title")}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
        {t("builder.stay.hint", { count: rooms })}
      </p>

      <div role="radiogroup" aria-label={t("builder.stay.title")} className="mt-8 grid gap-4 md:grid-cols-2">
        {accommodationLevels.map((level) => {
          const active = level.id === tier;
          const tripNights = days
            .map((day) => destinationBySlug.get(day.destinationSlug)?.nightlyRates[level.id] ?? 0)
            .reduce((sum, rate) => sum + rate * rooms, 0);
          const rates = stops.map((stop) => destinationBySlug.get(stop.destinationSlug)?.nightlyRates[level.id] ?? 0);
          const low = Math.min(...rates);
          const high = Math.max(...rates);
          return (
            <button
              key={level.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setTier(level.id)}
              className={cn(
                "flex flex-col border p-6 text-start transition-colors",
                active ? "border-charcoal-800 bg-canvas" : "border-line bg-canvas hover:border-charcoal-800/50",
              )}
            >
              <span className="flex items-baseline justify-between gap-4">
                <span className="font-display text-2xl text-charcoal-900">{pick(level.name, language)}</span>
                <span
                  aria-hidden
                  className={cn(
                    "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                    active ? "border-ember-600" : "border-charcoal-800/30",
                  )}
                >
                  <span className={cn("h-2.5 w-2.5 rounded-full", active ? "bg-ember-600" : "bg-transparent")} />
                </span>
              </span>
              <span className="mt-1 text-sm text-ember-700">{pick(level.summary, language)}</span>
              <span className="mt-4 text-sm leading-relaxed text-charcoal-600">{pick(level.description, language)}</span>
              <ul className="mt-4 space-y-1 text-sm text-charcoal-700">
                {pickList(level.inclusions, language).map((item) => (
                  <li key={item} className="flex gap-2">
                    <span aria-hidden className="mt-2 h-1 w-3 shrink-0 bg-gold-400" />
                    {item}
                  </li>
                ))}
              </ul>
              <span className="mt-4 text-xs text-ink-muted">{pick(level.exampleProperties, language)}</span>
              <span className="mt-5 border-t border-line pt-4 text-sm">
                {stops.length > 0 ? (
                  <>
                    <span className="block text-charcoal-800">
                      {low === high
                        ? t("builder.stay.perNightOne", { amount: money(low) })
                        : t("builder.stay.perNight", { low: money(low), high: money(high) })}
                    </span>
                    <span className="block text-ink-muted">
                      {t("builder.stay.forTrip", { amount: money(tripNights), count: days.length })}
                    </span>
                  </>
                ) : (
                  <span className="block text-charcoal-800">
                    {t("builder.stay.perNight", { low: money(level.nightlyFrom), high: money(level.nightlyTo) })}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
