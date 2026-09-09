import { useRouteError, isRouteErrorResponse } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Container, Section } from "@/components/ui/Layout";
import { ButtonLink } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

/**
 * Rendered when a route throws. It keeps the shell so the user is never
 * dropped onto a bare error string with no way back.
 */
export function RouteError() {
  const error = useRouteError();
  const { t } = useTranslation();
  const is404 = isRouteErrorResponse(error) && error.status === 404;

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <Header />
      <main className="flex-1 pt-20">
        <PageHeader
          title={is404 ? t("pages.notFound.title") : t("common.error")}
          intro={is404 ? t("pages.notFound.intro") : undefined}
        />
        <Section className="pt-0">
          <Container>
            <ButtonLink to="/">{t("common.backHome")}</ButtonLink>
          </Container>
        </Section>
      </main>
      <Footer />
    </div>
  );
}
