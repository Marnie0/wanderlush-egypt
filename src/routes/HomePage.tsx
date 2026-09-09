import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { destinations } from "@content/index";
import { Container, Eyebrow, Rule, Section } from "@/components/ui/Layout";
import { ButtonLink } from "@/components/ui/Button";
import { DestinationCard } from "@/components/ui/Cards";
import { SmartImage } from "@/components/ui/SmartImage";
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
  const featured = destinations.slice(0, 3);

  return (
    <>
      <section className="relative flex min-h-[92svh] items-end overflow-hidden">
        <SmartImage
          src="/images/hero/egypt-hero.jpg"
          alt=""
          accent="#a94a1b"
          priority
          className="absolute inset-0 h-full w-full"
        />
        <div aria-hidden className="absolute inset-0 scrim-full" />

        <Container className="relative pb-20 lg:pb-28">
          <motion.div initial="hidden" animate="visible" variants={stagger(0.15, 0.12)} className="max-w-3xl">
            <motion.p variants={riseIn} className="eyebrow text-gold-300">
              {t("brand.tagline")}
            </motion.p>
            <motion.h1
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0, transition: transitions.cinematic },
              }}
              className="mt-6 text-hero text-ivory"
            >
              {t("home.heroHeadline")}
            </motion.h1>
            <motion.p variants={riseIn} className="mt-6 max-w-xl text-lead text-ivory/85">
              {t("home.heroSupport")}
            </motion.p>
            <motion.div variants={riseIn} className="mt-10 flex flex-wrap gap-3">
              <ButtonLink to="/trip-builder" size="lg">
                {t("home.buildTrip")}
              </ButtonLink>
              <ButtonLink to="/destinations" size="lg" variant="onDark">
                {t("common.exploreEgypt")}
              </ButtonLink>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      <Section>
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={stagger()}
            className="flex flex-wrap items-end justify-between gap-6"
          >
            <div className="max-w-xl">
              <motion.div variants={riseIn}>
                <Eyebrow>{t("pages.destinations.eyebrow")}</Eyebrow>
              </motion.div>
              <motion.h2 variants={riseIn} className="mt-4 text-display text-charcoal-900">
                {t("pages.destinations.title")}
              </motion.h2>
              <motion.div variants={riseIn} className="mt-6">
                <Rule />
              </motion.div>
            </div>
            <motion.div variants={riseIn}>
              <ButtonLink to="/destinations" variant="secondary">
                {t("common.viewAll")}
              </ButtonLink>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={stagger(0.1, 0.12)}
            className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3"
          >
            {featured.map((destination) => (
              <DestinationCard key={destination.slug} destination={destination} featured />
            ))}
          </motion.div>
        </Container>
      </Section>

      <section className="bg-teal-800 py-24 text-ivory lg:py-32">
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={stagger()}
            className="max-w-2xl"
          >
            <motion.h2 variants={riseIn} className="text-display">
              {t("home.finalCta")}
            </motion.h2>
            <motion.div variants={riseIn} className="mt-10">
              <ButtonLink to="/trip-builder" size="lg">
                {t("nav.startPlanning")}
              </ButtonLink>
            </motion.div>
          </motion.div>
        </Container>
      </section>
    </>
  );
}
