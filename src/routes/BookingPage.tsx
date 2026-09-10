import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { countryCodes, featuredCountries } from "@content/countries";
import { Container, Section } from "@/components/ui/Layout";
import { Button, ButtonLink } from "@/components/ui/Button";
import { FilterToggle } from "@/components/ui/FilterControls";
import { EmptyState } from "@/components/ui/EmptyState";
import { StepPanel } from "@/components/ui/StepPanel";
import { Stepper } from "@/components/trip/Stepper";
import { TripWarnings } from "@/components/trip/TripWarnings";
import { ConfirmNotice } from "@/components/trip/ConfirmNotice";
import { TripReview } from "@/components/booking/TripReview";
import { Field, RadioCards, inputClasses } from "@/components/booking/Field";
import { usePageMeta } from "@/hooks/usePageMeta";
import { unconfirmedSteps, useTripStore } from "@/lib/trip-store";
import { useBookingStore } from "@/lib/booking-store";
import { estimateTrip } from "@/lib/estimate";
import { tripWarnings } from "@/lib/trip-plan";
import { countryCollator, countryName, preferenceSummary, snapshotEstimate, snapshotTrip } from "@/lib/booking-request";
import { formatNumber } from "@/lib/format";
import {
  CONTACT_METHODS,
  DIETARY_OPTIONS,
  LIMITS,
  OCCASIONS,
  ROOM_TYPES,
  validateDetails,
  type BookingPayload,
  type DetailsErrors,
  type Preferences,
  type TravellerDetails,
  normalizeDigits,
} from "../../shared/booking";
import { cn } from "@/lib/cn";

const BOOKING_STEPS = ["review", "details", "preferences", "send"] as const;
type BookingStep = (typeof BOOKING_STEPS)[number];
const isStep = (value: string | null): value is BookingStep => BOOKING_STEPS.includes(value as BookingStep);

const VISITED_KEY = "wanderlush.booking-visited";

/**
 * The itinerary becomes an inquiry in four steps: read it back, say who
 * you are, say what you need, send it. Nothing is paid and nothing is
 * booked; a specialist replies. The step lives in the URL, the draft in the
 * browser, and the trip itself stays where it was built.
 */
