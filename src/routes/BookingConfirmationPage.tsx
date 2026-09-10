import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { m, useReducedMotion } from "framer-motion";
import { Container, Section } from "@/components/ui/Layout";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { riseIn, stagger, transitions } from "@/lib/motion";
import { TripReview } from "@/components/booking/TripReview";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useBookingStore, type SentRequest } from "@/lib/booking-store";
import { countryName, preferenceSummary } from "@/lib/booking-request";
import { formatDate } from "@/lib/format";
import { isReference, type BookingRecord } from "../../shared/booking";

type Loaded = { kind: "loading" } | { kind: "missing" } | { kind: "record"; record: BookingRecord | SentRequest };

/**
 * The receipt for a request: its reference, what was sent, what happens
 * next, and a way to keep it on paper. The browser that sent it has the
 * whole thing, contact details included; any other browser with the link
 * gets the trip and the estimate from the API, and nothing personal.
 *
 * The one moment on the site that deserves a flourish: the tick draws
 * itself, then the reference and the rest rise in one after another.
 */
export function BookingConfirmationPage() {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? "en";
  const reduceMotion = useReducedMotion();
  usePageMeta(t("meta.confirmation"), t("pages.confirmation.intro"), { noindex: true });
  const [searchParams] = useSearchParams();
  const reference = (searchParams.get("ref") ?? "").toUpperCase();
  const lastRequest = useBookingStore((state) => state.lastRequest);
  const local = lastRequest && lastRequest.reference === reference ? lastRequest : null;
  const [loaded, setLoaded] = useState<Loaded>(() => (local ? { kind: "record", record: local } : { kind: "loading" }));

  const forget = useBookingStore((state) => state.forgetLastRequest);
  useEffect(() => {
    if (local) return setLoaded({ kind: "record", record: local });
    if (!isReference(reference)) return setLoaded({ kind: "missing" });
    let cancelled = false;
    setLoaded({ kind: "loading" });
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15_000);
    fetch(`/api/requests?ref=${encodeURIComponent(reference)}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(String(response.status));
        return (await response.json()) as BookingRecord;
      })
      .then((record) => {
        if (!cancelled) setLoaded({ kind: "record", record });
      })
      .catch(() => {
        if (!cancelled) setLoaded({ kind: "missing" });
      });
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [local, reference]);

  if (loaded.kind !== "record") {
    return (
      <Section>
        <Container>
          {loaded.kind === "loading" ? (
            // The shape of the page it is waiting for, so nothing jumps when it arrives.
            <div className="min-h-[70svh]" aria-busy="true">
              <p className="sr-only" aria-live="polite">{t("booking.confirmation.loading")}</p>
              <div aria-hidden className="max-w-3xl space-y-5">
                <div className="skeleton h-3 w-28" />
                <div className="skeleton h-12 w-4/5" />
                <div className="skeleton h-5 w-2/3" />
                <div className="skeleton mt-8 h-24 w-72" />
              </div>
            </div>
          ) : (
            <EmptyState
              className="mx-auto max-w-xl"
              icon="receipt"
              headingLevel="h1"
              title={t("booking.confirmation.notFoundTitle")}
              body={t("booking.confirmation.notFoundBody")}
              action={<ButtonLink to="/trip-builder">{t("booking.empty.action")}</ButtonLink>}
            />
          )}
        </Container>
      </Section>
    );
  }

  const { record } = loaded;
  const sent = "traveller" in record ? record : null;
  const preferences = sent ? preferenceSummary(sent.preferences, t) : [];

  return (
    <>
      <Section className="pb-8 lg:pb-10">
        <Container>
          <m.div initial="hidden" animate="visible" variants={stagger(0.15, 0.12)}>
            <m.div variants={riseIn} className="flex items-center gap-4">
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-700 text-ivory" aria-hidden>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <m.path
                    d="m5 12.5 4.5 4.5L19 7"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={reduceMotion ? false : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.2, duration: 0.55, ease: "easeOut" }}
                  />
                </svg>
              </span>
              <p className="eyebrow text-teal-700">{t("pages.confirmation.eyebrow")}</p>
            </m.div>
            <m.h1 variants={riseIn} className="mt-5 text-display text-charcoal-900">
              {t("pages.confirmation.title")}
            </m.h1>
            <m.p variants={riseIn} className="mt-4 max-w-2xl text-lead leading-relaxed text-charcoal-600">
              {record.firstName ? t("booking.confirmation.thanks", { name: record.firstName }) : t("booking.confirmation.thanksNoName")}
            </m.p>
            <m.div
              variants={{ hidden: { opacity: 0, scale: 0.94 }, visible: { opacity: 1, scale: 1, transition: transitions.pop } }}
              className="mt-8 inline-flex flex-col gap-1 border border-line bg-sand-50 px-6 py-4"
            >
              <span className="text-xs uppercase tracking-wide text-ink-muted">{t("booking.confirmation.reference")}</span>
              <span className="font-display text-3xl text-charcoal-900 tabular-nums" dir="ltr">
                {record.reference}
              </span>
              <span className="text-xs text-ink-muted">
                {t("booking.confirmation.sent", { date: formatDate(new Date(record.createdAt), language, { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) })}
              </span>
            </m.div>
            <m.p variants={riseIn} className="mt-3 max-w-xl text-sm leading-relaxed text-ink-muted">
              {t("booking.confirmation.referenceHint")}
            </m.p>
            <m.div variants={riseIn} className="mt-6 flex flex-wrap gap-3 print:hidden">
              <Button onClick={() => window.print()}>{t("booking.confirmation.printAction")}</Button>
              <ButtonLink to="/trip-builder" variant="secondary">
                {t("booking.confirmation.anotherTrip")}
              </ButtonLink>
            </m.div>
          </m.div>
        </Container>
      </Section>

      <Section className="pt-0 lg:pt-0">
        <Container>
          <m.div initial="hidden" animate="visible" variants={stagger(0.7, 0.1)} className="grid gap-12 lg:grid-cols-[1fr_22rem] lg:gap-14">
            <div className="min-w-0 space-y-12">
              <m.section variants={riseIn} aria-labelledby="what-next" className="border-s-2 border-teal-600 bg-teal-50 px-5 py-5">
                <h2 id="what-next" className="font-display text-xl text-charcoal-900">{t("booking.confirmation.nextTitle")}</h2>
                <p className="mt-2 text-sm leading-relaxed text-charcoal-700">
                  {t("booking.confirmation.responseBody")}
                  {sent &&
                    ` ${t("booking.confirmation.replyBy", {
                      method: t(`booking.details.contact.${sent.traveller.contactMethod}`),
                      // Isolated, or an Arabic sentence reverses the digit groups of the number.
                      address: `\u2066${sent.traveller.contactMethod === "email" ? sent.traveller.email : sent.traveller.phone}\u2069`,
                    })}`}
                </p>
                <ol className="mt-4 space-y-2 text-sm leading-relaxed text-charcoal-700">
                  {(["check", "quote", "confirm"] as const).map((key, index) => (
                    <li key={key} className="flex gap-3">
                      <span className="shrink-0 text-ink-muted tabular-nums">{index + 1}.</span>
                      <span>{t(`booking.confirmation.steps.${key}`)}</span>
                    </li>
                  ))}
                </ol>
              </m.section>

              <m.section variants={riseIn} aria-labelledby="sent-trip">
                <h2 id="sent-trip" className="font-display text-2xl text-charcoal-900">{t("booking.confirmation.tripTitle")}</h2>
                <TripReview trip={record.trip} estimate={record.estimate} className="mt-5" />
              </m.section>

              {sent && (
                <m.section variants={riseIn} aria-labelledby="sent-details" className="grid gap-8 md:grid-cols-2">
                  <div>
                    <h2 id="sent-details" className="font-display text-xl text-charcoal-900">{t("booking.send.yourDetails")}</h2>
                    <dl className="mt-3 space-y-2 text-sm">
                      <Line label={t("booking.details.fullName")} value={sent.traveller.fullName} />
                      <Line label={t("booking.details.email")} value={sent.traveller.email} ltr />
                      <Line label={t("booking.details.phone")} value={sent.traveller.phone} ltr />
                      <Line label={t("booking.details.country")} value={countryName(sent.traveller.country, language)} />
                      <Line label={t("booking.details.contactMethod")} value={t(`booking.details.contact.${sent.traveller.contactMethod}`)} />
                    </dl>
                  </div>
                  <div>
                    <h2 className="font-display text-xl text-charcoal-900">{t("booking.send.yourPreferences")}</h2>
                    {preferences.length === 0 ? (
                      <p className="mt-3 text-sm text-ink-muted">{t("booking.send.nothingAdded")}</p>
                    ) : (
                      <dl className="mt-3 space-y-2 text-sm">
                        {preferences.map((line) => (
                          <Line key={line.label} label={line.label} value={line.value} />
                        ))}
                      </dl>
                    )}
                  </div>
                </m.section>
              )}
            </div>

            <m.aside variants={riseIn} className="print:hidden">
              <div className="border border-line bg-sand-50 p-6 lg:sticky lg:top-28">
                <p className="eyebrow text-ink-muted">{t("booking.confirmation.keepTitle")}</p>
                <p className="mt-3 text-sm leading-relaxed text-charcoal-700">{t("booking.confirmation.keepBody")}</p>
                <ul className="mt-4 space-y-2 text-sm">
                  {sent && (
                    <li>
                      <button
                        type="button"
                        onClick={() => {
                          forget();
                          setLoaded({ kind: "missing" });
                        }}
                        className="text-start text-charcoal-800 underline underline-offset-4 hover:text-ember-700"
                      >
                        {t("booking.confirmation.forget")}
                      </button>
                      <span className="mt-1 block text-xs text-ink-muted">{t("booking.confirmation.forgetHint")}</span>
                    </li>
                  )}
                  <li>
                    <Link to="/" className="text-charcoal-800 underline underline-offset-4 hover:text-ember-700">
                      {t("booking.confirmation.home")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/faq" className="text-charcoal-800 underline underline-offset-4 hover:text-ember-700">
                      {t("booking.confirmation.faq")}
                    </Link>
                  </li>
                </ul>
              </div>
            </m.aside>
          </m.div>
        </Container>
      </Section>
    </>
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
