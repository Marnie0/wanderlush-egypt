import { useTranslation } from "react-i18next";
import { currencies } from "@content/currencies";
import type { AccommodationTierId } from "@content/types";
import { SERVICE_FEE_RATE, TOUR_STYLES, type TourStyle, type TripEstimate } from "@/lib/estimate";
import { formatMoney, formatNumber, formatPercent, pick } from "@/lib/format";
import { cn } from "@/lib/cn";

/**
 * The estimate, explained. The same four lines wherever a total appears,
 * so the number in the corner of the builder and the number on the summary
 * page are visibly the same sum of the same parts.
 */

type Part = "accommodation" | "experiences" | "transport" | "serviceFee";
const PARTS: Part[] = ["accommodation", "experiences", "transport", "serviceFee"];
const PART_COLOR: Record<Part, string> = {
  accommodation: "bg-teal-500",
  experiences: "bg-ember-500",
  transport: "bg-gold-500",
  serviceFee: "bg-charcoal-400",
};

/** A stacked bar: the shape of the cost before its size. */
export function CostBar({ estimate, className }: { estimate: TripEstimate; className?: string }) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? "en";
  if (estimate.total <= 0) return null;
  const shares = PARTS.map((part) => ({ part, share: estimate[part] / estimate.total })).filter((s) => s.share > 0);
  return (
    <figure className={className}>
      <div className="flex h-3 w-full overflow-hidden rounded-sm bg-sand-100" aria-hidden>
        {shares.map(({ part, share }) => (
          <div key={part} className={cn("h-full", PART_COLOR[part])} style={{ width: `${share * 100}%` }} />
        ))}
      </div>
      <figcaption className="sr-only">{t("estimate.barLabel")}</figcaption>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-charcoal-700">
        {shares.map(({ part, share }) => (
          <li key={part} className="flex items-center gap-1.5">
            <span aria-hidden className={cn("h-2 w-2 rounded-full", PART_COLOR[part])} />
            {t(`estimate.${part}`)}
            <span className="text-ink-muted tabular-nums">{formatPercent(share, language)}</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

function Line({
  label,
  amount,
  meta,
  emphasis,
  muted,
}: {
  label: string;
  amount: string;
  meta?: string[];
  emphasis?: boolean;
  muted?: boolean;
}) {
  return (
    <div className={cn("flex justify-between gap-4", emphasis && "border-t border-line pt-3")}>
      <dt className={cn(emphasis ? "font-medium text-charcoal-900" : "text-charcoal-700")}>
        {label}
        {meta && meta.length > 0 && (
          <span className="mt-0.5 block text-xs leading-relaxed text-ink-muted">{meta.join(" · ")}</span>
        )}
      </dt>
      <dd
        className={cn(
          "shrink-0 text-end tabular-nums",
          emphasis ? "font-medium text-charcoal-900" : muted ? "text-ink-muted" : "text-charcoal-800",
        )}
      >
        {amount}
      </dd>
    </div>
  );
}

/**
 * The lines of the estimate. `detailed` adds what each line is made of:
 * how many nights and rooms, how many experiences and in which style, how
 * many transfers. The compact form is for the builder's aside.
 */
export function CostLines({
  estimate,
  currency,
  tier,
  detailed = false,
  className,
}: {
  estimate: TripEstimate;
  currency: string;
  tier: AccommodationTierId;
  detailed?: boolean;
  className?: string;
}) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? "en";
  const money = (usd: number) => formatMoney(usd, currency, language);
  const rate = formatPercent(SERVICE_FEE_RATE, language);

  const accommodationMeta = detailed
    ? [
        t("common.nights", { count: estimate.nights }),
        t("estimate.rooms", { count: estimate.rooms }),
        t(`tiers.${tier}`),
      ]
    : undefined;
  const experiencesMeta = detailed
    ? [
        t("estimate.experienceCount", { count: estimate.experienceCount }),
        t(`estimate.style.${estimate.tourStyle}`),
        ...(estimate.sharedOnlyCount > 0 ? [t("estimate.sharedOnly", { count: estimate.sharedOnlyCount })] : []),
        ...(estimate.children > 0 && estimate.experienceCount > 0 ? [t("estimate.childRate")] : []),
        ...(estimate.childFreeCount > 0 ? [t("estimate.childFree", { count: estimate.childFreeCount })] : []),
      ]
    : undefined;
  const transportMeta = detailed
    ? [estimate.transferCount > 0 ? t("estimate.transferCount", { count: estimate.transferCount }) : t("estimate.noTransfers")]
    : undefined;
  const feeMeta = detailed
    ? [estimate.serviceIncluded ? t("estimate.feeRate", { rate }) : t("estimate.feeExcludedHint")]
    : undefined;

  return (
    <dl className={cn("space-y-2.5 text-sm", className)}>
      <Line label={t("estimate.accommodation")} amount={money(estimate.accommodation)} meta={accommodationMeta} />
      <Line label={t("estimate.experiences")} amount={money(estimate.experiences)} meta={experiencesMeta} />
      <Line label={t("estimate.transport")} amount={money(estimate.transport)} meta={transportMeta} />
      {detailed && <Line label={t("estimate.subtotal")} amount={money(estimate.subtotal)} emphasis />}
      <Line
        label={estimate.serviceIncluded ? t("estimate.serviceFee") : t("estimate.serviceFeeExcluded")}
        amount={estimate.serviceIncluded ? money(estimate.serviceFee) : t("estimate.feeExcluded")}
        meta={feeMeta}
        muted={!estimate.serviceIncluded}
      />
    </dl>
  );
}

/** Total and what it means for each person. `aria-live` because it changes under the reader's hands. */
export function CostTotal({
  estimate,
  currency,
  size = "lg",
  className,
}: {
  estimate: TripEstimate;
  currency: string;
  size?: "md" | "lg";
  className?: string;
}) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? "en";
  const money = (usd: number) => formatMoney(usd, currency, language);
  return (
    <div className={className} aria-live="polite">
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-sm font-medium text-charcoal-900">{t("estimate.total")}</p>
        <p className={cn("font-display text-charcoal-900", size === "lg" ? "text-3xl" : "text-2xl")}>{money(estimate.total)}</p>
      </div>
      <p className="mt-1 text-end text-sm text-ink-muted">{t("estimate.perTraveller", { amount: money(estimate.perPerson) })}</p>
      {estimate.children > 0 && (
        <p className="mt-0.5 text-end text-xs text-ink-muted">
          {t("estimate.perAdultChild", { adult: money(estimate.perAdult), child: money(estimate.perChild) })}
        </p>
      )}
    </div>
  );
}

/**
 * The three choices that move the number without touching the itinerary:
 * shared or private tours, whether our fee is in, and the currency.
 */
export function EstimateControls({
  tourStyle,
  serviceIncluded,
  currency,
  onChange,
  compact = false,
  idPrefix = "estimate",
  className,
}: {
  tourStyle: TourStyle;
  serviceIncluded: boolean;
  currency: string;
  onChange: (change: { tourStyle?: TourStyle; serviceIncluded?: boolean; currency?: string }) => void;
  compact?: boolean;
  /** Distinct when the controls appear twice on one page. */
  idPrefix?: string;
  className?: string;
}) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? "en";
  const rate = formatPercent(SERVICE_FEE_RATE, language);
  return (
    <div className={cn("space-y-4", className)}>
      <fieldset>
        <legend className={cn("text-charcoal-900", compact ? "text-sm" : "font-medium")}>{t("estimate.controls.tours")}</legend>
        <div className={cn("mt-2 grid grid-cols-2 gap-2", !compact && "sm:max-w-md")} role="radiogroup" aria-label={t("estimate.controls.tours")}>
          {TOUR_STYLES.map((style) => {
            const active = style === tourStyle;
            return (
              <button
                key={style}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onChange({ tourStyle: style })}
                className={cn(
                  "rounded-sm border px-3 text-start transition-colors",
                  compact ? "py-2" : "py-3",
                  active
                    ? "border-charcoal-800 bg-charcoal-800 text-ivory"
                    : "border-line text-charcoal-700 hover:border-charcoal-800/50 hover:bg-sand-100",
                )}
              >
                <span className="block text-sm font-medium">{t(`estimate.controls.${style}`)}</span>
                {!compact && (
                  <span className={cn("mt-0.5 block text-xs leading-snug", active ? "text-ivory/80" : "text-ink-muted")}>
                    {t(`estimate.controls.${style}Hint`)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="flex items-start gap-3">
        <input
          id={`${idPrefix}-fee`}
          type="checkbox"
          checked={serviceIncluded}
          onChange={(event) => onChange({ serviceIncluded: event.target.checked })}
          className="mt-0.5 h-5 w-5 shrink-0 accent-ember-600"
        />
        <label htmlFor={`${idPrefix}-fee`} className={cn("text-charcoal-900", compact ? "text-sm" : "")}>
          {t("estimate.controls.fee", { rate })}
          {!compact && <span className="mt-0.5 block text-xs leading-relaxed text-ink-muted">{t("estimate.controls.feeHint")}</span>}
        </label>
      </div>

      <div className={cn("flex items-center justify-between gap-4", !compact && "sm:max-w-md")}>
        <label htmlFor={`${idPrefix}-currency`} className={cn("text-charcoal-900", compact ? "text-sm" : "")}>
          {t("estimate.controls.currency")}
        </label>
        <select
          id={`${idPrefix}-currency`}
          value={currency}
          onChange={(event) => onChange({ currency: event.target.value })}
          className="border border-line bg-canvas px-3 py-2 text-sm text-charcoal-800 focus:border-ember-500 focus:outline-none"
        >
          {currencies.map((option) => (
            <option key={option.code} value={option.code}>
              {compact ? option.code : `${option.code} · ${pick(option.name, language)}`}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

/** "Converted at 1 USD = 48.5 EGP": the rate is static and the note says so. */
export function ConversionNote({ currency, className }: { currency: string; className?: string }) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? "en";
  const option = currencies.find((c) => c.code === currency);
  if (!option || option.code === "USD") return null;
  return (
    <p className={cn("text-xs leading-relaxed text-ink-muted", className)}>
      {/* Isolated so the Arabic sentence does not reorder "1 USD = 48.5 EGP". */}
      {t("estimate.converted", { rate: `\u2066 1 USD = ${formatNumber(option.perUsd, language)} ${option.code} \u2069` })}
    </p>
  );
}

/**
 * What the brief calls expectation setting: an estimate, availability moves
 * it, flights are not in it, and a person confirms the final figure.
 */
export function EstimateDisclaimer({ compact = false, className }: { compact?: boolean; className?: string }) {
  const { t } = useTranslation();
  if (compact) {
    return <p className={cn("text-xs leading-relaxed text-ink-muted", className)}>{t("estimate.disclaimer.short")}</p>;
  }
  return (
    <div className={cn("border-s-2 border-gold-500 bg-gold-50 px-4 py-3", className)}>
      <p className="text-sm font-medium text-gold-800">{t("estimate.disclaimer.title")}</p>
      <ul className="mt-2 space-y-1 text-sm leading-relaxed text-gold-800">
        {(["estimate", "availability", "flights", "specialist"] as const).map((key) => (
          <li key={key}>{t(`estimate.disclaimer.${key}`)}</li>
        ))}
      </ul>
    </div>
  );
}

/** The calculation rules in plain words, the same ones `docs/pricing.md` documents. */
export function EstimateRules({ className }: { className?: string }) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? "en";
  const params = {
    rate: formatPercent(SERVICE_FEE_RATE, language),
    childRate: formatPercent(0.5, language),
    childAge: formatNumber(12, language),
    perRoom: formatNumber(2, language),
  };
  return (
    <div className={className}>
      <h2 className="font-display text-2xl text-charcoal-900">{t("estimate.rules.title")}</h2>
      <ol className="mt-4 space-y-3 text-sm leading-relaxed text-charcoal-700">
        {(["accommodation", "experiences", "children", "private", "transport", "fee", "perTraveller", "currency"] as const).map((key, index) => (
          <li key={key} className="flex gap-3">
            <span className="shrink-0 text-ink-muted tabular-nums">{formatNumber(index + 1, language)}.</span>
            <span>
              <span className="font-medium text-charcoal-900">{t(`estimate.rules.${key}Title`)}</span>{" "}
              {t(`estimate.rules.${key}`, params)}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
