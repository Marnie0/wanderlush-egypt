import { useTranslation } from "react-i18next";
import { accommodationLevels } from "@content/accommodation";
import { destinationBySlug } from "@content/destinations";
import { useTripStore } from "@/lib/trip-store";
import { stopsFromDays } from "@/lib/trip-plan";
import { GUESTS_PER_ROOM, coveredNights } from "@/lib/estimate";
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
  // The same nights the estimate charges: every day but the last, minus any a cruise or camp covers.
  const covered = coveredNights(days);
  const chargedNights = days.slice(0, -1).filter((_, index) => !covered.has(index)).length;
  const money = (usd: number) => formatMoney(usd, currency, language);

  return (
    <div>
      <h2 className="font-display text-2xl text-charcoal-900">{t("builder.stay.title")}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
        {t("builder.stay.hint", { count: rooms })}
      </p>

      {/* Native radios inside labelled cards: arrow keys move between levels,
          and the descriptions can hold real lists rather than being crammed
          into a button. Clicking anywhere on the card picks it. */}
      <fieldset className="mt-8 grid gap-4 md:grid-cols-2">
        <legend className="sr-only">{t("builder.stay.title")}</legend>
        {accommodationLevels.map((level) => {
          const active = level.id === tier;
          const tripNights = days
            .slice(0, -1)
            .map((day, index) => (covered.has(index) ? 0 : destinationBySlug.get(day.destinationSlug)?.nightlyRates[level.id] ?? 0))
            .reduce((sum, rate) => sum + rate * rooms, 0);
          const rates = stops.map((stop) => destinationBySlug.get(stop.destinationSlug)?.nightlyRates[level.id] ?? 0);
          const low = Math.min(...rates);
          const high = Math.max(...rates);
          return (
            <div
              key={level.id}
              onClick={() => setTier(level.id)}
              className={cn(
                "relative flex cursor-pointer flex-col border p-6 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ember-500",
                active ? "border-charcoal-800 bg-canvas" : "border-line bg-canvas hover:border-charcoal-800/50",
              )}
            >
              <div className="flex items-baseline justify-between gap-4">
                <label htmlFor={`tier-${level.id}`} className="font-display text-2xl text-charcoal-900">
                  {pick(level.name, language)}
                </label>
                <input
                  id={`tier-${level.id}`}
                  type="radio"
                  name="accommodation-tier"
                  value={level.id}
                  checked={active}
                  onChange={() => setTier(level.id)}
                  aria-describedby={`tier-${level.id}-desc`}
                  className="h-5 w-5 shrink-0 accent-ember-600"
                />
              </div>
              <p className="mt-1 text-sm text-ember-700">{pick(level.summary, language)}</p>
              <p id={`tier-${level.id}-desc`} className="mt-4 text-sm leading-relaxed text-charcoal-600">{pick(level.description, language)}</p>
              <ul className="mt-4 space-y-1 text-sm text-charcoal-700">
                {pickList(level.inclusions, language).map((item) => (
                  <li key={item} className="flex gap-2">
                    <span aria-hidden className="mt-2 h-1 w-3 shrink-0 bg-gold-400" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-ink-muted">{pick(level.exampleProperties, language)}</p>
              <p className="mt-5 border-t border-line pt-4 text-sm">
                {stops.length > 0 ? (
                  <>
                    <span className="block text-charcoal-800">
                      {low === high
                        ? t("builder.stay.perNightOne", { amount: money(low) })
                        : t("builder.stay.perNight", { low: money(low), high: money(high) })}
                    </span>
                    <span className="block text-ink-muted">
                      {t("builder.stay.forTrip", { amount: money(tripNights), count: chargedNights })}
                    </span>
                  </>
                ) : (
                  <span className="block text-charcoal-800">
                    {t("builder.stay.perNight", { low: money(level.nightlyFrom), high: money(level.nightlyTo) })}
                  </span>
                )}
              </p>
            </div>
          );
        })}
      </fieldset>
    </div>
  );
}
