import { useTranslation } from "react-i18next";
import { destinationBySlug } from "@content/destinations";
import { pick } from "@/lib/format";
import {
  countActiveExperienceFilters,
  emptyExperienceFilters,
  priceBandLabel,
  type ExperienceFilterState,
} from "@/lib/experience-filters";

/**
 * Every active filter as a removable chip. Without this the only way to work
 * out why something is missing is to reopen each group and read it back.
 */
export function ExperienceActiveFilters({
  filters,
  onChange,
}: {
  filters: ExperienceFilterState;
  onChange: (next: ExperienceFilterState) => void;
}) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? "en";
  if (countActiveExperienceFilters(filters) === 0) return null;

  const chips: { key: string; label: string; clear: () => void }[] = [];
  const without = <T,>(list: T[], value: T) => list.filter((item) => item !== value);

  if (filters.query.trim()) {
    chips.push({
      key: "query",
      label: `“${filters.query.trim()}”`,
      clear: () => onChange({ ...filters, query: "" }),
    });
  }
  for (const slug of filters.destinations) {
    const destination = destinationBySlug.get(slug);
    chips.push({
      key: `place-${slug}`,
      label: destination ? pick(destination.name, language) : slug,
      clear: () => onChange({ ...filters, destinations: without(filters.destinations, slug) }),
    });
  }
  for (const category of filters.categories) {
    chips.push({
      key: `category-${category}`,
      label: t(`categories.${category}`),
      clear: () => onChange({ ...filters, categories: without(filters.categories, category) }),
    });
  }
  for (const band of filters.prices) {
    chips.push({
      key: `price-${band}`,
      label: priceBandLabel(band, t, language),
      clear: () => onChange({ ...filters, prices: without(filters.prices, band) }),
    });
  }
  for (const band of filters.durations) {
    chips.push({
      key: `length-${band}`,
      label: t(`experiences.lengths.${band}`),
      clear: () => onChange({ ...filters, durations: without(filters.durations, band) }),
    });
  }
  for (const format of filters.groupFormats) {
    chips.push({
      key: `group-${format}`,
      label: t(`groupFormat.${format}`),
      clear: () => onChange({ ...filters, groupFormats: without(filters.groupFormats, format) }),
    });
  }
  for (const environment of filters.environments) {
    chips.push({
      key: `setting-${environment}`,
      label: t(`environments.${environment}`),
      clear: () => onChange({ ...filters, environments: without(filters.environments, environment) }),
    });
  }
  if (filters.familyFriendly) {
    chips.push({
      key: "family",
      label: t("experiences.familyFriendly"),
      clear: () => onChange({ ...filters, familyFriendly: false }),
    });
  }
  if (filters.savedOnly) {
    chips.push({
      key: "saved",
      label: t("experiences.savedOnlyChip"),
      clear: () => onChange({ ...filters, savedOnly: false }),
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
        // Sorting is not a filter, so clearing the filters must not silently
        // reorder the results underneath the visitor.
        onClick={() => onChange({ ...emptyExperienceFilters, sort: filters.sort })}
        className="px-2 py-1.5 text-sm text-ember-600 underline decoration-ember-600/40 underline-offset-4 transition-colors hover:decoration-ember-600"
      >
        {t("explore.clearAll")}
      </button>
    </div>
  );
}
