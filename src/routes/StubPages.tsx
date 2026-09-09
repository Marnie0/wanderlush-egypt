import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/ui/PageHeader";
import { Placeholder } from "@/components/ui/Placeholder";
import { usePageMeta } from "@/hooks/usePageMeta";

/**
 * Routes whose feature is delivered in Phases 6 and 7. They exist now so the
 * navigation, layouts and deep links are all real from the first deployment.
 */
function StubPage({ page, metaKey }: { page: string; metaKey: string }) {
  const { t } = useTranslation();
  usePageMeta(t(metaKey), t(`pages.${page}.intro`));
  return (
    <>
      <PageHeader
        eyebrow={t(`pages.${page}.eyebrow`)}
        title={t(`pages.${page}.title`)}
        intro={t(`pages.${page}.intro`)}
      />
      <Placeholder />
    </>
  );
}

export const TripSummaryPage = () => <StubPage page="tripSummary" metaKey="meta.tripSummary" />;
export const BookingPage = () => <StubPage page="booking" metaKey="meta.booking" />;
export const BookingConfirmationPage = () => (
  <StubPage page="confirmation" metaKey="meta.confirmation" />
);
export const ContactPage = () => <StubPage page="contact" metaKey="meta.contact" />;
