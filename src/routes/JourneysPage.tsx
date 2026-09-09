import { useTranslation } from "react-i18next";
import { m } from "framer-motion";
import { journeys } from "@content/journeys";
import { Container, Section } from "@/components/ui/Layout";
import { PageHeader } from "@/components/ui/PageHeader";
import { JourneyCard } from "@/components/ui/Cards";
import { usePageMeta } from "@/hooks/usePageMeta";
import { stagger, viewportOnce } from "@/lib/motion";

export function JourneysPage() {
  const { t } = useTranslation();
  usePageMeta(t("meta.journeys"), t("pages.journeys.intro"));

  return (
    <>
      <PageHeader
        eyebrow={t("pages.journeys.eyebrow")}
        title={t("pages.journeys.title")}
        intro={t("pages.journeys.intro")}
      />
      <Section className="pt-0 lg:pt-0">
        <Container>
          <h2 className="sr-only">{t("pages.journeys.listHeading")}</h2>
          <m.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={stagger(0.05, 0.1)}
            className="grid gap-12 sm:grid-cols-2"
          >
            {journeys.map((journey) => (
              <JourneyCard key={journey.slug} journey={journey} />
            ))}
          </m.div>
        </Container>
      </Section>
    </>
  );
}
