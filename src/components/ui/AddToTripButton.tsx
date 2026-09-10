import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { m } from "framer-motion";
import { destinationBySlug } from "@content/destinations";
import { experienceBySlug } from "@content/experiences";
import { useHasDestination, useHasExperience, useTripStore } from "@/lib/trip-store";
import { useToastStore } from "@/lib/toast-store";
import { buttonClasses } from "./Button";
import { popIn } from "@/lib/motion";
import { pick } from "@/lib/format";
import { cn } from "@/lib/cn";

/**
 * Toggles a destination or experience in the trip held in this browser.
 * Adding is a single click and removing is the same click again, so there is
 * never a state the visitor cannot get out of. The click is answered twice:
 * the button itself flips to a tick, and a line at the foot of the screen
 * names what was added and offers the trip builder, which is the bridge
 * from browsing to planning.
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
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? "en";
  const { pathname } = useLocation();
  const showToast = useToastStore((state) => state.show);
  const inTripDestination = useHasDestination(slug);
  const inTripExperience = useHasExperience(slug);
  const toggleDestination = useTripStore((state) => state.toggleDestination);
  const toggleExperience = useTripStore((state) => state.toggleExperience);

  const inTrip = kind === "destination" ? inTripDestination : inTripExperience;
  const toggle = kind === "destination" ? toggleDestination : toggleExperience;
  const named = kind === "destination" ? destinationBySlug.get(slug)?.name : experienceBySlug.get(slug)?.name;

  const onClick = () => {
    toggle(slug);
    // Inside the builder the trip is already on screen; the note is for everywhere else.
    if (!named || pathname.startsWith("/trip-builder")) return;
    showToast({
      message: t(inTrip ? "trip.toast.removed" : "trip.toast.added", { name: pick(named, language) }),
      action: inTrip ? undefined : { label: t("trip.toast.open"), to: "/trip-builder" },
    });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={inTrip}
      title={inTrip ? t("trip.remove") : t("trip.add")}
      className={cn(
        buttonClasses(inTrip ? "secondary" : variant, size),
        inTrip && "border-teal-600 bg-teal-50 text-teal-700 hover:bg-teal-100",
        className,
      )}
    >
      {/* Keyed on the state, so the tick lands with a small spring when it changes. */}
      <m.span key={String(inTrip)} initial="hidden" animate="visible" variants={popIn} className="inline-flex" aria-hidden>
        {inTrip ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}
      </m.span>
      {inTrip ? t("trip.added") : t("trip.add")}
    </button>
  );
}
