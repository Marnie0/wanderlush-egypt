import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Container, Section } from "@/components/ui/Layout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Field, inputClasses } from "@/components/booking/Field";
import { usePageMeta } from "@/hooks/usePageMeta";
import { formatNumber } from "@/lib/format";
import { CONTACT_LIMITS, emptyMessage, validateMessage, type ContactMessage, type ContactPayload } from "../../shared/contact";
import { cn } from "@/lib/cn";

type Sent = { name: string; email: string };

/**
 * A message to a specialist that is not a booking request: a question, a
 * change to a request already sent, a trip that is still an idea. One form,
 * checked on the first attempt to send and live after that, the same rules
 * the API applies. The reply comes by email, so there is no reference and
 * no receipt page, only the thank-you in place of the form.
 */
export function ContactPage() {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? "en";
  usePageMeta(t("meta.contact"), t("pages.contact.intro"));

  const [message, setMessage] = useState<ContactMessage>(emptyMessage);
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sent, setSent] = useState<Sent | null>(null);
  const errors = useMemo(() => validateMessage(message), [message]);
  const shown = attempted ? errors : {};
  const valid = Object.keys(errors).length === 0;
  const patch = (change: Partial<ContactMessage>) => setMessage((current) => ({ ...current, ...change }));
  const error = (field: keyof ContactMessage) => (shown[field] ? t(`contact.errors.${shown[field]}`) : undefined);

  // The invalid marks appear on the render after the attempt; focus follows them.
  const formRef = useRef<HTMLFormElement>(null);
  const [focusInvalid, setFocusInvalid] = useState(0);
  useEffect(() => {
    if (focusInvalid === 0) return;
    formRef.current?.querySelector<HTMLElement>("[aria-invalid]")?.focus();
  }, [focusInvalid]);

  const send = async () => {
    setAttempted(true);
    if (!valid) return setFocusInvalid((n) => n + 1);
    if (!consent) {
      setConsentError(true);
      document.getElementById("contact-consent")?.focus();
      return;
    }
    setSending(true);
    setSendError(null);
    const payload: ContactPayload = {
      language,
      message: { ...message, reference: message.reference.trim().toUpperCase() },
      wl_extra: (document.getElementById("wl-extra") as HTMLInputElement | null)?.value ?? "",
    };
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20_000);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      if (!response.ok) {
        setSendError(t(response.status === 400 ? "contact.failedInvalid" : response.status === 429 ? "contact.failedRate" : "contact.failed"));
        return;
      }
      setSent({ name: message.fullName.trim().split(/\s+/)[0] ?? "", email: message.email.trim() });
      setMessage(emptyMessage);
      setConsent(false);
      setAttempted(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setSendError(t("contact.failedNetwork"));
    } finally {
      window.clearTimeout(timeout);
      setSending(false);
    }
  };

  const errorCount = Object.keys(shown).length;
  const used = Array.from(message.message).length;

  return (
    <>
      <PageHeader eyebrow={t("pages.contact.eyebrow")} title={t("pages.contact.title")} intro={t("pages.contact.intro")} />
      <Section className="pt-0 lg:pt-0">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_22rem] lg:gap-14">
            <div className="min-w-0">
              {sent ? (
                <div role="status" className="border-s-2 border-teal-600 bg-teal-50 px-5 py-5">
                  <h2 className="font-display text-2xl text-charcoal-900">{t("contact.sentTitle")}</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-charcoal-700">
                    {/* The address is isolated so an Arabic sentence cannot reorder it. */}
                    {t("contact.sentBody", { name: sent.name, email: `⁦${sent.email}⁩` })}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Button variant="secondary" size="sm" onClick={() => setSent(null)}>
                      {t("contact.another")}
                    </Button>
                    <ButtonLink to="/" variant="secondary" size="sm">
                      {t("common.backHome")}
                    </ButtonLink>
                  </div>
                </div>
              ) : (
                <form
                  ref={formRef}
                  noValidate
                  onSubmit={(event) => {
                    event.preventDefault();
                    void send();
                  }}
                >
                  <h2 className="font-display text-2xl text-charcoal-900">{t("contact.title")}</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">{t("contact.hint")}</p>
                  {errorCount > 0 && (
                    <p role="alert" className="mt-4 border-s-2 border-ember-600 bg-ember-50 px-4 py-2.5 text-sm text-ember-800">
                      {t("contact.errors.summary", { count: errorCount })}
                    </p>
                  )}
                  <div className="mt-8 max-w-xl space-y-6">
                    <Field id="contact-name" label={t("contact.fullName")} error={error("fullName")}>
                      {(props) => (
                        <input
                          {...props}
                          type="text"
                          autoComplete="name"
                          maxLength={CONTACT_LIMITS.name}
                          value={message.fullName}
                          onChange={(event) => patch({ fullName: event.target.value })}
                          className={inputClasses(props["aria-invalid"])}
                        />
                      )}
                    </Field>
                    <Field id="contact-email" label={t("contact.email")} error={error("email")}>
                      {(props) => (
                        <input
                          {...props}
                          type="email"
                          autoComplete="email"
                          inputMode="email"
                          maxLength={CONTACT_LIMITS.email}
                          value={message.email}
                          onChange={(event) => patch({ email: event.target.value })}
                          className={inputClasses(props["aria-invalid"])}
                          dir="ltr"
                        />
                      )}
                    </Field>
                    <Field id="contact-reference" label={t("contact.reference")} hint={t("contact.referenceHint")} optional={t("booking.preferences.optional")} error={error("reference")}>
                      {(props) => (
                        <input
                          {...props}
                          type="text"
                          autoComplete="off"
                          maxLength={20}
                          placeholder="WL-"
                          value={message.reference}
                          onChange={(event) => patch({ reference: event.target.value })}
                          className={cn(inputClasses(props["aria-invalid"]), "uppercase tabular-nums")}
                          dir="ltr"
                        />
                      )}
                    </Field>
                    <Field id="contact-message" label={t("contact.message")} hint={t("contact.messageHint")} error={error("message")}>
                      {(props) => (
                        <>
                          <textarea
                            {...props}
                            rows={6}
                            maxLength={CONTACT_LIMITS.message}
                            value={message.message}
                            onChange={(event) => patch({ message: event.target.value })}
                            className={inputClasses(props["aria-invalid"])}
                          />
                          <p className="mt-1 text-end text-xs text-ink-muted" aria-hidden>
                            {t("booking.preferences.chars", { used: formatNumber(used, language), max: formatNumber(CONTACT_LIMITS.message, language) })}
                          </p>
                        </>
                      )}
                    </Field>

                    <div>
                      <div className={cn("flex items-start gap-3 border p-4", consentError ? "border-ember-600 bg-ember-50" : "border-line")}>
                        <input
                          id="contact-consent"
                          type="checkbox"
                          checked={consent}
                          onChange={(event) => {
                            setConsent(event.target.checked);
                            if (event.target.checked) setConsentError(false);
                          }}
                          aria-describedby={consentError ? "contact-consent-error" : undefined}
                          aria-invalid={consentError || undefined}
                          className="mt-0.5 h-5 w-5 shrink-0 accent-ember-600"
                        />
                        <label htmlFor="contact-consent" className="text-sm leading-relaxed text-charcoal-800">
                          {t("contact.consent")}{" "}
                          <Link to="/privacy" className="underline underline-offset-4 hover:text-ember-700">
                            {t("contact.consentLink")}
                          </Link>
                          .
                        </label>
                      </div>
                      {consentError && (
                        <p id="contact-consent-error" role="alert" className="mt-1.5 text-sm text-ember-700">
                          {t("contact.consentRequired")}
                        </p>
                      )}
                    </div>
                    {/* Not for people: hidden from the page and from assistive technology. */}
                    <div aria-hidden className="absolute -start-[9999px] h-px w-px overflow-hidden">
                      <input id="wl-extra" name="wl_extra" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
                    </div>

                    <div className="flex flex-col items-start gap-2 border-t border-line pt-6">
                      {sendError && (
                        <p role="alert" className="max-w-md text-sm text-ember-700">
                          {sendError}
                        </p>
                      )}
                      <Button type="submit" disabled={sending} aria-busy={sending}>
                        {sending ? t("contact.sending") : t("contact.submit")}
                      </Button>
                      <p className="max-w-md text-xs leading-relaxed text-ink-muted">{t("contact.whatHappens")}</p>
                    </div>
                  </div>
                </form>
              )}
            </div>

            <aside>
              <div className="border border-line bg-sand-50 p-6 lg:sticky lg:top-28">
                <p className="eyebrow text-ink-muted">{t("contact.asideTitle")}</p>
                <h2 className="mt-3 font-display text-xl text-charcoal-900">{t("contact.builtTrip")}</h2>
                <p className="mt-2 text-sm leading-relaxed text-charcoal-700">{t("contact.builtTripBody")}</p>
                <ButtonLink to="/booking" variant="secondary" size="sm" className="mt-4">
                  {t("contact.request")}
                </ButtonLink>
                <h2 className="mt-8 font-display text-xl text-charcoal-900">{t("contact.faq")}</h2>
                <p className="mt-2 text-sm leading-relaxed text-charcoal-700">{t("contact.faqBody")}</p>
                <Link to="/faq" className="mt-3 inline-block text-sm text-charcoal-800 underline underline-offset-4 hover:text-ember-700">
                  {t("nav.faq")}
                </Link>
              </div>
            </aside>
          </div>
        </Container>
      </Section>
    </>
  );
}
