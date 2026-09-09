import { useTranslation } from "react-i18next";
import { m } from "framer-motion";
import { homepageExperiences } from "@content/experiences";
import { Container, Eyebrow, Rule } from "@/components/ui/Layout";
import { ButtonLink } from "@/components/ui/Button";
import { ExperienceCard } from "@/components/ui/Cards";
import { riseIn, stagger, viewportOnce } from "@/lib/motion";

/**
 * The six the brief names: a balloon, a river cruise, a pyramid tour, desert
 * camping, diving and a Nubian village.
 */
export function ExperiencesPreview() {
  const { t } = useTranslation();

  return (
    <section id="experiences" className="bg-sand-50 py-section lg:py-section-lg">
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
              <Eyebrow>{t("home.experiences.eyebrow")}</Eyebrow>
            </m.div>
            <m.h2 variants={riseIn} className="mt-4 text-display text-charcoal-900">
              {t("home.experiences.title")}
            </m.h2>
            <m.div variants={riseIn} className="mt-6">
              <Rule />
            </m.div>
            <m.p variants={riseIn} className="mt-6 text-lead text-charcoal-600">
              {t("home.experiences.lead")}
            </m.p>
          </div>
          <m.div variants={riseIn}>
            <ButtonLink to="/experiences" variant="secondary">
              {t("common.viewAll")}
            </ButtonLink>
          </m.div>
        </m.div>

        <m.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger(0.05, 0.08)}
          className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3"
        >
          {homepageExperiences.map((experience) => (
            <ExperienceCard key={experience.slug} experience={experience} />
          ))}
        </m.div>
      </Container>
    </section>
  );
}
