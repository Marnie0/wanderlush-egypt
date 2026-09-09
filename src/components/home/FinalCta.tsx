import { useTranslation } from "react-i18next";
import { m } from "framer-motion";
import { Container } from "@/components/ui/Layout";
import { ButtonLink } from "@/components/ui/Button";
import { riseIn, stagger, viewportOnce } from "@/lib/motion";

export function FinalCta() {
  const { t } = useTranslation();

  return (
    <section id="plan" className="py-section lg:py-section-lg">
      <Container>
        <m.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger(0.05, 0.1)}
          className="border-t border-line pt-16 lg:pt-20"
        >
          <m.h2 variants={riseIn} className="max-w-3xl text-display text-charcoal-900">
            {t("home.finalCta")}
          </m.h2>
          <m.p variants={riseIn} className="mt-6 max-w-xl text-lead text-charcoal-600">
            {t("home.cta.body")}
          </m.p>
          <m.div variants={riseIn} className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ButtonLink to="/trip-builder" size="lg">
              {t("home.cta.primary")}
            </ButtonLink>
            <ButtonLink to="/destinations" size="lg" variant="secondary">
              {t("home.cta.secondary")}
            </ButtonLink>
          </m.div>
        </m.div>
      </Container>
    </section>
  );
}
