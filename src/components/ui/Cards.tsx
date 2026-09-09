import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { m } from "framer-motion";
import { SmartImage, CARD_SIZES, HALF_SIZES } from "./SmartImage";
import { AddToTripButton } from "./AddToTripButton";
import { SaveButton } from "./SaveButton";
import { Rating } from "./Rating";
import { destinationBySlug } from "@content/destinations";
import { pick, formatMoney, formatDayRange, formatDuration } from "@/lib/format";
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
  sizes = CARD_SIZES,
  showAddToTrip = false,
  priority = false,
}: {
  destination: Destination;
  className?: string;
  featured?: boolean;
  sizes?: string;
  showAddToTrip?: boolean;
  /** The first row of a grid is the largest thing on screen; do not lazy-load it. */
  priority?: boolean;
}) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? "en";

  return (
    <m.article {...cardMotion} className={cn(cardMotion.className, className)}>
      <Link to={`/destinations/${destination.slug}`} className="block">
        <SmartImage
          src={destination.heroImage.src}
          alt={pick(destination.heroImage.alt, language)}
          accent={destination.accent}
          sizes={sizes}
          priority={priority}
          className={cn(
            "w-full",
            featured ? "aspect-[4/5] lg:aspect-[3/4]" : "aspect-[4/3]",
          )}
          imgClassName="transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
        >
          <div className="absolute inset-x-0 bottom-0 h-2/3 scrim-bottom" />
          <div className="absolute inset-x-0 bottom-0 p-6">
            <h3 className="font-display text-3xl text-ivory on-photo">{pick(destination.name, language)}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-ivory/80">
              {pick(destination.tagline, language)}
            </p>
          </div>
        </SmartImage>
      </Link>
      {showAddToTrip && (
        <AddToTripButton
          kind="destination"
          slug={destination.slug}
          size="sm"
          variant="secondary"
          className="mt-4 w-full"
        />
      )}
      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm text-ink-muted">
        <span>
          {formatDayRange(
            destination.recommendedDays.min,
            destination.recommendedDays.max,
            t,
            language,
          )}
        </span>
        <span>
          {t("common.from")} {formatMoney(destination.dailyBudgetFrom, "USD", language)}{" "}
          <span className="text-ink-muted">{t("common.perPerson")}</span>
        </span>
      </div>
    </m.article>
  );
}

export function ExperienceCard({
  experience,
  className,
  sizes = CARD_SIZES,
  showActions = false,
  priority = false,
}: {
  experience: Experience;
  className?: string;
  sizes?: string;
  /** Homepage teasers link through instead; only the marketplace acts here. */
  showActions?: boolean;
  /** The first row of a grid is the largest thing on screen; do not lazy-load it. */
  priority?: boolean;
}) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? "en";
  const destination = destinationBySlug.get(experience.destinationSlug);
  // "Private or shared" reads as one fact; two chips read as two.
  const groupLabel =
    experience.groupFormat.length > 1
      ? t("groupFormat.both")
      : t(`groupFormat.${experience.groupFormat[0]}`);

  return (
    // A column that fills its grid cell, so a two-line title on one card does
    // not leave its price and button sitting below the row's.
    <m.article
      {...cardMotion}
      className={cn(cardMotion.className, "flex h-full flex-col", className)}
    >
      <div className="relative">
        <Link to={`/experiences/${experience.slug}`} className="block">
          <SmartImage
            src={experience.heroImage.src}
            alt={pick(experience.heroImage.alt, language)}
            accent={experience.accent}
            sizes={sizes}
            priority={priority}
            className="aspect-[3/2] w-full"
            imgClassName="transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
          />
        </Link>
        {showActions && (
          <SaveButton
            slug={experience.slug}
            className="absolute end-3 top-3 h-10 w-10 border-transparent bg-canvas/85 backdrop-blur-sm"
          />
        )}
      </div>

      <Link to={`/experiences/${experience.slug}`} className="block pt-4">
        <div className="flex items-baseline justify-between gap-3">
          <p className="eyebrow text-gold-600">
            {t(`categories.${experience.category}`, experience.category)}
          </p>
          <Rating value={experience.rating} count={experience.reviewCount} />
        </div>
        <h3 className="mt-2 font-display text-xl leading-snug text-charcoal-900 transition-colors group-hover:text-ember-600">
          {pick(experience.name, language)}
        </h3>
        {destination && (
          <p className="mt-1 text-sm text-ink-muted">{pick(destination.name, language)}</p>
        )}
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-muted">
          {pick(experience.summary, language)}
        </p>
      </Link>

      <div className="mt-auto">
        <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-line pt-3 text-sm">
          <span className="text-ink-muted">
            {formatDuration(experience.durationMinutes, t)}
            <span className="mx-1.5 text-charcoal-300">·</span>
            {groupLabel}
          </span>
          <span className="text-charcoal-800">
            {t("common.from")} {formatMoney(experience.priceFrom, "USD", language)}
          </span>
        </div>

        {showActions && (
          <AddToTripButton
            kind="experience"
            slug={experience.slug}
            size="sm"
            variant="secondary"
            className="mt-4 w-full"
          />
        )}
      </div>
    </m.article>
  );
}

export function JourneyCard({
  journey,
  className,
  sizes = HALF_SIZES,
}: {
  journey: Journey;
  className?: string;
  /** The journeys page shows two across; the homepage preview shows three. */
  sizes?: string;
}) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? "en";

  return (
    <m.article {...cardMotion} className={cn(cardMotion.className, className)}>
      <Link to={`/journeys/${journey.slug}`} className="block">
        <SmartImage
          src={journey.heroImage.src}
          alt={pick(journey.heroImage.alt, language)}
          accent={journey.accent}
          sizes={sizes}
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
    </m.article>
  );
}
