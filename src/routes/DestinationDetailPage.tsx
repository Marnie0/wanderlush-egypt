import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { m } from "framer-motion";
import { destinationBySlug } from "@content/destinations";
import { experiencesByDestination } from "@content/experiences";
import { Container, Eyebrow, Rule, Section } from "@/components/ui/Layout";
import { SmartImage, FULL_SIZES } from "@/components/ui/SmartImage";
import { ExperienceCard } from "@/components/ui/Cards";
import { Gallery } from "@/components/ui/Gallery";
import { AddToTripButton } from "@/components/ui/AddToTripButton";
import { ButtonLink } from "@/components/ui/Button";
import { usePageMeta } from "@/hooks/usePageMeta";
import { destinationData, socialImageFor } from "@/lib/seo";
import { useSolidHeader } from "@/lib/header-store";
import { formatMonthRuns } from "@/lib/format";
import { pick, pickList, formatMoney, formatDayRange } from "@/lib/format";
import { riseIn, stagger, transitions, viewportOnce } from "@/lib/motion";

/**
 * Phase 1 renders the written guide. Phase 3 adds the gallery, the map, the
 * add-to-trip action and related destinations.
 */
export function DestinationDetailPage() {
  const { slug = "" } = useParams();
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? "en";
  const destination = destinationBySlug.get(slug);
  useSolidHeader(!destination);

  usePageMeta(
    destination ? pick(destination.name, language) : undefined,
    destination ? pick(destination.tagline, language) : undefined,
    destination ? { image: socialImageFor(destination.heroImage.src), structuredData: destinationData(destination, language) } : {},
  );

  if (!destination) {
    return (
      <Section>
        <Container className="max-w-2xl text-center">
          <h1 className="text-display text-charcoal-900">{t("notFound.destination")}</h1>
          <p className="mt-6 text-lead leading-relaxed text-charcoal-600">
            {t("notFound.destinationBody")}
          </p>
          <ButtonLink to="/destinations" className="mt-10">
            {t("notFound.backToDestinations")}
          </ButtonLink>
        </Container>
      </Section>
    );
  }

  const localExperiences = experiencesByDestination[destination.slug] ?? [];
  const seasons = formatMonthRuns(destination.bestSeason, t);

  return (
    <>
      <section className="relative flex min-h-[70svh] items-end overflow-hidden">
        <SmartImage
          src={destination.heroImage.src}
          alt={pick(destination.heroImage.alt, language)}
          accent={destination.accent}
          priority
          showCredit
          sizes={FULL_SIZES}
          className="absolute inset-0 h-full w-full"
        />
        <div aria-hidden className="absolute inset-0 scrim-full" />
        <div aria-hidden className="absolute inset-0 scrim-inline" />
        <Container className="relative pb-16 lg:pb-20">
          <m.div initial="hidden" animate="visible" variants={stagger(0.1, 0.1)}>
            <m.p variants={riseIn} className="eyebrow on-photo text-gold-200">
              {t(`regions.${destination.region}`)}
            </m.p>
            <m.h1
              variants={{
                hidden: { opacity: 0, y: 32 },
                visible: { opacity: 1, y: 0, transition: transitions.cinematic },
              }}
              className="mt-4 text-hero text-ivory on-photo"
            >
              {pick(destination.name, language)}
            </m.h1>
            <m.p variants={riseIn} className="mt-4 max-w-2xl text-lead text-ivory/90 on-photo">
              {pick(destination.tagline, language)}
            </m.p>
            <m.div variants={riseIn} className="mt-8">
              <AddToTripButton kind="destination" slug={destination.slug} size="lg" />
            </m.div>
          </m.div>
        </Container>
      </section>

      <Section>
        <Container className="grid gap-14 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <p className="text-lead leading-relaxed text-charcoal-700">
              {pick(destination.intro, language)}
            </p>

            <div className="mt-16">
              <Eyebrow as="h2">{t("destination.highlights")}</Eyebrow>
              <Rule className="mt-4" />
              <ul className="mt-8 space-y-8">
                {destination.attractions.map((attraction) => (
                  <li key={attraction.name.en}>
                    <h3 className="font-display text-2xl text-charcoal-900">
                      {pick(attraction.name, language)}
                    </h3>
                    <p className="mt-2 leading-relaxed text-charcoal-600">
                      {pick(attraction.blurb, language)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-16">
              <Eyebrow as="h2">{t("destination.suggestedItinerary")}</Eyebrow>
              <Rule className="mt-4" />
              <ol className="mt-8 space-y-6 border-s border-line ps-6">
                {destination.suggestedItinerary.map((day) => (
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

            <div className="mt-16">
              <Eyebrow as="h2">{t("destination.localAdvice")}</Eyebrow>
              <Rule className="mt-4" />
              <ul className="mt-8 space-y-4">
                {pickList(destination.localAdvice, language).map((tip) => (
                  <li key={tip} className="flex gap-4 leading-relaxed text-charcoal-600">
                    <span aria-hidden className="mt-2.5 h-1 w-4 shrink-0 bg-gold-400" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <dl className="divide-y divide-line border-y border-line">
              <div className="py-4">
                <dt className="eyebrow text-ink-muted">{t("destination.recommendedStay")}</dt>
                <dd className="mt-2 text-charcoal-900">
                  {formatDayRange(
                    destination.recommendedDays.min,
                    destination.recommendedDays.max,
                    t,
                    language,
                  )}
                </dd>
              </div>
              <div className="py-4">
                <dt className="eyebrow text-ink-muted">{t("destination.bestSeason")}</dt>
                <dd className="mt-2 text-charcoal-900">{seasons}</dd>
                <dd className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {pick(destination.bestSeasonNote, language)}
                </dd>
              </div>
              <div className="py-4">
                <dt className="eyebrow text-ink-muted">{t("destination.dailyBudget")}</dt>
                <dd className="mt-2 text-charcoal-900">
                  {formatMoney(destination.dailyBudgetFrom, "USD", language)}{" "}
                  <span className="text-ink-muted">{t("common.perPerson")}</span>
                </dd>
              </div>
              <div className="py-4">
                <dt className="eyebrow text-ink-muted">{t("destination.gettingThere")}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-charcoal-600">
                  {pick(destination.gettingThere, language)}
                </dd>
              </div>
              <div className="py-4">
                <dt className="eyebrow text-ink-muted">{t("destination.whereToStay")}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-charcoal-600">
                  {pick(destination.accommodationNote, language)}
                </dd>
              </div>
            </dl>

            <div className="mt-8">
              <p className="eyebrow text-ink-muted">{t("destination.relatedDestinations")}</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {destination.relatedSlugs.map((related) => {
                  const target = destinationBySlug.get(related);
                  if (!target) return null;
                  return (
                    <li key={related}>
                      <Link
                        to={`/destinations/${related}`}
                        className="inline-block border border-line px-3 py-1.5 text-sm text-charcoal-700 transition-colors hover:border-charcoal-800/50 hover:bg-sand-100"
                      >
                        {pick(target.name, language)}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="mt-8 border-t border-line pt-6">
              <AddToTripButton
                kind="destination"
                slug={destination.slug}
                className="w-full"
              />
            </div>
          </aside>
        </Container>
      </Section>

      {destination.gallery.length > 0 && (
        <Section id="gallery" className="pt-0 lg:pt-0">
          <Container>
            <Eyebrow as="h2">{t("gallery.title")}</Eyebrow>
            <Rule className="mt-4" />
            <div className="mt-10">
              <Gallery images={destination.gallery} accent={destination.accent} />
            </div>
          </Container>
        </Section>
      )}

      {localExperiences.length > 0 && (
        <Section id="experiences" className="bg-sand-50 pt-0 pb-section lg:pt-0">
          <Container className="pt-section">
            <Eyebrow as="h2">{t("destination.experiencesHere")}</Eyebrow>
            <Rule className="mt-4" />
            <m.div
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              variants={stagger(0.05, 0.08)}
              className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3"
            >
              {localExperiences.map((experience) => (
                <ExperienceCard key={experience.slug} experience={experience} showActions />
              ))}
            </m.div>
          </Container>
        </Section>
      )}
    </>
  );
}
