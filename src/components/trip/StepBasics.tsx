import { useTranslation } from "react-i18next";
import { currencies } from "@content/currencies";
import type { Month } from "@content/types";
import { FilterToggle } from "@/components/ui/FilterControls";
import { Counter } from "./Counter";
import { useTripStore } from "@/lib/trip-store";
import { INTERESTS, type Interest } from "@/lib/trip-plan";
import { formatNumber, pick } from "@/lib/format";
import { cn } from "@/lib/cn";

const MONTHS: Month[] = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/** Today's date as the input's minimum, so nobody plans a trip into last year. */
function todayIso(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/**
 * When, who, how long, in which currency, and what the traveller cares
 * about. A month is enough to start; an exact date can come later, and the
 * itinerary picks up real dates the moment it does.
 */
export function StepBasics() {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? "en";
  const trip = useTripStore();

  // With a date set, the chips move that date to the chosen month rather
  // than throwing the date away; without one, they toggle a month alone.
  const chooseMonth = (month: Month) => {
    if (trip.startDate) {
      if (month === trip.month) return;
      const [year, , day] = trip.startDate.split("-").map(Number);
      const index = MONTHS.indexOf(month) + 1;
      const safeDay = Math.min(day, 28);
      trip.setBasics({ month, startDate: `${year}-${String(index).padStart(2, "0")}-${String(safeDay).padStart(2, "0")}` });
      return;
    }
    trip.setBasics({ month: trip.month === month ? null : month });
  };

  const chooseDate = (value: string) => {
    if (!value) return trip.setBasics({ startDate: null });
    // Read the month off the string: parsing "2027-03-01" as a Date gives UTC
    // midnight, which is still February for anyone west of Greenwich.
    const month = MONTHS[Number(value.slice(5, 7)) - 1];
    trip.setBasics({ startDate: value, month });
  };

  return (
    <div className="space-y-12">
      <section>
        <h2 className="font-display text-2xl text-charcoal-900">{t("builder.basics.whenTitle")}</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">{t("builder.basics.whenHint")}</p>
        <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label={t("builder.basics.monthLabel")}>
          {MONTHS.map((month) => (
            <FilterToggle
              key={month}
              active={trip.month === month}
              onClick={() => chooseMonth(month)}
            >
              {t(`months.${month}`)}
            </FilterToggle>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <label htmlFor="trip-start" className="text-sm text-charcoal-700">
            {t("builder.basics.exactDate")}
          </label>
          <input
            id="trip-start"
            type="date"
            min={todayIso()}
            value={trip.startDate ?? ""}
            onChange={(event) => chooseDate(event.target.value)}
            className="w-48 border border-line bg-canvas px-3 py-2 text-sm text-charcoal-900 focus:border-ember-500 focus:outline-none"
          />
          {trip.startDate && (
            <button
              type="button"
              onClick={() => trip.setBasics({ startDate: null })}
              className="text-sm text-ink-muted underline underline-offset-4 hover:text-charcoal-900"
            >
              {t("builder.basics.clearDate")}
            </button>
          )}
        </div>
      </section>

      <section className="max-w-md space-y-5">
        <h2 className="font-display text-2xl text-charcoal-900">{t("builder.basics.whoTitle")}</h2>
        <Counter
          id="trip-duration"
          label={t("builder.basics.duration")}
          hint={t("builder.basics.durationHint")}
          value={trip.durationDays}
          min={1}
          max={21}
          onChange={(durationDays) => trip.setBasics({ durationDays })}
          language={language}
          decrementLabel={t("builder.basics.fewerDays")}
          incrementLabel={t("builder.basics.moreDays")}
        />
        <Counter
          id="trip-adults"
          label={t("builder.basics.adults")}
          value={trip.adults}
          min={1}
          max={12}
          onChange={(adults) => trip.setBasics({ adults })}
          language={language}
          decrementLabel={t("builder.basics.fewerAdults")}
          incrementLabel={t("builder.basics.moreAdults")}
        />
        <Counter
          id="trip-children"
          label={t("builder.basics.children")}
          hint={t("builder.basics.childrenHint")}
          value={trip.children}
          min={0}
          max={8}
          onChange={(children) => trip.setBasics({ children })}
          language={language}
          decrementLabel={t("builder.basics.fewerChildren")}
          incrementLabel={t("builder.basics.moreChildren")}
        />
        <div className="flex items-center justify-between gap-6">
          <label htmlFor="trip-currency" className="text-charcoal-900">
            {t("builder.basics.currency")}
          </label>
          <select
            id="trip-currency"
            value={trip.currency}
            onChange={(event) => trip.setBasics({ currency: event.target.value })}
            className="border border-line bg-canvas px-3 py-2 text-sm text-charcoal-800 focus:border-ember-500 focus:outline-none"
          >
            {currencies.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.code} · {pick(currency.name, language)}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl text-charcoal-900">{t("builder.basics.interestsTitle")}</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">{t("builder.basics.interestsHint")}</p>
        <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label={t("builder.basics.interestsTitle")}>
          {INTERESTS.map((interest: Interest) => (
            <FilterToggle
              key={interest}
              active={trip.interests.includes(interest)}
              onClick={() => trip.toggleInterest(interest)}
            >
              {t(`builder.interests.${interest}`)}
            </FilterToggle>
          ))}
        </div>
        <p className={cn("mt-3 text-xs text-ink-muted", trip.interests.length === 0 && "invisible")}>
          {t("builder.basics.interestsCount", { count: trip.interests.length, formatted: formatNumber(trip.interests.length, language) })}
        </p>
      </section>
    </div>
  );
}
