import { useTranslation } from "react-i18next";
import { Container, Section } from "@/components/ui/Layout";
import { ButtonLink } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { usePageMeta } from "@/hooks/usePageMeta";

export function NotFoundPage() {
  const { t } = useTranslation();
  usePageMeta(t("common.notFound"));

  return (
    <>
      <PageHeader title={t("pages.notFound.title")} intro={t("pages.notFound.intro")} />
      <Section className="pt-0 lg:pt-0">
        <Container>
          <ButtonLink to="/">{t("common.backHome")}</ButtonLink>
        </Container>
      </Section>
    </>
  );
}
