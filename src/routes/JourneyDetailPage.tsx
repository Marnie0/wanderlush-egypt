import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { m } from "framer-motion";
import { journeyBySlug } from "@content/journeys";
import { destinationBySlug } from "@content/destinations";
import { accommodationById } from "@content/accommodation";
import { Container, Eyebrow, Rule, Section } from "@/components/ui/Layout";
import { ButtonLink } from "@/components/ui/Button";
import { SmartImage, FULL_SIZES } from "@/components/ui/SmartImage";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useSolidHeader } from "@/lib/header-store";
import { pick, formatMoney } from "@/lib/format";
import { riseIn, stagger, transitions } from "@/lib/motion";

export function JourneyDetailPage() {
  const { slug = "" } = useParams();
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? "en";
  const journey = journeyBySlug.get(slug);
  useSolidHeader(!journey);

  usePageMeta(
    journey ? pick(journey.name, language) : undefined,
    journey ? pick(journey.tagline, language) : undefined,
  );

  // A wrong link deserves an answer, not a silent bounce to the list that
  // leaves the visitor wondering what they clicked.
  if (!journey) {
    return (
      <Section>
        <Container className="max-w-2xl text-center">
          <h1 className="text-display text-charcoal-900">{t("notFound.journey")}</h1>
          <p className="mt-6 text-lead leading-relaxed text-charcoal-600">
            {t("notFound.journeyBody")}
          </p>
          <ButtonLink to="/journeys" className="mt-10">
            {t("notFound.backToJourneys")}
          </ButtonLink>
        </Container>
      </Section>
    );
  }

  const tier = accommodationById.get(journey.suggestedTier);

  return (
    <>
      <section className="relative flex min-h-[65svh] items-end overflow-hidden">
        <SmartImage
          src={journey.heroImage.src}
          alt={pick(journey.heroImage.alt, language)}
          accent={journey.accent}
          priority
          showCredit
          sizes={FULL_SIZES}
          className="absolute inset-0 h-full w-full"
        />
        <div aria-hidden className="absolute inset-0 scrim-full" />
        <div aria-hidden className="absolute inset-0 scrim-inline" />
        <Container className="relative pb-16">
          <m.div initial="hidden" animate="visible" variants={stagger(0.1, 0.1)}>
            <m.p variants={riseIn} className="eyebrow on-photo text-gold-200">
              {t("common.days", { count: journey.days })}
            </m.p>
            <m.h1
              variants={{
                hidden: { opacity: 0, y: 32 },
                visible: { opacity: 1, y: 0, transition: transitions.cinematic },
              }}
              className="mt-4 text-hero text-ivory on-photo"
            >
              {pick(journey.name, language)}
            </m.h1>
            <m.p variants={riseIn} className="mt-4 max-w-2xl text-lead text-ivory/90 on-photo">
              {pick(journey.tagline, language)}
            </m.p>
          </m.div>
        </Container>
      </section>

      <Section>
        <Container className="grid gap-14 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <p className="text-lead leading-relaxed text-charcoal-700">
              {pick(journey.summary, language)}
            </p>

            <div className="mt-16">
              <Eyebrow as="h2">{t("journey.outline")}</Eyebrow>
              <Rule className="mt-4" />
              <ol className="mt-8 space-y-6 border-s border-line ps-6">
                {journey.outline.map((day) => (
                  <li key={day.day} className="relative">
                    <span
                      aria-hidden
                      className="absolute -start-[1.7rem] top-2 h-2 w-2 rounded-full bg-ember-500"
                    />
                    <p className="eyebrow text-gold-600">
                      {t("destination.dayLabel", { day: day.day })}
                    </p>
                    <h3 className="mt-2 font-display text-xl text-charcoal-900">
                      {pick(day.title, language)}
                    </h3>
                    <p className="mt-1 leading-relaxed text-charcoal-600">
                      {pick(day.detail, language)}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="border border-line bg-sand-50 p-6">
              <p className="text-sm text-ink-muted">{t("common.from")}</p>
              <p className="mt-1 font-display text-4xl text-charcoal-900">
                {formatMoney(journey.priceFrom, "USD", language)}
              </p>
              <p className="text-sm text-ink-muted">{t("common.perPerson")}</p>

              <div className="mt-6 border-t border-line pt-4">
                <p className="eyebrow text-ink-muted">{t("journey.included")}</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {journey.destinationSlugs.map((destinationSlug) => {
                    const destination = destinationBySlug.get(destinationSlug);
                    if (!destination) return null;
                    return (
                      <li key={destinationSlug}>
                        <Link
                          to={`/destinations/${destinationSlug}`}
                          className="inline-block border border-line px-3 py-1.5 text-sm text-charcoal-700 transition-colors hover:border-charcoal-800/50 hover:bg-sand-100"
                        >
                          {pick(destination.name, language)}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {tier && (
                <div className="mt-6 border-t border-line pt-4">
                  <p className="eyebrow text-ink-muted">{t("journey.suggestedTier")}</p>
                  <p className="mt-2 text-charcoal-800">{pick(tier.name, language)}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                    {pick(tier.summary, language)}
                  </p>
                </div>
              )}

              <p className="mt-6 text-sm leading-relaxed text-ink-muted">
                {pick(journey.bestSeasonNote, language)}
              </p>

              <ButtonLink to="/trip-builder" className="mt-6 w-full">
                {t("journey.openInBuilder")}
              </ButtonLink>
            </div>
          </aside>
        </Container>
      </Section>
    </>
  );
}
