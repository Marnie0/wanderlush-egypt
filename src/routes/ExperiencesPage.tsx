import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { experiences } from "@content/index";
import { Container, Section } from "@/components/ui/Layout";
import { PageHeader } from "@/components/ui/PageHeader";
import { ExperienceCard } from "@/components/ui/Cards";
import { usePageMeta } from "@/hooks/usePageMeta";
import { stagger, viewportOnce } from "@/lib/motion";

/** Phase 4 adds filters, sorting, a filter drawer and the shortlist. */
export function ExperiencesPage() {
  const { t } = useTranslation();
  usePageMeta(t("meta.experiences"), t("pages.experiences.intro"));

  return (
    <>
      <PageHeader
        eyebrow={t("pages.experiences.eyebrow")}
        title={t("pages.experiences.title")}
        intro={t("pages.experiences.intro")}
      />
      <Section className="pt-0">
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={stagger(0.05, 0.06)}
            className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3"
          >
            {experiences.map((experience) => (
              <ExperienceCard key={experience.slug} experience={experience} />
            ))}
          </motion.div>
        </Container>
      </Section>
    </>
  );
}
