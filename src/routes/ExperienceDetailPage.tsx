import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { m } from "framer-motion";
import { experienceBySlug, experiences } from "@content/experiences";
import { destinationBySlug } from "@content/destinations";
import { Container, Eyebrow, Rule, Section } from "@/components/ui/Layout";
import { SmartImage } from "@/components/ui/SmartImage";
import { Gallery } from "@/components/ui/Gallery";
import { ButtonLink } from "@/components/ui/Button";
import { AddToTripButton } from "@/components/ui/AddToTripButton";
import { SaveButton } from "@/components/ui/SaveButton";
import { Rating } from "@/components/ui/Rating";
import { ExperienceCard } from "@/components/ui/Cards";
import { usePageMeta } from "@/hooks/usePageMeta";
import { pick, pickList, formatMoney, formatDuration } from "@/lib/format";
import { stagger, viewportOnce } from "@/lib/motion";
import type { Experience } from "@content/types";

function DetailList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h2 className="eyebrow text-ink-muted">{title}</h2>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-relaxed text-charcoal-600">
            <span aria-hidden className="mt-2 h-1 w-3 shrink-0 bg-gold-400" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-3">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="text-end text-charcoal-800">{children}</dd>
    </div>
  );
}

/**
 * Related experiences come from the same place first, because someone reading
 * about a Luxor balloon flight is planning a day in Luxor, not a category.
 */
function related(experience: Experience): Experience[] {
  const sameDestination = experiences.filter(
    (candidate) =>
      candidate.slug !== experience.slug &&
      candidate.destinationSlug === experience.destinationSlug,
  );
  const sameCategory = experiences.filter(
    (candidate) =>
      candidate.slug !== experience.slug &&
      candidate.destinationSlug !== experience.destinationSlug &&
      candidate.category === experience.category,
  );
  return [...sameDestination, ...sameCategory].slice(0, 3);
}

