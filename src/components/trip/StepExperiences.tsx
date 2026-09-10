import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { destinationBySlug } from "@content/destinations";
import { experiencesByDestination } from "@content/experiences";
import { SmartImage } from "@/components/ui/SmartImage";
import { Rating } from "@/components/ui/Rating";
import { EmptyState } from "@/components/ui/EmptyState";
import { ButtonLink } from "@/components/ui/Button";
import { useTripStore } from "@/lib/trip-store";
import { canBePrivate, experiencePrice } from "@/lib/estimate";
import { experienceSlugsInDays, interestScore, rankForInterests, stopsFromDays } from "@/lib/trip-plan";
import { formatDuration, formatMoney, formatNumber, pick } from "@/lib/format";
import { cn } from "@/lib/cn";

/**
 * Experiences grouped by the places in the trip, in route order, ranked by
 * what the traveller said they care about. Adding one places it on the
 * emptiest day in that place; the itinerary step can move it afterwards.
 */
export function StepExperiences() {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? "en";
  const days = useTripStore((state) => state.days);
  const interests = useTripStore((state) => state.interests);
  const children = useTripStore((state) => state.children);
  const currency = useTripStore((state) => state.currency);
  const tourStyle = useTripStore((state) => state.tourStyle);
  const saved = useTripStore((state) => state.savedExperienceSlugs);
  const toggleExperience = useTripStore((state) => state.toggleExperience);
  const stops = stopsFromDays(days);
  const chosen = new Set(experienceSlugsInDays(days));
  const money = (usd: number) => formatMoney(usd, currency, language);

  if (stops.length === 0) {
    return (
      <EmptyState
        icon="pin"
        title={t("builder.experiences.noPlacesTitle")}
        body={t("builder.experiences.noPlacesBody")}
        action={<ButtonLink to="/trip-builder?step=places" variant="secondary">{t("builder.itinerary.emptyAction")}</ButtonLink>}
      />
    );
  }

  const seen = new Set<string>();
  return (
    <div className="space-y-12">
      <div>
        <h2 className="font-display text-2xl text-charcoal-900">{t("builder.experiences.title")}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">{t("builder.experiences.hint")}</p>
      </div>
      {stops.map((stop) => {
        if (seen.has(stop.destinationSlug)) return null;
        seen.add(stop.destinationSlug);
        const destination = destinationBySlug.get(stop.destinationSlug);
        if (!destination) return null;
        const ranked = rankForInterests(experiencesByDestination[stop.destinationSlug] ?? [], interests, children > 0);
        // The badge means "answers what you told us", so it needs a real match, not just a top rank.
        const forYou = new Set(
          ranked.filter((e) => interestScore(e, interests) > 0).slice(0, 2).map((e) => e.slug),
        );
        const nights = days.filter((day) => day.destinationSlug === stop.destinationSlug).length;
        return (
          <section key={stop.destinationSlug} aria-labelledby={`exp-${stop.destinationSlug}`}>
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h3 id={`exp-${stop.destinationSlug}`} className="font-display text-xl text-charcoal-900">
                {pick(destination.name, language)}
              </h3>
              <p className="text-sm text-ink-muted">
                {t("common.days", { count: nights })}
                {" · "}
                {t("builder.experiences.chosenCount", {
                  count: ranked.filter((e) => chosen.has(e.slug)).length,
                })}
              </p>
            </div>
            <ul className="mt-4 space-y-3">
              {ranked.map((experience) => {
                const active = chosen.has(experience.slug);
                const recommended = forYou.has(experience.slug);
                return (
                  <li key={experience.slug}>
                    <div
                      className={cn(
                        "flex items-stretch gap-4 border bg-canvas transition-colors",
                        active ? "border-charcoal-800" : "border-line",
                      )}
                    >
                      <Link to={`/experiences/${experience.slug}`} className="w-28 shrink-0 sm:w-36">
                        <SmartImage
                          src={experience.heroImage.src}
                          alt={pick(experience.heroImage.alt, language)}
                          accent={experience.accent}
                          sizes="9rem"
                          className="h-full min-h-28"
                        />
                      </Link>
                      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 py-3 pe-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <Link
                              to={`/experiences/${experience.slug}`}
                              className="font-display text-lg leading-snug text-charcoal-900 hover:text-ember-600"
                            >
                              {pick(experience.name, language)}
                            </Link>
                            {recommended && (
                              <span className="border border-gold-500 px-1.5 py-0.5 text-[0.65rem] uppercase tracking-wide text-gold-700">
                                {t("builder.experiences.forYou")}
                              </span>
                            )}
                            {saved.includes(experience.slug) && !active && (
                              <span className="text-xs text-ink-muted">{t("saved.savedLabel")}</span>
                            )}
                          </div>
                          <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{pick(experience.summary, language)}</p>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm">
                          <span className="text-ink-muted">
                            {formatDuration(experience.durationMinutes, t)}
                            {" · "}
                            {t(
                              tourStyle === "private" && canBePrivate(experience)
                                ? "builder.experiences.perPersonPrivate"
                                : "builder.experiences.perPerson",
                              { amount: money(experiencePrice(experience, tourStyle)) },
                            )}
                            {experience.minAge !== null && (
                              <>
                                {" · "}
                                {t("experience.minAge", { age: formatNumber(experience.minAge, language) })}
                              </>
                            )}
                          </span>
                          <span className="flex items-center gap-3">
                            <Rating value={experience.rating} count={experience.reviewCount} />
                            <button
                              type="button"
                              onClick={() => toggleExperience(experience.slug)}
                              aria-pressed={active}
                              className={cn(
                                "inline-flex h-9 items-center gap-1.5 rounded-sm border px-3 text-sm transition-colors",
                                active
                                  ? "border-teal-600 bg-teal-50 text-teal-700 hover:bg-teal-100"
                                  : "border-charcoal-800/25 text-charcoal-800 hover:border-charcoal-800/60 hover:bg-sand-100",
                              )}
                            >
                              {active ? t("trip.added") : t("trip.add")}
                            </button>
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
      <p className="text-sm text-ink-muted">
        {t("builder.experiences.browseMore")}{" "}
        <ButtonLink to="/experiences" variant="ghost" size="sm" className="underline underline-offset-4">
          {t("builder.experiences.browseLink")}
        </ButtonLink>
      </p>
    </div>
  );
}
