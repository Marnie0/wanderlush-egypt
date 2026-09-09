import { useTranslation } from "react-i18next";
import { SORT_OPTIONS, type ExperienceSort } from "@/lib/experience-filters";

/**
 * A real select rather than a row of toggles: sorting is a single choice out
 * of five, and the platform control is the one a phone already knows how to
 * present well.
 */
export function SortSelect({
  value,
  onChange,
}: {
  value: ExperienceSort;
  onChange: (next: ExperienceSort) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="experience-sort" className="text-sm text-ink-muted">
        {t("experiences.sortLabel")}
      </label>
      <select
        id="experience-sort"
        value={value}
        onChange={(event) => onChange(event.target.value as ExperienceSort)}
        className="border border-line bg-canvas px-3 py-2 text-sm text-charcoal-800 transition-colors hover:border-charcoal-800/50 focus:border-ember-500 focus:outline-none"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {t(`experiences.sorts.${option}`)}
          </option>
        ))}
      </select>
    </div>
  );
}