export function BookingPage() {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? "en";
  usePageMeta(t("meta.booking"), t("pages.booking.intro"), { noindex: true });
  const navigate = useNavigate();
  const trip = useTripStore();
  const booking = useBookingStore();

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
  const problems = warnings.filter((warning) => warning.severity === "warning");
  // Defaults nobody looked at are not a trip anyone asked for: the review
  // holds the request until dates, party and stay level have been seen.
  const unconfirmed = unconfirmedSteps(trip);
  const blocked = problems.length > 0 || unconfirmed.length > 0;
  const requestTrip = useMemo(() => snapshotTrip(trip), [trip]);
  const requestEstimate = useMemo(() => snapshotEstimate(estimate), [estimate]);
  const errors = useMemo(() => validateDetails(booking.details, countryCodes), [booking.details]);
  const detailsValid = Object.keys(errors).length === 0;

  // Details are checked when the visitor tries to leave the step, not on
  // every keystroke; after that first attempt the messages follow the typing.
  const [attempted, setAttempted] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get("step");
  const wanted: BookingStep = isStep(requested) ? requested : "review";
  // Later steps are not gates the visitor can vault: with problems on the trip
  // it is the review; without valid details, the details. The correction is a
  // navigation, so the URL agrees with the page and finishing the last field
  // never swaps the step under the visitor's hands.
  const allowed: BookingStep =
    blocked && wanted !== "review" ? "review" : wanted === "send" && !detailsValid ? "details" : wanted;
  const step = allowed;
  // Set once the request is away: the store empties then, which would make the
  // details "invalid" and send the redirect racing the move to the confirmation.
  const leaving = useRef(false);
  useEffect(() => {
    if (allowed === wanted || leaving.current) return;
    if (wanted === "send") setAttempted(true);
    setSearchParams(
      (params) => {
        params.set("step", allowed);
        return params;
      },
      { replace: true },
    );
    // Only the mismatch matters; the setter is stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowed, wanted]);
  const navigated = useRef(false);
  const goTo = (next: BookingStep) => {
    navigated.current = true;
    // Other params (a shared ?lng=) ride along.
    setSearchParams((params) => {
      params.set("step", next);
      return params;
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  // A new step announces itself: focus lands on its heading, not on whatever
  // button happened to keep the same position.
  const stepRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (!navigated.current) return;
    stepRef.current?.querySelector<HTMLElement>("h2")?.focus({ preventScroll: true });
  }, [step]);

  const [visited, setVisited] = useState<Set<BookingStep>>(() => {
    try {
      return new Set(JSON.parse(sessionStorage.getItem(VISITED_KEY) ?? "[]") as BookingStep[]);
    } catch {
      return new Set();
    }
  });
  useEffect(() => {
    if (visited.has(step)) return;
    const next = new Set(visited).add(step);
    setVisited(next);
    try {
      sessionStorage.setItem(VISITED_KEY, JSON.stringify([...next]));
    } catch {
      // Ticks are a courtesy.
    }
  }, [step, visited]);
  const complete: Record<BookingStep, boolean> = {
    review: trip.days.length > 0 && !blocked,
    details: detailsValid,
    preferences: visited.has("preferences"),
    send: false,
  };
  const reached = new Set<BookingStep>();
  for (const candidate of BOOKING_STEPS) {
    if (!complete[candidate]) break;
    reached.add(candidate);
  }

  const detailsRef = useRef<HTMLDivElement>(null);
  const [focusInvalid, setFocusInvalid] = useState(0);
  const leaveDetails = (next: BookingStep) => {
    if (detailsValid) return goTo(next);
    setAttempted(true);
    setFocusInvalid((n) => n + 1);
  };
  // The invalid marks appear on the render after the attempt; focus follows them.
  useEffect(() => {
    if (focusInvalid === 0) return;
    detailsRef.current?.querySelector<HTMLElement>("[aria-invalid]")?.focus();
  }, [focusInvalid]);

  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [consentError, setConsentError] = useState(false);
  const send = async () => {
    if (!booking.consent) {
      setConsentError(true);
      document.getElementById("consent")?.focus();
      return;
    }
    setSending(true);
    setSendError(null);
    const payload: BookingPayload = {
      language,
      traveller: booking.details,
      preferences: booking.preferences,
      trip: requestTrip,
      estimate: requestEstimate,
      wl_extra: (document.getElementById("wl-extra") as HTMLInputElement | null)?.value ?? "",
    };
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20_000);
    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { field?: string };
        setSendError(
          response.status === 400
            ? t("booking.send.failedInvalid", { field: t(`booking.send.fields.${body.field ?? "trip"}`) })
            : response.status === 429
              ? t("booking.send.failedRate")
              : t("booking.send.failed"),
        );
        return;
      }
      const { reference, createdAt } = (await response.json()) as { reference: string; createdAt: string };
      leaving.current = true;
      booking.recordSent({
        reference,
        createdAt,
        status: "new",
        language,
        firstName: booking.details.fullName.trim().split(/\s+/)[0] ?? "",
        trip: requestTrip,
        estimate: requestEstimate,
        traveller: booking.details,
        preferences: booking.preferences,
      });
      try {
        sessionStorage.removeItem(VISITED_KEY);
      } catch {
        // Nothing to do.
      }
      navigate(`/booking/confirmation?ref=${reference}`);
    } catch {
      setSendError(t("booking.send.failedNetwork"));
    } finally {
      window.clearTimeout(timeout);
      setSending(false);
    }
  };

  if (trip.days.length === 0) {
    return (
      <>
        <PageIntro t={t} />
        <Section className="pt-0 lg:pt-0">
          <Container>
            <EmptyState
              icon="route"
              title={t("booking.empty.title")}
              body={t("booking.empty.body")}
              action={<ButtonLink to="/trip-builder">{t("booking.empty.action")}</ButtonLink>}
            />
          </Container>
        </Section>
      </>
    );
  }

  const index = BOOKING_STEPS.indexOf(step);
  const previous = BOOKING_STEPS[index - 1];
  const next = BOOKING_STEPS[index + 1];

  return (
    <>
      <PageIntro t={t}>
        <Stepper
          steps={BOOKING_STEPS}
          label={(candidate) => t(`booking.steps.${candidate}`)}
          navLabel={t("booking.stepsLabel")}
          current={step}
          onSelect={(candidate) => (step === "details" && candidate !== "review" ? leaveDetails(candidate) : goTo(candidate))}
          reached={reached}
        />
      </PageIntro>

      <Section className="pt-0 lg:pt-0">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_22rem] lg:gap-14">
            {/* One form per step: Enter in a field does what the primary button does. */}
            <form
              ref={stepRef}
              className="min-w-0"
              noValidate
              onSubmit={(event) => {
                event.preventDefault();
                if (step === "send") void send();
                else if (step === "details" && next) leaveDetails(next);
                else if (next && !(step === "review" && blocked)) goTo(next);
              }}
            >
              <StepPanel step={step} index={index}>
              {step === "review" && (
                <div>
                  <h2 tabIndex={-1} className="font-display text-2xl text-charcoal-900 focus:outline-none">{t("booking.review.title")}</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">{t("booking.review.hint")}</p>
                  {unconfirmed.length > 0 && (
                    <div className="mt-6">
                      <p className="text-sm font-medium text-ember-700">{t("builder.confirm.blocked")}</p>
                      <ConfirmNotice unconfirmed={unconfirmed} trip={trip} className="mt-2" />
                    </div>
                  )}
                  {problems.length > 0 && (
                    <div className="mt-6">
                      <p className="text-sm font-medium text-ember-700">{t("booking.review.fixFirst", { count: problems.length })}</p>
                      <TripWarnings warnings={problems} linked className="mt-2" />
                    </div>
                  )}
                  <TripReview trip={requestTrip} estimate={requestEstimate} className="mt-8" />
                  <div className="mt-6 flex flex-wrap gap-3">
                    <ButtonLink to="/trip-builder?step=itinerary" variant="secondary" size="sm">
                      {t("booking.review.editTrip")}
                    </ButtonLink>
                    <ButtonLink to="/trip-summary" variant="secondary" size="sm">
                      {t("booking.review.adjustEstimate")}
                    </ButtonLink>
                  </div>
                </div>
              )}

              {step === "details" && (
                <div ref={detailsRef}>
                  <DetailsStep
                    details={booking.details}
                    errors={attempted ? errors : {}}
                    onChange={booking.setDetails}
                    language={language}
                  />
                </div>
              )}

              {step === "preferences" && <PreferencesStep preferences={booking.preferences} onChange={booking.setPreferences} language={language} />}

              {step === "send" && (
                <SendStep
                  details={booking.details}
                  preferences={booking.preferences}
                  consent={booking.consent}
                  consentError={consentError}
                  onConsent={(value) => {
                    booking.setConsent(value);
                    if (value) setConsentError(false);
                  }}
                  onEdit={goTo}
                  language={language}
                />
              )}

              </StepPanel>

              <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
                {previous ? (
                  <Button type="button" variant="secondary" onClick={() => goTo(previous)}>
                    {t("booking.back", { step: t(`booking.steps.${previous}`) })}
                  </Button>
                ) : (
                  <span />
                )}
                {step === "send" ? (
                  <div className="flex flex-col items-end gap-2">
                    {sendError && (
                      <p role="alert" className="max-w-md text-end text-sm text-ember-700">
                        {sendError}
                      </p>
                    )}
                    <Button type="submit" disabled={sending} aria-busy={sending}>
                      {sending ? t("booking.send.sending") : t("booking.send.submit")}
                    </Button>
                  </div>
                ) : step === "review" && blocked ? (
                  <p className="max-w-sm text-end text-sm text-ink-muted">{t("booking.review.blocked")}</p>
                ) : (
                  next && <Button type="submit">{t(`booking.next.${next}`)}</Button>
                )}
              </div>
            </form>

            <aside className="hidden lg:block">
              <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto border border-line bg-sand-50 p-6">
                <p className="eyebrow text-ink-muted">{t("booking.summary.title")}</p>
                <TripReview trip={requestTrip} estimate={requestEstimate} compact className="mt-4" />
                {blocked && (
                  <p className="mt-4 border-t border-line pt-4 text-sm text-ember-700">
                    <Link to="/booking?step=review" className="underline underline-offset-4">
                      {problems.length > 0 ? t("booking.review.fixFirst", { count: problems.length }) : t("builder.confirm.blocked")}
                    </Link>
                  </p>
                )}
              </div>
            </aside>
          </div>
        </Container>
      </Section>
    </>
  );
}

