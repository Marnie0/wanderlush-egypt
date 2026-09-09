import { useTranslation } from "react-i18next";
import { m } from "framer-motion";
import { destinations } from "@content/destinations";
import { Container, Section } from "@/components/ui/Layout";
import { PageHeader } from "@/components/ui/PageHeader";
import { DestinationCard } from "@/components/ui/Cards";
import { usePageMeta } from "@/hooks/usePageMeta";
import { stagger, viewportOnce } from "@/lib/motion";

/** Phase 3 adds the interactive map, search and filters on top of this grid. */
export function DestinationsPage() {
  const { t } = useTranslation();
  usePageMeta(t("meta.destinations"), t("pages.destinations.intro"));

  return (
    <>
      <PageHeader
        eyebrow={t("pages.destinations.eyebrow")}
        title={t("pages.destinations.title")}
        intro={t("pages.destinations.intro")}
      />
      <Section className="pt-0 lg:pt-0">
        <Container>
          <m.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={stagger(0.05, 0.08)}
            className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3"
          >
            {destinations.map((destination) => (
              <DestinationCard key={destination.slug} destination={destination} />
            ))}
          </m.div>
        </Container>
      </Section>
    </>
  );
}
