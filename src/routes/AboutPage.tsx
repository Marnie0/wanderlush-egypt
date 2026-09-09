import { useTranslation } from "react-i18next";
import { brand } from "@content/brand";
import { accommodationLevels } from "@content/accommodation";
import { Container, Eyebrow, Rule, Section } from "@/components/ui/Layout";
import { PageHeader } from "@/components/ui/PageHeader";
import { usePageMeta } from "@/hooks/usePageMeta";
import { pick } from "@/lib/format";

export function AboutPage() {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? "en";
  usePageMeta(t("meta.about"), pick(brand.purpose, language));

  return (
    <>
      <PageHeader
        eyebrow={t("pages.about.eyebrow")}
        title={t("pages.about.title")}
        intro={pick(brand.valueProposition, language)}
      />

      <Section className="pt-0 lg:pt-0">
        <Container className="grid gap-14 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-6">
            {brand.story.map((paragraph) => (
              <p key={paragraph.en} className="text-lead leading-relaxed text-charcoal-700">
                {pick(paragraph, language)}
              </p>
            ))}
          </div>
          <aside className="border-s-2 border-gold-400 ps-6">
            <p className="font-display text-2xl leading-snug text-charcoal-900">
              {pick(brand.tagline, language)}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-charcoal-600">
              {pick(brand.personality, language)}
            </p>
          </aside>
        </Container>
      </Section>

      <Section className="bg-sand-50 pt-0 pb-section lg:pt-0">
        <Container className="pt-section">
          <Eyebrow>{t("footer.company")}</Eyebrow>
          <Rule className="mt-4" />
          <div className="mt-12 grid gap-10 sm:grid-cols-2">
            {brand.values.map((value) => (
              <div key={value.title.en}>
                <h2 className="font-display text-2xl text-charcoal-900">
                  {pick(value.title, language)}
                </h2>
                <p className="mt-3 leading-relaxed text-charcoal-600">{pick(value.body, language)}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="pt-0 pb-section">
        <Container className="pt-section">
          <Eyebrow>{t("journey.suggestedTier")}</Eyebrow>
          <Rule className="mt-4" />
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {accommodationLevels.map((level) => (
              <div key={level.id} className="border-t-2 pt-5" style={{ borderColor: level.accent }}>
                <h2 className="font-display text-2xl text-charcoal-900">
                  {pick(level.name, language)}
                </h2>
                <p className="mt-1 text-sm text-ink-muted">{pick(level.summary, language)}</p>
                <p className="mt-4 text-sm leading-relaxed text-charcoal-600">
                  {pick(level.description, language)}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
