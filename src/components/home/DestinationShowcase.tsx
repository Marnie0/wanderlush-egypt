import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { m } from "framer-motion";
import { homepageDestinations } from "@content/destinations";
import { Container, Eyebrow, Rule, Section } from "@/components/ui/Layout";
import { ButtonLink } from "@/components/ui/Button";
import { SmartImage, HALF_SIZES } from "@/components/ui/SmartImage";
import { DestinationCard } from "@/components/ui/Cards";
import { Icon } from "@/components/ui/Icon";
import { formatDayRange, formatMoney, pick } from "@/lib/format";
import { riseIn, stagger, viewportOnce } from "@/lib/motion";
import { cn } from "@/lib/cn";
import type { Destination } from "@content/types";

/** The two leads get a full editorial spread; the rest run as cards. */
function EditorialFeature({
  destination,
  reversed,
}: {
  destination: Destination;
  reversed: boolean;
}) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? "en";

  return (
    <m.article
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={stagger(0.05, 0.1)}
      className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16"
    >
      <m.div variants={riseIn} className={cn(reversed && "lg:order-2")}>
        <Link to={`/destinations/${destination.slug}`} className="group block">
          <SmartImage
            src={destination.heroImage.src}
            alt={pick(destination.heroImage.alt, language)}
            accent={destination.accent}
            sizes={HALF_SIZES}
            className="aspect-[4/3] w-full lg:aspect-[5/6]"
            imgClassName="transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
          />
        </Link>
      </m.div>

      <div className={cn(reversed && "lg:order-1")}>
        <m.div variants={riseIn}>
          <Eyebrow>{t(`regions.${destination.region}`)}</Eyebrow>
        </m.div>
        <m.h3 variants={riseIn} className="mt-4 text-display text-charcoal-900">
          <Link
            to={`/destinations/${destination.slug}`}
            className="transition-colors hover:text-ember-600"
          >
            {pick(destination.name, language)}
          </Link>
        </m.h3>
        <m.div variants={riseIn} className="mt-5">
          <Rule />
        </m.div>
        <m.p variants={riseIn} className="mt-6 text-lead leading-relaxed text-charcoal-600">
          {pick(destination.tagline, language)}
        </m.p>

        <m.dl variants={riseIn} className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
          <div>
            <dt className="eyebrow text-ink-muted">{t("destination.recommendedStay")}</dt>
            <dd className="mt-1.5 text-charcoal-900">
              {formatDayRange(
                destination.recommendedDays.min,
                destination.recommendedDays.max,
                t,
                language,
              )}
            </dd>
          </div>
          <div>
            <dt className="eyebrow text-ink-muted">{t("destination.dailyBudget")}</dt>
            <dd className="mt-1.5 text-charcoal-900">
              {formatMoney(destination.dailyBudgetFrom, "USD", language)}{" "}
              <span className="text-ink-muted">{t("common.perPerson")}</span>
            </dd>
          </div>
        </m.dl>

        <m.ul variants={riseIn} className="mt-6 flex flex-wrap gap-2">
          {destination.travelStyles.map((style) => (
            <li
              key={style}
              className="border border-line px-3 py-1.5 text-sm text-charcoal-600"
            >
              {t(`travelStyles.${style}`)}
            </li>
          ))}
        </m.ul>

        <m.div variants={riseIn} className="mt-8">
          <Link
            to={`/destinations/${destination.slug}`}
            className="group inline-flex items-center gap-2 text-sm font-medium text-ember-600 transition-colors hover:text-ember-700"
          >
            {t("home.map.openGuide")}
            <Icon
              name="arrow"
              size={18}
              className="transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
            />
          </Link>
        </m.div>
      </div>
    </m.article>
  );
}

export function DestinationShowcase() {
  const { t } = useTranslation();
  const [first, second, ...rest] = homepageDestinations;

  return (
    <Section id="destinations">
      <Container>
        <m.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger()}
          className="flex flex-wrap items-end justify-between gap-6"
        >
          <div className="max-w-xl">
            <m.div variants={riseIn}>
              <Eyebrow>{t("home.destinations.eyebrow")}</Eyebrow>
            </m.div>
            <m.h2 variants={riseIn} className="mt-4 text-display text-charcoal-900">
              {t("home.destinations.title")}
            </m.h2>
            <m.p variants={riseIn} className="mt-6 text-lead text-charcoal-600">
              {t("home.destinations.lead")}
            </m.p>
          </div>
          <m.div variants={riseIn}>
            <ButtonLink to="/destinations" variant="secondary">
              {t("common.viewAll")}
            </ButtonLink>
          </m.div>
        </m.div>

        <div className="mt-16 space-y-20 lg:mt-24 lg:space-y-28">
          <EditorialFeature destination={first} reversed={false} />
          <EditorialFeature destination={second} reversed />
        </div>

        <m.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger(0.05, 0.1)}
          className="mt-20 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:mt-28 lg:grid-cols-4"
        >
          {rest.map((destination) => (
            <DestinationCard
              key={destination.slug}
              destination={destination}
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            />
          ))}
        </m.div>
      </Container>
    </Section>
  );
}
