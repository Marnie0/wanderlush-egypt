import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/Icon";
import { FilterGroup as Group, FilterToggle as Toggle } from "@/components/ui/FilterControls";
import {
  DURATION_BUCKETS,
  MONTHS,
  type DestinationFilterState,
  type DurationBucket,
} from "@/lib/destination-filters";
import type { Month, Region, TravelStyle } from "@content/types";

const REGIONS: Region[] = [
  "greater-cairo",
  "fayoum",
  "mediterranean",
  "nile-valley",
  "western-desert",
  "red-sea",
];

const STYLES: TravelStyle[] = [
  "history",
  "beach",
  "desert",
  "luxury",
  "family",
  "romantic",
  "nature",
];

/**
 * Search and four filter groups. Every control is a toggle button rather than
 * a select, so the current state is visible without opening anything, and the
 * whole panel works the same in a drawer on a phone.
 */
export function DestinationFilters({
  filters,
  onChange,
}: {
  filters: DestinationFilterState;
  onChange: (next: DestinationFilterState) => void;
}) {
  const { t } = useTranslation();

  const toggleIn = <T,>(list: T[], value: T): T[] =>
    list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

  return (
    <div className="space-y-8">
      <div>
        <label htmlFor="destination-search" className="eyebrow text-ink-muted">
          {t("explore.searchLabel")}
        </label>
        <div className="mt-3 flex items-center gap-3 border border-line bg-canvas px-4 py-3 transition-colors focus-within:border-ember-500">
          <Icon name="search" size={18} className="text-charcoal-400" />
          <input
            id="destination-search"
            type="search"
            value={filters.query}
            placeholder={t("explore.searchPlaceholder")}
            onChange={(event) => onChange({ ...filters, query: event.target.value })}
            className="w-full bg-transparent text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none"
          />
        </div>
      </div>

      <Group label={t("explore.region")}>
        {REGIONS.map((region) => (
          <Toggle
            key={region}
            active={filters.regions.includes(region)}
            onClick={() => onChange({ ...filters, regions: toggleIn(filters.regions, region) })}
          >
            {t(`regions.${region}`)}
          </Toggle>
        ))}
      </Group>

      <Group label={t("explore.travelStyle")}>
        {STYLES.map((style) => (
          <Toggle
            key={style}
            active={filters.styles.includes(style)}
            onClick={() => onChange({ ...filters, styles: toggleIn(filters.styles, style) })}
          >
            {t(`travelStyles.${style}`)}
          </Toggle>
        ))}
      </Group>

      <Group label={t("explore.duration")}>
        {DURATION_BUCKETS.map((bucket: DurationBucket) => (
          <Toggle
            key={bucket}
            active={filters.durations.includes(bucket)}
            onClick={() =>
              onChange({ ...filters, durations: toggleIn(filters.durations, bucket) })
            }
          >
            {t(`explore.durations.${bucket}`)}
          </Toggle>
        ))}
      </Group>

      <Group label={t("explore.season")}>
        <Toggle active={filters.month === null} onClick={() => onChange({ ...filters, month: null })}>
          {t("explore.anyMonth")}
        </Toggle>
        {MONTHS.map((month: Month) => (
          <Toggle
            key={month}
            active={filters.month === month}
            onClick={() => onChange({ ...filters, month: filters.month === month ? null : month })}
          >
            {t(`months.${month}`)}
          </Toggle>
        ))}
      </Group>
    </div>
  );
}
