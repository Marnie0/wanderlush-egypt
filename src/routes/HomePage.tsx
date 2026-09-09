import { useTranslation } from "react-i18next";
import { m } from "framer-motion";
import { homepageDestinations } from "@content/destinations";
import { Container, Eyebrow, Rule, Section } from "@/components/ui/Layout";
import { ButtonLink } from "@/components/ui/Button";
import { DestinationCard } from "@/components/ui/Cards";
import { SmartImage, FULL_SIZES } from "@/components/ui/SmartImage";
import { usePageMeta } from "@/hooks/usePageMeta";
import { riseIn, stagger, transitions, viewportOnce } from "@/lib/motion";

/**
 * Phase 1 homepage: the hero, the brand promise and a first look at the
 * destinations. Phase 2 replaces this with the full cinematic homepage,
 * including the map preview, journeys, experiences and testimonials.
 */
export function HomePage() {
  const { t } = useTranslation();
  usePageMeta(undefined, t("brand.shortDescription"));

  return (
    <>
      <section className="relative flex min-h-[92svh] items-end overflow-hidden">
        <SmartImage
          src="/images/hero/egypt-hero.webp"
          alt=""
          accent="#a94a1b"
          priority
          showCredit
          sizes={FULL_SIZES}
          className="absolute inset-0 h-full w-full"
        />
        <div aria-hidden className="absolute inset-0 scrim-full" />
        <div aria-hidden className="absolute inset-0 scrim-inline" />

        <Container className="relative pb-20 lg:pb-28">
          <m.div initial="hidden" animate="visible" variants={stagger(0.15, 0.12)} className="max-w-3xl">
            <m.p variants={riseIn} className="eyebrow on-photo text-gold-200">
              {t("brand.tagline")}
            </m.p>
            <m.h1
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0, transition: transitions.cinematic },
              }}
              className="mt-6 text-hero text-ivory on-photo"
            >
              {t("home.heroHeadline")}
            </m.h1>
            <m.p variants={riseIn} className="mt-6 max-w-xl text-lead text-ivory/90 on-photo">
              {t("home.heroSupport")}
            </m.p>
            <m.div
              variants={riseIn}
              className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
            >
              <ButtonLink to="/trip-builder" size="lg" className="sm:w-auto">
                {t("home.buildTrip")}
              </ButtonLink>
              <ButtonLink to="/destinations" size="lg" variant="onDark" className="sm:w-auto">
                {t("common.exploreEgypt")}
              </ButtonLink>
            </m.div>
          </m.div>
        </Container>
      </section>

      <Section>
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
                <Eyebrow>{t("pages.destinations.eyebrow")}</Eyebrow>
              </m.div>
              <m.h2 variants={riseIn} className="mt-4 text-display text-charcoal-900">
                {t("pages.destinations.title")}
              </m.h2>
              <m.div variants={riseIn} className="mt-6">
                <Rule />
              </m.div>
            </div>
            <m.div variants={riseIn}>
              <ButtonLink to="/destinations" variant="secondary">
                {t("common.viewAll")}
              </ButtonLink>
            </m.div>
          </m.div>

          <m.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={stagger(0.1, 0.12)}
            className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3"
          >
            {homepageDestinations.map((destination) => (
              <DestinationCard key={destination.slug} destination={destination} featured />
            ))}
          </m.div>
        </Container>
      </Section>

      <section className="bg-teal-800 py-24 text-ivory lg:py-32">
        <Container>
          <m.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={stagger()}
            className="max-w-2xl"
          >
            <m.h2 variants={riseIn} className="text-display">
              {t("home.finalCta")}
            </m.h2>
            <m.div variants={riseIn} className="mt-10">
              <ButtonLink to="/trip-builder" size="lg">
                {t("nav.startPlanning")}
              </ButtonLink>
            </m.div>
          </m.div>
        </Container>
      </section>
    </>
  );
}
