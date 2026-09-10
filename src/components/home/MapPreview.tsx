import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AnimatePresence, m } from "framer-motion";
import { destinations, destinationBySlug } from "@content/destinations";
import { Container, Eyebrow, Rule } from "@/components/ui/Layout";
import { SmartImage, HALF_SIZES } from "@/components/ui/SmartImage";
import { EgyptMap } from "@/components/ui/EgyptMap";
import { Icon } from "@/components/ui/Icon";
import { formatDayRange, formatMoney, pick } from "@/lib/format";
import { duration, ease, riseIn, stagger, viewportOnce } from "@/lib/motion";
import { cn } from "@/lib/cn";

/**
 * Selecting a place on the map swaps the photograph and the details beside it.
 * The chip row underneath is not a fallback: it is the primary control on a
 * phone, and it keeps the whole section usable from the keyboard.
 */
export function MapPreview() {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? "en";
  const [activeSlug, setActiveSlug] = useState("giza");
  const active = destinationBySlug.get(activeSlug) ?? destinations[0];

  return (
    <section id="map" className="bg-sand-50 py-section lg:py-section-lg">
      <Container>
        <m.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger()}
          className="max-w-2xl"
        >
          <m.div variants={riseIn}>
            <Eyebrow>{t("home.map.eyebrow")}</Eyebrow>
          </m.div>
          <m.h2 variants={riseIn} className="mt-4 text-display text-charcoal-900">
            {t("home.map.title")}
          </m.h2>
          <m.div variants={riseIn} className="mt-6">
            <Rule />
          </m.div>
          <m.p variants={riseIn} className="mt-6 text-lead text-charcoal-600">
            {t("home.map.lead")}
          </m.p>
        </m.div>

        <div className="mt-14 grid items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <m.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={riseIn}
          >
            <EgyptMap
              destinations={destinations}
              activeSlug={activeSlug}
              onSelect={setActiveSlug}
              className="mx-auto max-w-md lg:max-w-none"
            />
          </m.div>

          <m.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={riseIn}
          >
            <AnimatePresence mode="wait">
              <m.div
                key={active.slug}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: duration.fast, ease: ease.soft }}
              >
                <Link to={`/destinations/${active.slug}`} className="group block">
                  <SmartImage
                    src={active.heroImage.src}
                    alt={pick(active.heroImage.alt, language)}
                    accent={active.accent}
                    sizes={HALF_SIZES}
                    className="aspect-[16/10] w-full"
                    imgClassName="photo-zoom"
                  />
                </Link>

                <p className="eyebrow mt-6 text-ember-600">
                  {t(`regions.${active.region}`)}
                </p>
                <h3 className="mt-3 font-display text-3xl text-charcoal-900">
                  {pick(active.name, language)}
                </h3>
                <p className="mt-3 leading-relaxed text-charcoal-600">
                  {pick(active.tagline, language)}
                </p>

                <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-4 border-t border-line pt-5">
                  <div>
                    <dt className="eyebrow text-ink-muted">
                      {t("destination.recommendedStay")}
                    </dt>
                    <dd className="mt-1.5 text-charcoal-900">
                      {formatDayRange(
                        active.recommendedDays.min,
                        active.recommendedDays.max,
                        t,
                        language,
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="eyebrow text-ink-muted">{t("destination.dailyBudget")}</dt>
                    <dd className="mt-1.5 text-charcoal-900">
                      {formatMoney(active.dailyBudgetFrom, "USD", language)}{" "}
                      <span className="text-ink-muted">{t("common.perPerson")}</span>
                    </dd>
                  </div>
                </dl>

                <Link
                  to={`/destinations/${active.slug}`}
                  className="group mt-6 inline-flex items-center gap-2 text-sm font-medium text-ember-600 transition-colors hover:text-ember-700"
                >
                  {t("home.map.openGuide")}
                  <Icon
                    name="arrow"
                    size={18}
                    className="transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                  />
                </Link>
              </m.div>
            </AnimatePresence>
          </m.div>
        </div>

        <div className="mt-12">
          <p className="eyebrow text-ink-muted">{t("home.map.pickPrompt")}</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {destinations.map((destination) => (
              <li key={destination.slug}>
                <button
                  type="button"
                  onClick={() => setActiveSlug(destination.slug)}
                  aria-pressed={destination.slug === activeSlug}
                  className={cn(
                    "border px-3.5 py-2 text-sm transition-colors",
                    destination.slug === activeSlug
                      ? "border-charcoal-800 bg-charcoal-800 text-ivory"
                      : "border-line text-charcoal-600 hover:border-charcoal-800/50 hover:bg-sand-100",
                  )}
                >
                  {pick(destination.name, language)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
