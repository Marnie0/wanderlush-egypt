import { useTranslation } from "react-i18next";
import { countActiveFilters, type DestinationFilterState } from "@/lib/destination-filters";

/**
 * Every active filter shown as a removable chip. Without this the only way to
 * tell why a result is missing is to reopen each group.
 */
export function ActiveFilters({
  filters,
  onChange,
}: {
  filters: DestinationFilterState;
  onChange: (next: DestinationFilterState) => void;
}) {
  const { t } = useTranslation();
  if (countActiveFilters(filters) === 0) return null;

  const chips: { key: string; label: string; clear: () => void }[] = [];

  if (filters.query.trim()) {
    chips.push({
      key: "query",
      label: `“${filters.query.trim()}”`,
      clear: () => onChange({ ...filters, query: "" }),
    });
  }
  for (const region of filters.regions) {
    chips.push({
      key: `region-${region}`,
      label: t(`regions.${region}`),
      clear: () =>
        onChange({ ...filters, regions: filters.regions.filter((item) => item !== region) }),
    });
  }
  for (const style of filters.styles) {
    chips.push({
      key: `style-${style}`,
      label: t(`travelStyles.${style}`),
      clear: () =>
        onChange({ ...filters, styles: filters.styles.filter((item) => item !== style) }),
    });
  }
  for (const bucket of filters.durations) {
    chips.push({
      key: `days-${bucket}`,
      label: t(`explore.durations.${bucket}`),
      clear: () =>
        onChange({ ...filters, durations: filters.durations.filter((item) => item !== bucket) }),
    });
  }
  if (filters.monthRange) {
    const [from, to] = filters.monthRange;
    chips.push({
      key: "month",
      label: from === to ? t(`months.${from}`) : `${t(`months.${from}`)} – ${t(`months.${to}`)}`,
      clear: () => onChange({ ...filters, monthRange: null }),
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="sr-only">{t("explore.activeFilters")}</span>
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.clear}
          aria-label={t("explore.clearOne", { label: chip.label })}
          className="group inline-flex items-center gap-2 border border-charcoal-800/30 bg-sand-100 px-3 py-1.5 text-sm text-charcoal-700 transition-colors hover:border-charcoal-800/60"
        >
          {chip.label}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </button>
      ))}
      <button
        type="button"
        onClick={() => onChange({ query: "", regions: [], styles: [], durations: [], monthRange: null })}
        className="px-2 py-1.5 text-sm text-ember-600 underline decoration-ember-600/40 underline-offset-4 transition-colors hover:decoration-ember-600"
      >
        {t("explore.clearAll")}
      </button>
    </div>
  );
}
