import { destinationBySlug } from "@content/destinations";
import type { TripWarning } from "./trip-plan";
import { pick } from "./format";

type T = (key: string, options?: Record<string, unknown>) => string;

/**
 * The sentence for a warning, in the page language. Counts of hours and
 * days are phrased here rather than inside the string, so each language
 * applies its own plural rules to them ("9 hours", "٩ ساعات"). Every place
 * that shows a warning goes through this, or a placeholder leaks out.
 */
export function warningText(t: T, warning: TripWarning, language = "en"): string {
  const params: Record<string, unknown> = { ...warning.params };
  const raw = warning.params ?? {};
  // A place travels as its slug; the sentence needs its name.
  if (typeof raw.from === "string") params.from = pick(destinationBySlug.get(raw.from)?.name ?? { en: raw.from, ar: raw.from }, language);
  if (typeof raw.hours === "number") params.duration = t("common.hours", { count: raw.hours });
  if (typeof raw.planned === "number") params.planned = t("common.days", { count: raw.planned });
  if (typeof raw.duration === "number") params.duration = t("common.days", { count: raw.duration });
  return t(`builder.warnings.${warning.kind}`, params);
}
