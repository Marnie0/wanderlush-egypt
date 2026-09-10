import type { TripWarning } from "./trip-plan";

type T = (key: string, options?: Record<string, unknown>) => string;

/**
 * The sentence for a warning, in the page language. Counts of hours and
 * days are phrased here rather than inside the string, so each language
 * applies its own plural rules to them ("9 hours", "٩ ساعات"). Every place
 * that shows a warning goes through this, or a placeholder leaks out.
 */
export function warningText(t: T, warning: TripWarning): string {
  const params: Record<string, unknown> = { ...warning.params };
  const raw = warning.params ?? {};
  if (typeof raw.hours === "number") params.duration = t("common.hours", { count: raw.hours });
  if (typeof raw.planned === "number") params.planned = t("common.days", { count: raw.planned });
  if (typeof raw.duration === "number") params.duration = t("common.days", { count: raw.duration });
  return t(`builder.warnings.${warning.kind}`, params);
}
