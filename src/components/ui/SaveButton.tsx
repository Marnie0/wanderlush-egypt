import { useTranslation } from "react-i18next";
import { useHasSavedExperience, useTripStore } from "@/lib/trip-store";
import { cn } from "@/lib/cn";

/**
 * Shortlists an experience without committing it to the trip. Saving is the
 * bookmark a visitor reaches for while still comparing; the trip is the
 * decision. The bookmark fills in when it is set, so the state reads at a
 * glance on a card full of photographs.
 */
export function SaveButton({
  slug,
  className,
  withLabel = false,
}: {
  slug: string;
  className?: string;
  /** Detail pages have room for words; cards do not. */
  withLabel?: boolean;
}) {
  const { t } = useTranslation();
  const saved = useHasSavedExperience(slug);
  const toggleSaved = useTripStore((state) => state.toggleSavedExperience);

  return (
    <button
      type="button"
      onClick={() => toggleSaved(slug)}
      aria-pressed={saved}
      title={saved ? t("saved.remove") : t("saved.add")}
      aria-label={saved ? t("saved.remove") : t("saved.add")}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-sm border px-3 text-sm transition-colors",
        withLabel ? "h-11" : "h-11 w-11",
        saved
          ? "border-gold-500 bg-gold-50 text-gold-700 hover:bg-gold-100"
          : "border-charcoal-800/25 text-charcoal-700 hover:border-charcoal-800/60 hover:bg-sand-100",
        className,
      )}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M6 4h12a1 1 0 0 1 1 1v15l-7-4-7 4V5a1 1 0 0 1 1-1z" />
      </svg>
      {withLabel && <span>{saved ? t("saved.savedLabel") : t("saved.save")}</span>}
    </button>
  );
}
