import { useTranslation } from "react-i18next";
import { CARD_SIZES } from "@/components/ui/SmartImage";
import { m } from "framer-motion";
import { journeys } from "@content/journeys";
import { Container, Eyebrow, Rule, Section } from "@/components/ui/Layout";
import { ButtonLink } from "@/components/ui/Button";
import { JourneyCard } from "@/components/ui/Cards";
import { riseIn, stagger, viewportOnce } from "@/lib/motion";

export function JourneysPreview() {
  const { t } = useTranslation();

  return (
    <Section id="journeys">
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
              <Eyebrow>{t("home.journeys.eyebrow")}</Eyebrow>
            </m.div>
            <m.h2 variants={riseIn} className="mt-4 text-display text-charcoal-900">
              {t("home.journeys.title")}
            </m.h2>
            <m.div variants={riseIn} className="mt-6">
              <Rule />
            </m.div>
            <m.p variants={riseIn} className="mt-6 text-lead text-charcoal-600">
              {t("home.journeys.lead")}
            </m.p>
          </div>
          <m.div variants={riseIn}>
            <ButtonLink to="/journeys" variant="secondary">
              {t("common.viewAll")}
            </ButtonLink>
          </m.div>
        </m.div>

        <m.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger(0.05, 0.09)}
          className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3"
        >
          {journeys.map((journey) => (
            <JourneyCard key={journey.slug} journey={journey} sizes={CARD_SIZES} />
          ))}
        </m.div>
      </Container>
    </Section>
  );
}
