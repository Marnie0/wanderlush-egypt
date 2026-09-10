import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { m } from "framer-motion";
import { experiences } from "@content/experiences";
import { destinations } from "@content/destinations";
import { Container, Section } from "@/components/ui/Layout";
import { PageHeader } from "@/components/ui/PageHeader";
import { ExperienceCard } from "@/components/ui/Cards";
import { EmptyState } from "@/components/ui/EmptyState";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { ExperienceFilters } from "@/components/experiences/ExperienceFilters";
import { ExperienceActiveFilters } from "@/components/experiences/ExperienceActiveFilters";
import { SortSelect } from "@/components/experiences/SortSelect";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useTripStore } from "@/lib/trip-store";
import {
  countActiveExperienceFilters,
  emptyExperienceFilters,
  experienceFiltersFromParams,
  experienceFiltersToParams,
  filterExperiences,
  type ExperienceFilterState,
} from "@/lib/experience-filters";
import { stagger } from "@/lib/motion";

const destinationSlugs = destinations.map((destination) => destination.slug);

export function ExperiencesPage() {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? "en";
  usePageMeta(t("meta.experiences"), t("pages.experiences.intro"));

  // Filters and the sort order live in the URL, so a shortlist of criteria
  // survives a reload and can be sent to whoever is travelling with you.
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(
    () => experienceFiltersFromParams(searchParams, destinationSlugs),
    [searchParams],
  );
  const setFilters = useCallback(
    (next: ExperienceFilterState) =>
      setSearchParams(experienceFiltersToParams(next), { replace: true }),
    [setSearchParams],
  );

  const [drawerOpen, setDrawerOpen] = useState(false);
  const savedSlugs = useTripStore((state) => state.savedExperienceSlugs);

  const results = useMemo(
    () => filterExperiences(experiences, filters, language, savedSlugs, t),
    [filters, language, savedSlugs, t],
  );
  const activeCount = countActiveExperienceFilters(filters);

  return (
    <>
      <PageHeader
        eyebrow={t("pages.experiences.eyebrow")}
        title={t("pages.experiences.title")}
        intro={t("pages.experiences.intro")}
      />

      <Section className="pt-0 lg:pt-0">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[18rem_1fr] lg:gap-14">
            <aside className="hidden lg:block">
              {/* The panel is taller than a viewport once every group is open,
                  so it scrolls within itself rather than pinning past the fold. */}
              <div className="sticky top-28 max-h-[calc(100vh-9rem)] overflow-y-auto pe-2">
                <ExperienceFilters
                  filters={filters}
                  onChange={setFilters}
                  savedCount={savedSlugs.length}
                />
              </div>
            </aside>

            <div id="results">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-ink-muted" aria-live="polite">
                  {t("experiences.resultCount", { count: results.length })}
                </p>
                <div className="flex items-center gap-3">
                  <SortSelect
                    value={filters.sort}
                    onChange={(sort) => setFilters({ ...filters, sort })}
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="lg:hidden"
                    onClick={() => setDrawerOpen(true)}
                  >
                    {t("explore.showFilters")}
                    {activeCount > 0 && (
                      <span className="ms-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-ember-600 px-1.5 text-xs text-ivory">
                        {activeCount}
                      </span>
                    )}
                  </Button>
                </div>
              </div>

              <div className="mt-5">
                <ExperienceActiveFilters filters={filters} onChange={setFilters} />
              </div>
              <h2 className="sr-only">{t("experiences.resultsHeading")}</h2>

              {results.length === 0 ? (
                <EmptyState
                  className="mt-12"
                  icon="search"
                  title={filters.savedOnly && savedSlugs.length === 0 ? t("experiences.emptySaved.title") : t("experiences.empty.title")}
                  body={filters.savedOnly && savedSlugs.length === 0 ? t("experiences.emptySaved.body") : t("experiences.empty.body")}
                  action={
                    <Button onClick={() => setFilters({ ...emptyExperienceFilters, sort: filters.sort })}>
                      {t("experiences.empty.action")}
                    </Button>
                  }
                />
              ) : (
                // Not keyed on the results: remounting the grid made every
                // card fade in again on each keystroke. The grid animates
                // rather than waiting for the viewport because a card that
                // arrives later inherits the parent's animate state, and a
                // once-only viewport trigger would leave it hidden.
                <m.div
                  initial="hidden"
                  animate="visible"
                  variants={stagger(0.03, 0.06)}
                  className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-3"
                >
                  {results.map((experience, index) => (
                    <ExperienceCard
                      key={experience.slug}
                      experience={experience}
                      sizes="(min-width: 1280px) 28vw, (min-width: 640px) 42vw, 100vw"
                      showActions
                      priority={index < 3}
                    />
                  ))}
                </m.div>
              )}
            </div>
          </div>
        </Container>
      </Section>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={t("explore.filters")}>
        <ExperienceFilters
          filters={filters}
          onChange={setFilters}
          savedCount={savedSlugs.length}
        />
        <Button className="mt-10 w-full" onClick={() => setDrawerOpen(false)}>
          {t("experiences.resultCount", { count: results.length })}
        </Button>
      </Drawer>
    </>
  );
}
