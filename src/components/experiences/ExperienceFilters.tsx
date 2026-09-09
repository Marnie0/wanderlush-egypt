import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/Icon";
import { FilterGroup as Group, FilterToggle as Toggle } from "@/components/ui/FilterControls";
import { destinations } from "@content/destinations";
import { pick } from "@/lib/format";
import {
  CATEGORIES,
  DURATION_BANDS,
  ENVIRONMENTS,
  GROUP_FORMATS,
  PRICE_BANDS,
  priceBandLabel,
  type ExperienceFilterState,
} from "@/lib/experience-filters";

/**
 * Seven filter groups plus two switches, all visible at once rather than
 * hidden behind accordions: a filter you cannot see is a filter you forget
 * you set, and that is what makes a result list look broken.
 */
export function ExperienceFilters({
  filters,
  onChange,
  savedCount,
}: {
  filters: ExperienceFilterState;
  onChange: (next: ExperienceFilterState) => void;
  savedCount: number;
}) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? "en";

  const toggleIn = <T,>(list: T[], value: T): T[] =>
    list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

  return (
    <div className="space-y-8">
      <div>
        <label htmlFor="experience-search" className="eyebrow text-ink-muted">
          {t("experiences.searchLabel")}
        </label>
        <div className="mt-3 flex items-center gap-3 border border-line bg-canvas px-4 py-3 transition-colors focus-within:border-ember-500">
          <Icon name="search" size={18} className="text-charcoal-400" />
          <input
            id="experience-search"
            type="search"
            value={filters.query}
            placeholder={t("experiences.searchPlaceholder")}
            onChange={(event) => onChange({ ...filters, query: event.target.value })}
            className="w-full bg-transparent text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none"
          />
        </div>
      </div>

      <Group label={t("experiences.destination")}>
        {destinations.map((destination) => (
          <Toggle
            key={destination.slug}
            active={filters.destinations.includes(destination.slug)}
            onClick={() =>
              onChange({
                ...filters,
                destinations: toggleIn(filters.destinations, destination.slug),
              })
            }
          >
            {pick(destination.name, language)}
          </Toggle>
        ))}
      </Group>

      <Group label={t("experiences.category")}>
        {CATEGORIES.map((category) => (
          <Toggle
            key={category}
            active={filters.categories.includes(category)}
            onClick={() =>
              onChange({ ...filters, categories: toggleIn(filters.categories, category) })
            }
          >
            {t(`categories.${category}`)}
          </Toggle>
        ))}
      </Group>

      <Group label={t("experiences.price")}>
        {PRICE_BANDS.map((band) => (
          <Toggle
            key={band.id}
            active={filters.prices.includes(band.id)}
            onClick={() => onChange({ ...filters, prices: toggleIn(filters.prices, band.id) })}
          >
            {priceBandLabel(band.id, t, language)}
          </Toggle>
        ))}
      </Group>

      <Group label={t("experiences.length")}>
        {DURATION_BANDS.map((band) => (
          <Toggle
            key={band.id}
            active={filters.durations.includes(band.id)}
            onClick={() => onChange({ ...filters, durations: toggleIn(filters.durations, band.id) })}
          >
            {t(`experiences.lengths.${band.id}`)}
          </Toggle>
        ))}
      </Group>

      <Group label={t("experiences.groupType")}>
        {GROUP_FORMATS.map((format) => (
          <Toggle
            key={format}
            active={filters.groupFormats.includes(format)}
            onClick={() =>
              onChange({ ...filters, groupFormats: toggleIn(filters.groupFormats, format) })
            }
          >
            {t(`groupFormat.${format}`)}
          </Toggle>
        ))}
      </Group>

      <Group label={t("experiences.setting")}>
        {ENVIRONMENTS.map((environment) => (
          <Toggle
            key={environment}
            active={filters.environments.includes(environment)}
            onClick={() =>
              onChange({ ...filters, environments: toggleIn(filters.environments, environment) })
            }
          >
            {t(`environments.${environment}`)}
          </Toggle>
        ))}
      </Group>

      <Group label={t("experiences.suitability")}>
        <Toggle
          active={filters.familyFriendly}
          onClick={() => onChange({ ...filters, familyFriendly: !filters.familyFriendly })}
        >
          {t("experiences.familyFriendly")}
        </Toggle>
        <Toggle
          active={filters.savedOnly}
          onClick={() => onChange({ ...filters, savedOnly: !filters.savedOnly })}
        >
          {t("experiences.savedOnly", { count: savedCount })}
        </Toggle>
      </Group>
    </div>
  );
}