export function ExperienceDetailPage() {
  const { slug = "" } = useParams();
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? "en";
  const experience = experienceBySlug.get(slug);

  usePageMeta(
    experience ? pick(experience.name, language) : undefined,
    experience ? pick(experience.summary, language) : undefined,
  );

  if (!experience) {
    return (
      <Section>
        <Container className="max-w-2xl text-center">
          <h1 className="text-display text-charcoal-900">{t("notFound.experience")}</h1>
          <p className="mt-6 text-lead leading-relaxed text-charcoal-600">
            {t("notFound.experienceBody")}
          </p>
          <ButtonLink to="/experiences" className="mt-10">
            {t("notFound.backToExperiences")}
          </ButtonLink>
        </Container>
      </Section>
    );
  }

  const destination = destinationBySlug.get(experience.destinationSlug);
  const suggestions = related(experience);
  const privateTotal = experience.priceFrom + experience.privateSupplement;

  return (
    <>
      <Section className="pt-8">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr]">
            <div>
              <Eyebrow>{t(`categories.${experience.category}`)}</Eyebrow>
              <h1 className="mt-4 text-display text-charcoal-900">
                {pick(experience.name, language)}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                {destination && (
                  <p className="text-charcoal-600">
                    <Link
                      to={`/destinations/${destination.slug}`}
                      className="underline decoration-gold-400 underline-offset-4 transition-colors hover:text-ember-600"
                    >
                      {pick(destination.name, language)}
                    </Link>
                  </p>
                )}
                <Rating value={experience.rating} count={experience.reviewCount} />
              </div>
              <Rule className="mt-6" />

              <SmartImage
                src={experience.heroImage.src}
                alt={pick(experience.heroImage.alt, language)}
                accent={experience.accent}
                priority
                showCredit
                sizes="(min-width: 1024px) 60vw, 100vw"
                className="mt-10 aspect-[16/9] w-full"
              />

              <p className="mt-10 text-lead leading-relaxed text-charcoal-700">
                {pick(experience.description, language)}
              </p>

              <div className="mt-12 grid gap-10 sm:grid-cols-2">
                <DetailList
                  title={t("experience.inclusions")}
                  items={pickList(experience.inclusions, language)}
                />
                <DetailList
                  title={t("experience.exclusions")}
                  items={pickList(experience.exclusions, language)}
                />
                <DetailList
                  title={t("experience.whatToBring")}
                  items={pickList(experience.whatToBring, language)}
                />
                <div>
                  <h2 className="eyebrow text-ink-muted">{t("experience.accessibility")}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-charcoal-600">
                    {pick(experience.accessibility, language)}
                  </p>
                </div>
              </div>
            </div>

            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="border border-line bg-sand-50 p-6">
                <p className="text-sm text-ink-muted">{t("common.from")}</p>
                <p className="mt-1 font-display text-4xl text-charcoal-900">
                  {formatMoney(experience.priceFrom, "USD", language)}
                </p>
                <p className="text-sm text-ink-muted">{t("common.perPerson")}</p>
                {experience.groupFormat.includes("private") &&
                  experience.privateSupplement > 0 && (
                    <p className="mt-2 text-sm text-ink-muted">
                      {t("experience.privateFrom", {
                        amount: formatMoney(privateTotal, "USD", language),
                      })}
                    </p>
                  )}

                <div className="mt-6 flex gap-2">
                  <AddToTripButton
                    kind="experience"
                    slug={experience.slug}
                    className="flex-1"
                  />
                  <SaveButton slug={experience.slug} />
                </div>

                <dl className="mt-6 divide-y divide-line border-y border-line text-sm">
                  <Fact label={t("experience.duration")}>
                    {formatDuration(experience.durationMinutes, t)}
                  </Fact>
                  <Fact label={t("experience.groupSize")}>
                    {t("experience.upToPeople", { count: experience.maxGroupSize })}
                  </Fact>
                  <Fact label={t("experience.schedule")}>
                    {pick(experience.schedule, language)}
                  </Fact>
                  <Fact label={t("experience.meetingPoint")}>
                    {pick(experience.meetingPoint, language)}
                  </Fact>
                  <Fact label={t("experience.setting")}>
                    {t(`environments.${experience.environment}`)}
                  </Fact>
                  <Fact label={t("experience.cancellation")}>
                    {pick(experience.cancellation, language)}
                  </Fact>
                </dl>

                <ul className="mt-6 flex flex-wrap gap-2 text-xs">
                  {experience.groupFormat.map((format) => (
                    <li key={format} className="border border-line px-2.5 py-1 text-charcoal-600">
                      {t(`groupFormat.${format}`)}
                    </li>
                  ))}
                  {experience.familyFriendly && (
                    <li className="border border-line px-2.5 py-1 text-charcoal-600">
                      {t("experience.familyFriendly")}
                    </li>
                  )}
                  {experience.minAge !== null && (
                    <li className="border border-line px-2.5 py-1 text-charcoal-600">
                      {t("experience.minAge", { age: experience.minAge })}
                    </li>
                  )}
                </ul>
              </div>
            </aside>
          </div>
        </Container>
      </Section>

      {experience.gallery.length > 0 && (
        <Section id="gallery" className="pt-0 lg:pt-0">
          <Container>
            <Eyebrow as="h2">{t("gallery.title")}</Eyebrow>
            <Rule className="mt-4" />
            <div className="mt-10">
              <Gallery images={experience.gallery} accent={experience.accent} />
            </div>
          </Container>
        </Section>
      )}

      {suggestions.length > 0 && (
        <section className="bg-sand-50 py-16 lg:py-20">
          <Container>
            <Eyebrow as="h2">{t("experience.related")}</Eyebrow>
            <Rule className="mt-4" />
            <m.div
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              variants={stagger(0.05, 0.06)}
              className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3"
            >
              {suggestions.map((candidate) => (
                <ExperienceCard key={candidate.slug} experience={candidate} showActions />
              ))}
            </m.div>
          </Container>
        </section>
      )}
    </>
  );
}
