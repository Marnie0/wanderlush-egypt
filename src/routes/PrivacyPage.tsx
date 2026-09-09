import { useTranslation } from "react-i18next";
import { brand } from "@content/index";
import { Container, Section } from "@/components/ui/Layout";
import { PageHeader } from "@/components/ui/PageHeader";
import { usePageMeta } from "@/hooks/usePageMeta";
import { pick } from "@/lib/format";

export function PrivacyPage() {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? "en";
  usePageMeta(t("meta.privacy"));

  return (
    <>
      <PageHeader eyebrow={t("pages.privacy.eyebrow")} title={t("pages.privacy.title")} />
      <Section className="pt-0">
        <Container className="max-w-3xl space-y-6">
          {brand.privacy.map((paragraph) => (
            <p key={paragraph.en} className="leading-relaxed text-charcoal-700">
              {pick(paragraph, language)}
            </p>
          ))}
        </Container>
      </Section>
    </>
  );
}
