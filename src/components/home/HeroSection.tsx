import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { m, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Container } from "@/components/ui/Layout";
import { ButtonLink } from "@/components/ui/Button";
import { SmartImage, FULL_SIZES } from "@/components/ui/SmartImage";
import { DestinationSearch } from "./DestinationSearch";
import { riseIn, stagger, transitions } from "@/lib/motion";

/**
 * Full-bleed photography, a headline, the quick search and the two actions the
 * whole site is built around. The image drifts slightly slower than the page,
 * which reads as depth rather than as an effect.
 */
export function HeroSection() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", reduceMotion ? "0%" : "12%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, reduceMotion ? 1 : 0]);

  return (
    <section ref={sectionRef} className="relative flex min-h-[92svh] items-end">
      {/* The clip lives here, not on the section, so the search results can
          escape the hero instead of being cut off at its edge. */}
      <div className="absolute inset-0 overflow-hidden">
        <m.div style={{ y: imageY }} className="absolute inset-0 h-[112%]">
          <SmartImage
            src="/images/hero/egypt-hero.webp"
            alt=""
            accent="#a94a1b"
            priority
            showCredit
            sizes={FULL_SIZES}
            className="h-full w-full"
          />
        </m.div>
        <div aria-hidden className="absolute inset-0 scrim-full" />
        <div aria-hidden className="absolute inset-0 scrim-inline" />
      </div>

      <Container className="relative pb-20 lg:pb-28">
        <m.div
          style={{ opacity: contentOpacity }}
          initial="hidden"
          animate="visible"
          variants={stagger(0.15, 0.12)}
          className="max-w-3xl"
        >
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

          <m.div variants={riseIn} className="mt-10">
            <DestinationSearch />
          </m.div>

          <m.div
            variants={riseIn}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
          >
            <ButtonLink to="/trip-builder" size="lg">
              {t("home.buildTrip")}
            </ButtonLink>
            <ButtonLink to="/destinations" size="lg" variant="onDark">
              {t("common.exploreEgypt")}
            </ButtonLink>
          </m.div>
        </m.div>
      </Container>
    </section>
  );
}
