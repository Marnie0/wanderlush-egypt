import { DestinationShowcase } from "./DestinationShowcase";
import { MapPreview } from "./MapPreview";
import { JourneysPreview } from "./JourneysPreview";
import { ExperiencesPreview } from "./ExperiencesPreview";
import { PromisesSection } from "./PromisesSection";
import { Testimonials } from "./Testimonials";
import { FinalCta } from "./FinalCta";

/**
 * Everything under the hero, in one lazily-loaded chunk. These sections pull
 * in the destination, journey and experience catalogues, which the first paint
 * does not need; keeping them out of the entry bundle protects the hero.
 */
export default function BelowFold() {
  return (
    <>
      <DestinationShowcase />
      <MapPreview />
      <JourneysPreview />
      <ExperiencesPreview />
      <PromisesSection />
      <Testimonials />
      <FinalCta />
    </>
  );
}
