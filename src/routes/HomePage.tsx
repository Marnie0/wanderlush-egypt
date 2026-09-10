import { Suspense, lazy } from "react";
import { useTranslation } from "react-i18next";
import { HeroSection } from "@/components/home/HeroSection";
import { organisationData, usePageMeta } from "@/hooks/usePageMeta";

/**
 * The homepage runs inspiration first, then breadth, then proof, then the ask:
 * hero, editorial destinations, the map, curated journeys, experiences, how we
 * work, testimonials, and the closing call to action.
 *
 * Only the hero is in the entry bundle. Everything below it arrives in a
 * second chunk that downloads while the visitor is still reading the headline.
 */
const BelowFold = lazy(() => import("@/components/home/BelowFold"));

export function HomePage() {
  const { t } = useTranslation();
  usePageMeta(undefined, t("brand.shortDescription"), { structuredData: organisationData(t("brand.name"), t("brand.shortDescription")) });

  return (
    <>
      <HeroSection />
      <Suspense fallback={<div className="min-h-[60svh]" aria-hidden />}>
        <BelowFold />
      </Suspense>
    </>
  );
}
