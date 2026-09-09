import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AnimatePresence, m } from "framer-motion";
import { experiencesByDestination } from "@content/experiences";
import { SmartImage, HALF_SIZES } from "@/components/ui/SmartImage";
import { AddToTripButton } from "@/components/ui/AddToTripButton";
import { Icon } from "@/components/ui/Icon";
import { formatDayRange, formatMoney, pick } from "@/lib/format";
import { duration, ease } from "@/lib/motion";
import type { Destination } from "@content/types";

/**
 * The panel beside the map. Selecting a place swaps its photograph,
 * introduction, recommended duration, experience count and starting estimate,
 * which is what the brief asks the map to drive.
 */
export function DestinationSpotlight({ destination }: { destination: Destination }) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? "en";
  const experienceCount = (experiencesByDestination[destination.slug] ?? []).length;

  return (
    <AnimatePresence mode="wait">
      <m.div
        key={destination.slug}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: duration.fast, ease: ease.soft }}
      >
        <Link to={`/destinations/${destination.slug}`} className="group block">
          <SmartImage
            src={destination.heroImage.src}
            alt={pick(destination.heroImage.alt, language)}
            accent={destination.accent}
            sizes={HALF_SIZES}
            className="aspect-[16/10] w-full"
            imgClassName="transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
          />
        </Link>

        <p className="eyebrow mt-6 text-ember-600">{t(`regions.${destination.region}`)}</p>
        <h2 className="mt-3 font-display text-3xl text-charcoal-900">
          {pick(destination.name, language)}
        </h2>
        <p className="mt-4 leading-relaxed text-charcoal-600">
          {pick(destination.intro, language)}
        </p>

        <dl className="mt-6 grid gap-x-8 gap-y-4 border-t border-line pt-5 sm:grid-cols-3">
          <div>
            <dt className="eyebrow text-ink-muted">{t("destination.recommendedStay")}</dt>
            <dd className="mt-1.5 text-charcoal-900">
              {formatDayRange(
                destination.recommendedDays.min,
                destination.recommendedDays.max,
                t,
                language,
              )}
            </dd>
          </div>
          <div>
            <dt className="eyebrow text-ink-muted">{t("explore.startingFrom")}</dt>
            <dd className="mt-1.5 text-charcoal-900">
              {formatMoney(destination.dailyBudgetFrom, "USD", language)}{" "}
              <span className="text-ink-muted">{t("common.perPerson")}</span>
            </dd>
          </div>
          <div>
            <dt className="eyebrow text-ink-muted">{t("destination.experiencesHere")}</dt>
            <dd className="mt-1.5 text-charcoal-900">
              {t("explore.experiencesHere", { count: experienceCount })}
            </dd>
          </div>
        </dl>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <AddToTripButton kind="destination" slug={destination.slug} />
          <Link
            to={`/destinations/${destination.slug}`}
            className="group inline-flex items-center gap-2 px-2 text-sm font-medium text-ember-600 transition-colors hover:text-ember-700"
          >
            {t("home.map.openGuide")}
            <Icon
              name="arrow"
              size={18}
              className="transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
            />
          </Link>
        </div>
      </m.div>
    </AnimatePresence>
  );
}
