import { useTranslation } from "react-i18next";
import { m } from "framer-motion";
import { reviews } from "@content/reviews";
import { journeyBySlug } from "@content/journeys";
import { Container, Eyebrow } from "@/components/ui/Layout";
import { Icon } from "@/components/ui/Icon";
import { formatMonthYear, pick } from "@/lib/format";
import { riseIn, stagger, viewportOnce } from "@/lib/motion";

/**
 * Three of the ten demo testimonials. The label is not fine print: the brief
 * asks for testimonials that are clearly identified as demonstration content,
 * so it sits at the top of the section rather than hidden underneath.
 */
export function Testimonials() {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? "en";
  const featured = reviews.slice(0, 3);

  return (
    <section id="travellers" className="bg-teal-800 py-section text-ivory lg:py-section-lg">
      <Container>
        <m.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger()}
          className="max-w-2xl"
        >
          <m.div variants={riseIn}>
            <Eyebrow className="text-gold-300">{t("home.testimonials.eyebrow")}</Eyebrow>
          </m.div>
          <m.h2 variants={riseIn} className="mt-4 text-display">
            {t("home.testimonials.title")}
          </m.h2>
          <m.p variants={riseIn} className="mt-5 text-sm leading-relaxed text-ivory/60">
            {t("home.testimonials.note")}
          </m.p>
        </m.div>

        <m.ul
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger(0.05, 0.1)}
          className="mt-14 grid gap-10 md:grid-cols-3"
        >
          {featured.map((review) => {
            const journey = review.journeySlug ? journeyBySlug.get(review.journeySlug) : undefined;
            return (
              <m.li
                key={review.id}
                variants={riseIn}
                className="border-t border-ivory/20 pt-6"
              >
                <Icon name="quote" className="text-gold-400" size={28} />
                <figure>
                  <blockquote className="mt-4 leading-relaxed text-ivory/90">
                    {pick(review.quote, language)}
                  </blockquote>
                  <figcaption className="mt-6 text-sm">
                  <span className="block text-ivory">{pick(review.author, language)}</span>
                  <span className="block text-ivory/55">{pick(review.origin, language)}</span>
                  <span className="mt-1 block text-ivory/45">
                    {journey ? `${pick(journey.name, language)} · ` : ""}
                    {formatMonthYear(review.travelledOn, language)}
                  </span>
                  </figcaption>
                </figure>
              </m.li>
            );
          })}
        </m.ul>
      </Container>
    </section>
  );
}
