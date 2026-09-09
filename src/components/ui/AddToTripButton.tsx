import { useTranslation } from "react-i18next";
import { useHasDestination, useHasExperience, useTripStore } from "@/lib/trip-store";
import { buttonClasses } from "./Button";
import { cn } from "@/lib/cn";

/**
 * Toggles a destination or experience in the trip held in this browser.
 * Adding is a single click and removing is the same click again, so there is
 * never a state the visitor cannot get out of.
 */
export function AddToTripButton({
  kind,
  slug,
  size = "md",
  variant = "primary",
  className,
}: {
  kind: "destination" | "experience";
  slug: string;
  size?: "sm" | "md" | "lg";
  /** Cards use the quiet variant so the action does not outshout the photograph. */
  variant?: "primary" | "secondary";
  className?: string;
}) {
  const { t } = useTranslation();
  const inTripDestination = useHasDestination(slug);
  const inTripExperience = useHasExperience(slug);
  const toggleDestination = useTripStore((state) => state.toggleDestination);
  const toggleExperience = useTripStore((state) => state.toggleExperience);

  const inTrip = kind === "destination" ? inTripDestination : inTripExperience;
  const toggle = kind === "destination" ? toggleDestination : toggleExperience;

  return (
    <button
      type="button"
      onClick={() => toggle(slug)}
      aria-pressed={inTrip}
      title={inTrip ? t("trip.remove") : t("trip.add")}
      className={cn(
        buttonClasses(inTrip ? "secondary" : variant, size),
        inTrip && "border-teal-600 bg-teal-50 text-teal-700 hover:bg-teal-100",
        className,
      )}
    >
      {inTrip ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}
      {inTrip ? t("trip.added") : t("trip.add")}
    </button>
  );
}
