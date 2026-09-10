import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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
import { CostLines, CostTotal, EstimateControls, EstimateDisclaimer } from "@/components/trip/CostBreakdown";
import { Icon } from "@/components/ui/Icon";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useTripStore } from "@/lib/trip-store";
import { estimateTrip } from "@/lib/estimate";
import { experienceSlugsInDays, tripWarnings } from "@/lib/trip-plan";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/cn";

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
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get("step");
  // Someone who already has days lands on the itinerary; a first visit starts at the beginning.
  const step: TripStep = isStep(requested) ? requested : trip.days.length > 0 ? "itinerary" : "basics";
  const goTo = (next: TripStep) => {
    setSearchParams({ step: next });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const estimate = useMemo(
    () =>
      estimateTrip({
        days: trip.days,
        tier: trip.tier,
        adults: trip.adults,
        children: trip.children,
        tourStyle: trip.tourStyle,
        serviceIncluded: trip.serviceIncluded,
      }),
    [trip.days, trip.tier, trip.adults, trip.children, trip.tourStyle, trip.serviceIncluded],
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
  // What "done" means for each step, and a tick only once every step before
  // it is done too. Any step can still be opened and read at any time.
  const problems = warnings.filter((warning) => warning.severity === "warning").length;
  const complete: Record<TripStep, boolean> = {
    basics: visited.has("basics"),
    places: trip.days.length > 0,
    stay: visited.has("stay"),
    experiences: experienceSlugsInDays(trip.days).length > 0,
    itinerary: visited.has("itinerary") && trip.days.length > 0 && problems === 0,
  };
  const reached = new Set<TripStep>();
  for (const candidate of TRIP_STEPS) {
    if (!complete[candidate]) break;
    reached.add(candidate);
  }

  const index = TRIP_STEPS.indexOf(step);
  const next = TRIP_STEPS[index + 1];
  const previous = TRIP_STEPS[index - 1];
  // After the last step comes the full estimate, on its own page.
  const nextLabel = next ? t(`builder.next.${next}`) : t("builder.next.estimate");
  const goNext = () => (next ? goTo(next) : navigate("/trip-summary"));

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
  // The phone's cost panel: closed by default, and closed again on every step change.
  const [costOpen, setCostOpen] = useState(false);
  useEffect(() => setCostOpen(false), [step]);

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
                <div className="flex flex-col items-end gap-2">
                  <Button onClick={goNext}>{nextLabel}</Button>
                  {!next && <p className="max-w-xs text-end text-xs text-ink-muted">{t("builder.itinerary.whatNext")}</p>}
                </div>
              </div>
            </div>

            <aside className="hidden lg:block">
              {/* Taller than a short viewport once the breakdown is in; it scrolls inside itself rather than pinning its top out of reach. */}
              <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto">
                <TripSummary
                  trip={trip}
                  estimate={estimate}
                  warnings={warnings}
                  nextLabel={nextLabel}
                  onNext={goNext}
                  onReset={() => setConfirmReset(true)}
                />
              </div>
            </aside>
          </div>
        </Container>
      </Section>

      {/* The phone gets the number and the next step, pinned to the bottom,
          and the breakdown behind the number, a tap away. */}
      <div className="sticky bottom-0 z-30 border-t border-line bg-canvas/95 backdrop-blur-sm lg:hidden">
        {costOpen && (
          <div id="mobile-cost-panel" className="max-h-[60vh] overflow-y-auto border-b border-line bg-sand-50 px-5 py-4">
            <CostLines estimate={estimate} currency={trip.currency} tier={trip.tier} />
            <CostTotal estimate={estimate} currency={trip.currency} size="md" className="mt-3 border-t border-line pt-3" />
            <EstimateControls
              compact
              idPrefix="mobile"
              tourStyle={trip.tourStyle}
              serviceIncluded={trip.serviceIncluded}
              currency={trip.currency}
              onChange={trip.setPricing}
              className="mt-4 border-t border-line pt-4"
            />
            <EstimateDisclaimer compact className="mt-4" />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
              <Link to="/trip-summary" className="inline-flex min-h-11 items-center text-sm text-charcoal-800 underline underline-offset-4">
                {t("estimate.fullLink")}
              </Link>
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="min-h-11 text-sm text-ink-muted underline underline-offset-4"
              >
                {t("builder.reset.action")}
              </button>
            </div>
          </div>
        )}
        {firstProblem && (
          <Link
            to={`/trip-builder?step=itinerary${firstProblem.dayIndex !== undefined ? `#day-${firstProblem.dayIndex + 1}` : ""}`}
            className="block border-b border-ember-600/30 bg-ember-50 px-5 py-2 text-xs leading-snug text-ember-800"
          >
            {t(`builder.warnings.${firstProblem.kind}`, firstProblem.params)}
          </Link>
        )}
        <Container className="flex items-center justify-between gap-4 py-3">
          <button
            type="button"
            onClick={() => setCostOpen((open) => !open)}
            aria-expanded={costOpen}
            aria-controls="mobile-cost-panel"
            className="flex min-h-11 items-center gap-2 text-start"
          >
            <span>
              <span className="block text-xs text-ink-muted">{t("estimate.total")}</span>
              <span className="block font-display text-xl text-charcoal-900" aria-live="polite">{formatMoney(estimate.total, trip.currency, language)}</span>
            </span>
            <Icon name="chevronDown" className={cn("h-4 w-4 text-ink-muted transition-transform", costOpen && "rotate-180")} />
            <span className="sr-only">{costOpen ? t("estimate.hideBreakdown") : t("estimate.showBreakdown")}</span>
          </button>
          {/* "Start over" lives in the panel: the bar keeps to the number and the next step. */}
          <Button size="sm" onClick={goNext} className="shrink-0">
            {nextLabel}
          </Button>
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
