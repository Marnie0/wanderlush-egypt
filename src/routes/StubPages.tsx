import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/ui/PageHeader";
import { Placeholder } from "@/components/ui/Placeholder";
import { usePageMeta } from "@/hooks/usePageMeta";

/**
 * The one route whose feature is still to come. It exists now so the
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

export const ContactPage = () => <StubPage page="contact" metaKey="meta.contact" />;
