import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { m, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Container } from "@/components/ui/Layout";
import { ButtonLink } from "@/components/ui/Button";
import { SmartImage, FULL_SIZES } from "@/components/ui/SmartImage";
import { imageManifest } from "@/generated/images";
import { DestinationSearch } from "./DestinationSearch";
import { ease, riseIn, stagger, transitions } from "@/lib/motion";

const HERO_SRC = "/images/hero/egypt-hero.webp";

/**
 * Full-bleed photography, a headline, the quick search and the two actions the
 * whole site is built around. The image settles from a slight zoom on the
 * first paint and then drifts slower than the page, which reads as depth
 * rather than as an effect.
 */
export function HeroSection() {
  const { t } = useTranslation();
  const credit = imageManifest[HERO_SRC]?.credit;
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
        <m.div
          style={{ y: imageY }}
          initial={{ scale: 1.06 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.8, ease: ease.entrance }}
          className="absolute inset-0 h-[112%]"
        >
          <SmartImage
            src={HERO_SRC}
            alt={t("home.heroAlt")}
            accent="#a94a1b"
            priority
            sizes={FULL_SIZES}
            className="h-full w-full"
          />
        </m.div>
        <div aria-hidden className="absolute inset-0 scrim-full" />
        <div aria-hidden className="absolute inset-0 scrim-inline" />
        {/* The credit sits on the section, not on the picture: the picture is
            taller than its clip for the parallax, so a credit pinned to its
            bottom edge would be cut off and leave an invisible tab stop. */}
        {credit && (
          <a
            href={credit.source}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="absolute bottom-2 end-3 z-10 text-[0.625rem] text-ivory/45 transition-colors hover:text-ivory/80"
          >
            {credit.artist} · {credit.license}
          </a>
        )}
      </div>

      {/* Top padding clears the floating header. On a tall screen the content
          sits at the bottom and the padding is slack; on a short one (an
          iPhone SE, a phone held sideways) the content is taller than the
          hero and would otherwise start under the logo. */}
      <Container className="relative pt-28 pb-20 lg:pb-28">
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
