import { Navigate, Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { experienceBySlug, destinationBySlug } from "@content/index";
import { Container, Eyebrow, Rule, Section } from "@/components/ui/Layout";
import { SmartImage } from "@/components/ui/SmartImage";
import { usePageMeta } from "@/hooks/usePageMeta";
import { pick, pickList, formatMoney } from "@/lib/format";

function DetailList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h3 className="eyebrow text-ink-muted">{title}</h3>
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

/** Phase 4 adds the gallery, the shortlist and the add-to-trip action. */
export function ExperienceDetailPage() {
  const { slug = "" } = useParams();
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? "en";
  const experience = experienceBySlug.get(slug);

  usePageMeta(
    experience ? pick(experience.name, language) : undefined,
    experience ? pick(experience.summary, language) : undefined,
  );

  if (!experience) return <Navigate to="/experiences" replace />;

  const destination = destinationBySlug.get(experience.destinationSlug);
  const hours = Math.round(experience.durationMinutes / 60);

  return (
    <Section className="pt-8">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <Eyebrow>{t(`categories.${experience.category}`)}</Eyebrow>
            <h1 className="mt-4 text-display text-charcoal-900">
              {pick(experience.name, language)}
            </h1>
            {destination && (
              <p className="mt-3 text-charcoal-600">
                <Link
                  to={`/destinations/${destination.slug}`}
                  className="underline decoration-gold-400 underline-offset-4 transition-colors hover:text-ember-600"
                >
                  {pick(destination.name, language)}
                </Link>
              </p>
            )}
            <Rule className="mt-6" />

            <SmartImage
              src={experience.heroImage.src}
              alt={pick(experience.heroImage.alt, language)}
              accent={experience.accent}
              priority
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
                <h3 className="eyebrow text-ink-muted">{t("experience.accessibility")}</h3>
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

              <dl className="mt-6 divide-y divide-line border-y border-line text-sm">
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-ink-muted">{t("experience.duration")}</dt>
                  <dd className="text-charcoal-800">
                    {hours >= 24
                      ? t("common.days", { count: Math.round(hours / 24) })
                      : t("common.hours", { count: hours })}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-ink-muted">{t("experience.groupSize")}</dt>
                  <dd className="text-charcoal-800">
                    {t("experience.upToPeople", { count: experience.maxGroupSize })}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-ink-muted">{t("experience.schedule")}</dt>
                  <dd className="text-end text-charcoal-800">
                    {pick(experience.schedule, language)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-ink-muted">{t("experience.meetingPoint")}</dt>
                  <dd className="text-end text-charcoal-800">
                    {pick(experience.meetingPoint, language)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-ink-muted">{t("experience.cancellation")}</dt>
                  <dd className="text-end text-charcoal-800">
                    {pick(experience.cancellation, language)}
                  </dd>
                </div>
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
  );
}
