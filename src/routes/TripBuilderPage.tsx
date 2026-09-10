import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Container, Section } from "@/components/ui/Layout";
import { Button } from "@/components/ui/Button";
import { Stepper, TRIP_STEPS, type TripStep } from "@/components/trip/Stepper";
import { TripSummary } from "@/components/trip/TripSummary";
import { StepBasics } from "@/components/trip/StepBasics";
import { StepPlaces } from "@/components/trip/StepPlaces";
import { StepStay } from "@/components/trip/StepStay";
import { StepExperiences } from "@/components/trip/StepExperiences";
import { StepItinerary } from "@/components/trip/StepItinerary";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useTripStore } from "@/lib/trip-store";
import { estimateTrip } from "@/lib/estimate";
import { experienceSlugsInDays, tripWarnings } from "@/lib/trip-plan";
import { formatMoney } from "@/lib/format";

function isStep(value: string | null): value is TripStep {
  return TRIP_STEPS.includes(value as TripStep);
}

/**
 * The signature feature: a trip built in five steps that are really one
 * editable thing. The step lives in the URL so back and forward move between
 * steps, and the trip lives in the browser so a refresh loses nothing.
 */
export function TripBuilderPage() {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? "en";
  usePageMeta(t("meta.tripBuilder"), t("pages.tripBuilder.intro"));

  const trip = useTripStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get("step");
  // Someone who already has days lands on the itinerary; a first visit starts at the beginning.
  const step: TripStep = isStep(requested) ? requested : trip.days.length > 0 ? "itinerary" : "basics";
  const goTo = (next: TripStep) => {
    setSearchParams({ step: next });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const estimate = useMemo(
    () => estimateTrip({ days: trip.days, tier: trip.tier, adults: trip.adults, children: trip.children }),
    [trip.days, trip.tier, trip.adults, trip.children],
  );
  const warnings = useMemo(
    () => tripWarnings({ days: trip.days, durationDays: trip.durationDays, month: trip.month, children: trip.children }),
    [trip.days, trip.durationDays, trip.month, trip.children],
  );

  // A step counts as done once it has been seen or already holds something;
  // "Stay" is never ticked on the strength of a default the visitor never saw.
  const [visited, setVisited] = useState<Set<TripStep>>(() => {
    try {
      return new Set(JSON.parse(sessionStorage.getItem("wanderlush.visited-steps") ?? "[]") as TripStep[]);
    } catch {
      return new Set();
    }
  });
  useEffect(() => {
    if (visited.has(step)) return;
    const next = new Set(visited).add(step);
    setVisited(next);
    try {
      sessionStorage.setItem("wanderlush.visited-steps", JSON.stringify([...next]));
    } catch {
      // Storage can be unavailable; the ticks are a courtesy, not state.
    }
  }, [step, visited]);
  const reached = new Set<TripStep>(visited);
  if (trip.days.length > 0) reached.add("places").add("itinerary");
  if (experienceSlugsInDays(trip.days).length > 0) reached.add("experiences");
  reached.add(step);

  const index = TRIP_STEPS.indexOf(step);
  const next = TRIP_STEPS[index + 1];
  const previous = TRIP_STEPS[index - 1];
  const nextLabel = next ? t(`builder.next.${next}`) : null;

  const [confirmReset, setConfirmReset] = useState(false);
  const keepRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const reset = () => {
    trip.reset();
    setConfirmReset(false);
    goTo("basics");
  };
  // A small dialog still owes the keyboard an Escape and a starting focus.
  useEffect(() => {
    if (!confirmReset) return;
    const opener = document.activeElement as HTMLElement | null;
    keepRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setConfirmReset(false);
      // Two buttons; Tab goes between them and nowhere else.
      if (event.key === "Tab") {
        event.preventDefault();
        (document.activeElement === keepRef.current ? confirmRef.current : keepRef.current)?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, [confirmReset]);
  // The summary's problem links carry a day anchor; scroll to it once the step has rendered.
  useEffect(() => {
    if (step !== "itinerary" || !window.location.hash) return;
    const target = document.querySelector(window.location.hash);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);
  const firstProblem = warnings.find((warning) => warning.severity === "warning");

  return (
    <>
      <Section className="pb-8 lg:pb-10">
        <Container>
          <p className="eyebrow text-ember-600">{t("pages.tripBuilder.eyebrow")}</p>
          <h1 className="mt-4 text-display text-charcoal-900">{t("pages.tripBuilder.title")}</h1>
          <p className="mt-4 max-w-2xl text-lead leading-relaxed text-charcoal-600">{t("pages.tripBuilder.intro")}</p>
          <div className="mt-10">
            <Stepper current={step} onSelect={goTo} reached={reached} />
          </div>
        </Container>
      </Section>

      <Section className="pt-0 lg:pt-0">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_20rem] lg:gap-14">
            <div className="min-w-0">
              {step === "basics" && <StepBasics />}
              {step === "places" && <StepPlaces />}
              {step === "stay" && <StepStay />}
              {step === "experiences" && <StepExperiences />}
              {step === "itinerary" && <StepItinerary estimate={estimate} warnings={warnings} />}

              <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
                {previous ? (
                  <Button variant="secondary" onClick={() => goTo(previous)}>
                    {t("builder.back", { step: t(`builder.steps.${previous}`) })}
                  </Button>
                ) : (
                  <span />
                )}
                {nextLabel ? (
                  <Button onClick={() => goTo(next)}>{nextLabel}</Button>
                ) : (
                  <p className="text-sm text-ink-muted">{t("builder.itinerary.whatNext")}</p>
                )}
              </div>
            </div>

            <aside className="hidden lg:block">
              <div className="sticky top-28">
                <TripSummary
                  trip={trip}
                  estimate={estimate}
                  warnings={warnings}
                  nextLabel={nextLabel}
                  onNext={() => next && goTo(next)}
                  onReset={() => setConfirmReset(true)}
                />
              </div>
            </aside>
          </div>
        </Container>
      </Section>

      {/* The phone gets the number and the next step, pinned to the bottom. */}
      <div className="sticky bottom-0 z-30 border-t border-line bg-canvas/95 backdrop-blur-sm lg:hidden">
        {firstProblem && (
          <Link
            to={`/trip-builder?step=itinerary${firstProblem.dayIndex !== undefined ? `#day-${firstProblem.dayIndex + 1}` : ""}`}
            className="block border-b border-ember-600/30 bg-ember-50 px-5 py-2 text-xs leading-snug text-ember-800"
          >
            {t(`builder.warnings.${firstProblem.kind}`, firstProblem.params)}
          </Link>
        )}
        <Container className="flex items-center justify-between gap-4 py-3">
          <div>
            <p className="text-xs text-ink-muted">{t("builder.summary.estimate")}</p>
            <p className="font-display text-xl text-charcoal-900" aria-live="polite">{formatMoney(estimate.total, trip.currency, language)}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="min-h-11 px-2 text-xs text-ink-muted underline underline-offset-4"
            >
              {t("builder.reset.action")}
            </button>
            {nextLabel && (
              <Button size="sm" onClick={() => next && goTo(next)}>
                {nextLabel}
              </Button>
            )}
          </div>
        </Container>
      </div>

      {confirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-950/60 p-4" role="dialog" aria-modal="true" aria-labelledby="reset-title">
          <div className="w-full max-w-sm border border-line bg-canvas p-6">
            <h2 id="reset-title" className="font-display text-xl text-charcoal-900">{t("builder.reset.title")}</h2>
            <p className="mt-2 text-sm leading-relaxed text-charcoal-600">{t("builder.reset.body")}</p>
            <div className="mt-6 flex justify-end gap-3">
              <Button ref={keepRef} variant="secondary" size="sm" onClick={() => setConfirmReset(false)}>
                {t("builder.reset.keep")}
              </Button>
              <Button ref={confirmRef} size="sm" onClick={reset}>
                {t("builder.reset.confirm")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