function PageIntro({ t, children }: { t: (key: string) => string; children?: React.ReactNode }) {
  return (
    <Section className="pb-8 lg:pb-10">
      <Container>
        <p className="eyebrow text-ember-600">{t("pages.booking.eyebrow")}</p>
        <h1 className="mt-4 text-display text-charcoal-900">{t("pages.booking.title")}</h1>
        <p className="mt-4 max-w-2xl text-lead leading-relaxed text-charcoal-600">{t("pages.booking.intro")}</p>
        {children && <div className="mt-10">{children}</div>}
      </Container>
    </Section>
  );
}

function DetailsStep({
  details,
  errors,
  onChange,
  language,
}: {
  details: TravellerDetails;
  errors: DetailsErrors;
  onChange: (patch: Partial<TravellerDetails>) => void;
  language: string;
}) {
  const { t } = useTranslation();
  const error = (field: keyof TravellerDetails) => (errors[field] ? t(`booking.errors.${errors[field]}`) : undefined);
  // Featured markets first, then everyone else in the visitor's alphabet.
  const countries = useMemo(() => {
    const named = countryCodes.map((code) => ({ code, name: countryName(code, language) }));
    const featured = featuredCountries.map((code) => named.find((c) => c.code === code)!).filter(Boolean);
    const rest = named
      .filter((c) => !(featuredCountries as readonly string[]).includes(c.code))
      .sort((a, b) => countryCollator(language).compare(a.name, b.name));
    return { featured, rest };
  }, [language]);
  const errorCount = Object.keys(errors).length;

  return (
    <div>
      <h2 tabIndex={-1} className="font-display text-2xl text-charcoal-900 focus:outline-none">{t("booking.details.title")}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">{t("booking.details.hint")}</p>
      {errorCount > 0 && (
        <p role="alert" className="mt-4 border-s-2 border-ember-600 bg-ember-50 px-4 py-2.5 text-sm text-ember-800">
          {t("booking.errors.summary", { count: errorCount })}
        </p>
      )}
      <div className="mt-8 max-w-xl space-y-6">
        <Field id="full-name" label={t("booking.details.fullName")} error={error("fullName")}>
          {(props) => (
            <input
              {...props}
              type="text"
              autoComplete="name"
              maxLength={LIMITS.name}
              value={details.fullName}
              onChange={(event) => onChange({ fullName: event.target.value })}
              className={inputClasses(props["aria-invalid"])}
            />
          )}
        </Field>
        <Field id="email" label={t("booking.details.email")} error={error("email")}>
          {(props) => (
            <input
              {...props}
              type="email"
              autoComplete="email"
              inputMode="email"
              maxLength={LIMITS.email}
              value={details.email}
              onChange={(event) => onChange({ email: event.target.value })}
              className={inputClasses(props["aria-invalid"])}
              dir="ltr"
            />
          )}
        </Field>
        <Field id="phone" label={t("booking.details.phone")} hint={t("booking.details.phoneHint")} error={error("phone")}>
          {(props) => (
            <input
              {...props}
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              maxLength={LIMITS.phone}
              value={details.phone}
              onChange={(event) => onChange({ phone: normalizeDigits(event.target.value) })}
              className={inputClasses(props["aria-invalid"])}
              dir="ltr"
            />
          )}
        </Field>
        <Field id="country" label={t("booking.details.country")} error={error("country")}>
          {(props) => (
            <select
              {...props}
              autoComplete="country"
              value={details.country}
              onChange={(event) => onChange({ country: event.target.value })}
              className={inputClasses(props["aria-invalid"])}
            >
              <option value="">{t("booking.details.countryPlaceholder")}</option>
              <optgroup label={t("booking.details.countryFeatured")}>
                {countries.featured.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label={t("booking.details.countryAll")}>
                {countries.rest.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </optgroup>
            </select>
          )}
        </Field>
        <RadioCards
          name="contact-method"
          legend={t("booking.details.contactMethod")}
          value={details.contactMethod}
          onChange={(contactMethod) => onChange({ contactMethod })}
          options={CONTACT_METHODS.map((method) => ({
            value: method,
            label: t(`booking.details.contact.${method}`),
            hint: t(`booking.details.contactHint.${method}`),
          }))}
        />
      </div>
    </div>
  );
}

function PreferencesStep({
  preferences,
  onChange,
  language,
}: {
  preferences: Preferences;
  onChange: (patch: Partial<Preferences>) => void;
  language: string;
}) {
  const { t } = useTranslation();
  const optional = t("booking.preferences.optional");
  const counter = (value: string, max: number) => t("booking.preferences.chars", { used: formatNumber(Array.from(value).length, language), max: formatNumber(max, language) });
  const textarea = (props: { id: string; "aria-describedby": string | undefined; "aria-invalid": true | undefined }, value: string, set: (v: string) => void, rows = 3, max: number = LIMITS.note) => (
    <>
      <textarea {...props} rows={rows} maxLength={max} value={value} onChange={(event) => set(event.target.value)} className={inputClasses()} />
      <p className="mt-1 text-end text-xs text-ink-muted" aria-hidden>
        {counter(value, max)}
      </p>
    </>
  );

  return (
    <div>
      <h2 tabIndex={-1} className="font-display text-2xl text-charcoal-900 focus:outline-none">{t("booking.preferences.title")}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">{t("booking.preferences.hint")}</p>
      <div className="mt-8 max-w-xl space-y-8">
        <fieldset>
          <legend className="text-sm font-medium text-charcoal-900">
            {t("booking.preferences.dietary")}
            <span className="ms-2 text-xs font-normal text-ink-muted">{optional}</span>
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {DIETARY_OPTIONS.map((option) => (
              <FilterToggle
                key={option}
                active={preferences.dietary.includes(option)}
                onClick={() =>
                  onChange({
                    dietary: preferences.dietary.includes(option)
                      ? preferences.dietary.filter((d) => d !== option)
                      : [...preferences.dietary, option],
                  })
                }
              >
                {t(`booking.preferences.dietaryOptions.${option}`)}
              </FilterToggle>
            ))}
          </div>
          {(preferences.dietary.length > 0 || preferences.dietaryNotes) && (
            <Field id="dietary-notes" label={t("booking.preferences.dietaryNotes")} className="mt-4">
              {(props) => textarea(props, preferences.dietaryNotes, (dietaryNotes) => onChange({ dietaryNotes }), 2)}
            </Field>
          )}
        </fieldset>

        <Field id="accessibility" label={t("booking.preferences.accessibility")} hint={t("booking.preferences.accessibilityHint")} optional={optional}>
          {(props) => textarea(props, preferences.accessibility, (accessibility) => onChange({ accessibility }))}
        </Field>

        <div className="space-y-4">
          <Field id="room-type" label={t("booking.preferences.room")} optional={optional}>
            {(props) => (
              <select {...props} value={preferences.roomType} onChange={(event) => onChange({ roomType: event.target.value as Preferences["roomType"] })} className={inputClasses()}>
                <option value="">{t("booking.preferences.roomAny")}</option>
                {ROOM_TYPES.map((room) => (
                  <option key={room} value={room}>
                    {t(`booking.preferences.roomTypes.${room}`)}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field id="room-notes" label={t("booking.preferences.roomNotes")} optional={optional}>
            {(props) => textarea(props, preferences.roomNotes, (roomNotes) => onChange({ roomNotes }), 2)}
          </Field>
        </div>

        <RadioCards
          name="airport-transfer"
          legend={`${t("booking.preferences.airportTransfer")} · ${optional}`}
          value={preferences.airportTransfer}
          onChange={(airportTransfer) => onChange({ airportTransfer })}
          columns={3}
          options={[
            { value: "yes" as const, label: t("booking.preferences.transferYes"), hint: t("booking.preferences.transferYesHint") },
            { value: "no" as const, label: t("booking.preferences.transferNo"), hint: t("booking.preferences.transferNoHint") },
            { value: "" as const, label: t("booking.preferences.transferUndecided") },
          ]}
        />

        <div className="space-y-4">
          <Field id="occasion" label={t("booking.preferences.occasion")} optional={optional}>
            {(props) => (
              <select {...props} value={preferences.occasion} onChange={(event) => onChange({ occasion: event.target.value as Preferences["occasion"] })} className={inputClasses()}>
                {OCCASIONS.map((occasion) => (
                  <option key={occasion} value={occasion}>
                    {t(`booking.preferences.occasions.${occasion}`)}
                  </option>
                ))}
              </select>
            )}
          </Field>
          {preferences.occasion !== "none" && (
            <Field id="occasion-notes" label={t("booking.preferences.occasionNotes")} optional={optional}>
              {(props) => textarea(props, preferences.occasionNotes, (occasionNotes) => onChange({ occasionNotes }), 2)}
            </Field>
          )}
        </div>

        <Field id="additional" label={t("booking.preferences.additional")} hint={t("booking.preferences.additionalHint")} optional={optional}>
          {(props) => textarea(props, preferences.additionalRequests, (additionalRequests) => onChange({ additionalRequests }), 4, LIMITS.note * 2)}
        </Field>
      </div>
    </div>
  );
}

/** Everything that will be sent, read back once more, and the one box that must be ticked. */
function SendStep({
  details,
  preferences,
  consent,
  consentError,
  onConsent,
  onEdit,
  language,
}: {
  details: TravellerDetails;
  preferences: Preferences;
  consent: boolean;
  consentError: boolean;
  onConsent: (value: boolean) => void;
  onEdit: (step: BookingStep) => void;
  language: string;
}) {
  const { t } = useTranslation();
  const preferenceLines = preferenceSummary(preferences, t);
  return (
    <div>
      <h2 tabIndex={-1} className="font-display text-2xl text-charcoal-900 focus:outline-none">{t("booking.send.title")}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">{t("booking.send.hint")}</p>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <section aria-labelledby="send-details" className="border border-line p-5">
          <div className="flex items-baseline justify-between gap-4">
            <h3 id="send-details" className="font-display text-lg text-charcoal-900">{t("booking.send.yourDetails")}</h3>
            <button type="button" onClick={() => onEdit("details")} className="text-sm text-charcoal-700 underline underline-offset-4 hover:text-ember-700">
              {t("booking.send.edit")}
            </button>
          </div>
          <dl className="mt-3 space-y-2 text-sm">
            <Line label={t("booking.details.fullName")} value={details.fullName} />
            <Line label={t("booking.details.email")} value={details.email} ltr />
            <Line label={t("booking.details.phone")} value={details.phone} ltr />
            <Line label={t("booking.details.country")} value={countryName(details.country, language)} />
            <Line label={t("booking.details.contactMethod")} value={t(`booking.details.contact.${details.contactMethod}`)} />
          </dl>
        </section>
        <section aria-labelledby="send-preferences" className="border border-line p-5">
          <div className="flex items-baseline justify-between gap-4">
            <h3 id="send-preferences" className="font-display text-lg text-charcoal-900">{t("booking.send.yourPreferences")}</h3>
            <button type="button" onClick={() => onEdit("preferences")} className="text-sm text-charcoal-700 underline underline-offset-4 hover:text-ember-700">
              {t("booking.send.edit")}
            </button>
          </div>
          {preferenceLines.length === 0 ? (
            <p className="mt-3 text-sm text-ink-muted">{t("booking.send.nothingAdded")}</p>
          ) : (
            <dl className="mt-3 space-y-2 text-sm">
              {preferenceLines.map((line) => (
                <Line key={line.label} label={line.label} value={line.value} />
              ))}
            </dl>
          )}
        </section>
      </div>

      <div className="mt-8 max-w-xl">
        <div className={cn("flex items-start gap-3 border p-4", consentError ? "border-ember-600 bg-ember-50" : "border-line")}>
          <input
            id="consent"
            type="checkbox"
            checked={consent}
            onChange={(event) => onConsent(event.target.checked)}
            aria-describedby={consentError ? "consent-error" : undefined}
            aria-invalid={consentError || undefined}
            className="mt-0.5 h-5 w-5 shrink-0 accent-ember-600"
          />
          <label htmlFor="consent" className="text-sm leading-relaxed text-charcoal-800">
            {t("booking.send.consent")}{" "}
            <Link to="/privacy" className="underline underline-offset-4 hover:text-ember-700">
              {t("booking.send.consentLink")}
            </Link>
            .
          </label>
        </div>
        {consentError && (
          <p id="consent-error" role="alert" className="mt-1.5 text-sm text-ember-700">
            {t("booking.send.consentRequired")}
          </p>
        )}
        {/* Not for people. Hidden from the page and from assistive technology,
            and named so that no form filler recognises it as a field it knows. */}
        <div aria-hidden className="absolute -start-[9999px] h-px w-px overflow-hidden">
          <input id="wl-extra" name="wl_extra" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
        </div>
        <p className="mt-4 text-xs leading-relaxed text-ink-muted">{t("booking.send.whatHappens")}</p>
      </div>
    </div>
  );
}

function Line({ label, value, ltr }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="shrink-0 text-ink-muted">{label}</dt>
      <dd className="min-w-0 break-words text-end text-charcoal-800" dir={ltr ? "ltr" : undefined}>
        {value || "–"}
      </dd>
    </div>
  );
}
