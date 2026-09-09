import { useTranslation } from "react-i18next";
import { faqCategories, faqs } from "@content/faqs";
import { Container, Eyebrow, Rule, Section } from "@/components/ui/Layout";
import { PageHeader } from "@/components/ui/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { usePageMeta } from "@/hooks/usePageMeta";
import { pick } from "@/lib/format";

export function FaqPage() {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? "en";
  usePageMeta(t("meta.faq"), t("pages.faq.intro"));

  return (
    <>
      <PageHeader
        eyebrow={t("pages.faq.eyebrow")}
        title={t("pages.faq.title")}
        intro={t("pages.faq.intro")}
      />
      <Section className="pt-0 lg:pt-0">
        <Container className="max-w-3xl">
          {faqCategories.map((category) => (
            <section key={category.id} className="mb-16 last:mb-0">
              <Eyebrow>{pick(category.name, language)}</Eyebrow>
              <Rule className="mt-4" />
              <dl className="mt-8 divide-y divide-line border-y border-line">
                {faqs
                  .filter((faq) => faq.categoryId === category.id)
                  .map((faq) => (
                    <div key={faq.id} className="py-6">
                      <dt className="font-display text-xl text-charcoal-900">
                        {pick(faq.question, language)}
                      </dt>
                      <dd className="mt-3 leading-relaxed text-charcoal-600">
                        {pick(faq.answer, language)}
                      </dd>
                    </div>
                  ))}
              </dl>
            </section>
          ))}

          <div className="mt-16 border border-line bg-sand-50 p-8">
            <p className="font-display text-2xl text-charcoal-900">{t("faqPage.stillStuck")}</p>
            <ButtonLink to="/contact" className="mt-6">
              {t("faqPage.contactUs")}
            </ButtonLink>
          </div>
        </Container>
      </Section>
    </>
  );
}
