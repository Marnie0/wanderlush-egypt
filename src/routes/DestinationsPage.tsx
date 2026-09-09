import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { m } from "framer-motion";
import { destinations, destinationBySlug } from "@content/destinations";
import { Container, Eyebrow, Rule, Section } from "@/components/ui/Layout";
import { PageHeader } from "@/components/ui/PageHeader";
import { DestinationCard } from "@/components/ui/Cards";
import { EgyptMap } from "@/components/ui/EgyptMap";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { DestinationFilters } from "@/components/destinations/DestinationFilters";
import { ActiveFilters } from "@/components/destinations/ActiveFilters";
import { DestinationSpotlight } from "@/components/destinations/DestinationSpotlight";
import { usePageMeta } from "@/hooks/usePageMeta";
import {
  countActiveFilters,
  emptyFilters,
  filterDestinations,
  filtersFromParams,
  filtersToParams,
  type DestinationFilterState,
} from "@/lib/destination-filters";
import { pick } from "@/lib/format";
import { stagger, viewportOnce } from "@/lib/motion";
import { cn } from "@/lib/cn";

export function DestinationsPage() {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? "en";
  usePageMeta(t("meta.destinations"), t("pages.destinations.intro"));

  // Filters live in the URL, so a filtered view survives a reload and can be
  // shared as a link.
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => filtersFromParams(searchParams), [searchParams]);
  const setFilters = useCallback(
    (next: DestinationFilterState) => setSearchParams(filtersToParams(next), { replace: true }),
    [setSearchParams],
  );

  const [activeSlug, setActiveSlug] = useState("giza");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const spotlight = destinationBySlug.get(activeSlug) ?? destinations[0];

  const results = useMemo(
    () => filterDestinations(destinations, filters, language),
    [filters, language],
  );
  const activeCount = countActiveFilters(filters);

  return (
    <>
      <PageHeader
        eyebrow={t("pages.destinations.eyebrow")}
        title={t("pages.destinations.title")}
        intro={t("pages.destinations.intro")}
      />

      <section className="bg-sand-50 py-16 lg:py-20">
        <Container>
          <Eyebrow>{t("explore.spotlight")}</Eyebrow>
          <Rule className="mt-4" />
          <div className="mt-10 grid items-center gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
            <EgyptMap
              destinations={destinations}
              activeSlug={activeSlug}
              onSelect={setActiveSlug}
              className="mx-auto max-w-md lg:max-w-none"
            />
            <DestinationSpotlight destination={spotlight} />
          </div>

          {/* The keyboard and touch alternative to the map itself. */}
          <div className="mt-10">
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

      <Section className="pt-0 lg:pt-0">
        <Container className="pt-16 lg:pt-20">
          <div className="grid gap-12 lg:grid-cols-[16rem_1fr] lg:gap-14">
            <aside className="hidden lg:block">
              <div className="sticky top-28">
                <DestinationFilters filters={filters} onChange={setFilters} />
              </div>
            </aside>

            <div id="results">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-ink-muted" aria-live="polite">
                  {t("explore.resultCount", { count: results.length })}
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setDrawerOpen(true)}
                >
                  {t("explore.showFilters")}
                  {activeCount > 0 && (
                    <span className="ms-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-ember-500 px-1.5 text-xs text-ivory">
                      {activeCount}
                    </span>
                  )}
                </Button>
              </div>

              <div className="mt-5">
                <ActiveFilters filters={filters} onChange={setFilters} />
              </div>

              {results.length === 0 ? (
                <div className="mt-12 border border-line bg-sand-50 px-6 py-14 text-center">
                  <h2 className="font-display text-2xl text-charcoal-900">
                    {t("explore.empty.title")}
                  </h2>
                  <p className="mx-auto mt-3 max-w-md leading-relaxed text-charcoal-600">
                    {t("explore.empty.body")}
                  </p>
                  <Button className="mt-8" onClick={() => setFilters(emptyFilters)}>
                    {t("explore.empty.action")}
                  </Button>
                </div>
              ) : (
                <m.div
                  key={results.map((destination) => destination.slug).join()}
                  initial="hidden"
                  whileInView="visible"
                  viewport={viewportOnce}
                  variants={stagger(0.03, 0.06)}
                  className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-3"
                >
                  {results.map((destination) => (
                    <DestinationCard
                      key={destination.slug}
                      destination={destination}
                      sizes="(min-width: 1280px) 28vw, (min-width: 640px) 42vw, 100vw"
                      showAddToTrip
                    />
                  ))}
                </m.div>
              )}
            </div>
          </div>
        </Container>
      </Section>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={t("explore.filters")}>
        <DestinationFilters filters={filters} onChange={setFilters} />
        <Button className="mt-10 w-full" onClick={() => setDrawerOpen(false)}>
          {t("explore.resultCount", { count: results.length })}
        </Button>
      </Drawer>
    </>
  );
}
