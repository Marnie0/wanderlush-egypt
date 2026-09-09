import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { SmartImage } from "./SmartImage";
import { pick, formatMoney } from "@/lib/format";
import { riseIn } from "@/lib/motion";
import { cn } from "@/lib/cn";
import type { Destination, Experience, Journey } from "@content/types";

const cardMotion = {
  variants: riseIn,
  className: "group",
} as const;

export function DestinationCard({
  destination,
  className,
  featured = false,
}: {
  destination: Destination;
  className?: string;
  featured?: boolean;
}) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? "en";

  return (
    <motion.article {...cardMotion} className={cn(cardMotion.className, className)}>
      <Link to={`/destinations/${destination.slug}`} className="block">
        <SmartImage
          src={destination.heroImage.src}
          alt={pick(destination.heroImage.alt, language)}
          accent={destination.accent}
          className={cn(
            "w-full transition-[border-radius] duration-500",
            featured ? "aspect-[4/5] lg:aspect-[3/4]" : "aspect-[4/3]",
          )}
          imgClassName="transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
        >
          <div className="absolute inset-x-0 bottom-0 h-2/3 scrim-bottom" />
          <div className="absolute inset-x-0 bottom-0 p-6">
            <h3 className="font-display text-3xl text-ivory">{pick(destination.name, language)}</h3>
            <p className="mt-1 text-sm text-ivory/80">{pick(destination.tagline, language)}</p>
          </div>
        </SmartImage>
      </Link>
      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm text-ink-muted">
        <span>
          {t("common.days", { count: destination.recommendedDays.min })}
          {"–"}
          {t("common.days", { count: destination.recommendedDays.max })}
        </span>
        <span>
          {t("common.from")} {formatMoney(destination.dailyBudgetFrom, "USD", language)}{" "}
          <span className="text-ink-muted/80">{t("common.perPerson")}</span>
        </span>
      </div>
    </motion.article>
  );
}

export function ExperienceCard({
  experience,
  className,
}: {
  experience: Experience;
  className?: string;
}) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? "en";
  const hours = Math.round(experience.durationMinutes / 60);

  return (
    <motion.article {...cardMotion} className={cn(cardMotion.className, className)}>
      <Link to={`/experiences/${experience.slug}`} className="block">
        <SmartImage
          src={experience.heroImage.src}
          alt={pick(experience.heroImage.alt, language)}
          accent={experience.accent}
          className="aspect-[3/2] w-full"
          imgClassName="transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
        />
        <div className="pt-4">
          <p className="eyebrow text-gold-600">{t(`categories.${experience.category}`, experience.category)}</p>
          <h3 className="mt-2 font-display text-xl leading-snug text-charcoal-900 transition-colors group-hover:text-ember-600">
            {pick(experience.name, language)}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-muted">
            {pick(experience.summary, language)}
          </p>
        </div>
      </Link>
      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-line pt-3 text-sm">
        <span className="text-ink-muted">
          {hours >= 24
            ? t("common.days", { count: Math.round(hours / 24) })
            : t("common.hours", { count: hours })}
        </span>
        <span className="text-charcoal-800">
          {t("common.from")} {formatMoney(experience.priceFrom, "USD", language)}
        </span>
      </div>
    </motion.article>
  );
}

export function JourneyCard({ journey, className }: { journey: Journey; className?: string }) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? "en";

  return (
    <motion.article {...cardMotion} className={cn(cardMotion.className, className)}>
      <Link to={`/journeys/${journey.slug}`} className="block">
        <SmartImage
          src={journey.heroImage.src}
          alt={pick(journey.heroImage.alt, language)}
          accent={journey.accent}
          className="aspect-[16/10] w-full"
          imgClassName="transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
        >
          <div className="absolute inset-x-0 bottom-0 h-1/2 scrim-bottom" />
          <p className="absolute bottom-5 start-6 text-sm text-ivory/85">
            {t("common.days", { count: journey.days })}
          </p>
        </SmartImage>
        <div className="pt-4">
          <h3 className="font-display text-2xl leading-snug text-charcoal-900 transition-colors group-hover:text-ember-600">
            {pick(journey.name, language)}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            {pick(journey.tagline, language)}
          </p>
          <p className="mt-3 text-sm text-charcoal-800">
            {t("common.from")} {formatMoney(journey.priceFrom, "USD", language)}{" "}
            <span className="text-ink-muted">{t("common.perPerson")}</span>
          </p>
        </div>
      </Link>
    </motion.article>
  );
}
