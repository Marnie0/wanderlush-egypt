import { useTranslation } from "react-i18next";
import { m } from "framer-motion";
import { brand } from "@content/brand";
import { Container, Eyebrow, Rule, Section } from "@/components/ui/Layout";
import { Icon, type IconName } from "@/components/ui/Icon";
import { pick } from "@/lib/format";
import { riseIn, stagger, viewportOnce } from "@/lib/motion";

/** The six things the brief asks the homepage to explain. */
export function PromisesSection() {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? "en";

  return (
    <Section id="how-we-work">
      <Container>
        <m.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger()}
          className="max-w-2xl"
        >
          <m.div variants={riseIn}>
            <Eyebrow>{t("home.promises.eyebrow")}</Eyebrow>
          </m.div>
          <m.h2 variants={riseIn} className="mt-4 text-display text-charcoal-900">
            {t("home.promises.title")}
          </m.h2>
          <m.div variants={riseIn} className="mt-6">
            <Rule />
          </m.div>
          <m.p variants={riseIn} className="mt-6 text-lead text-charcoal-600">
            {t("home.promises.lead")}
          </m.p>
        </m.div>

        <m.ul
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger(0.05, 0.07)}
          className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3"
        >
          {brand.promises.map((promise) => (
            <m.li key={promise.icon} variants={riseIn}>
              <Icon name={promise.icon as IconName} size={28} className="text-ember-500" />
              <h3 className="mt-4 font-display text-xl text-charcoal-900">
                {pick(promise.title, language)}
              </h3>
              <p className="mt-2 leading-relaxed text-charcoal-600">
                {pick(promise.body, language)}
              </p>
            </m.li>
          ))}
        </m.ul>
      </Container>
    </Section>
  );
}
