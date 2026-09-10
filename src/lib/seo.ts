import { imageManifest } from "@/generated/images";
import { destinationBySlug } from "@content/destinations";
import type { Destination, Experience, Journey } from "@content/types";
import { SITE_ORIGIN } from "@/hooks/usePageMeta";
import { pick } from "./format";
import { journeyPriceFrom } from "./journey-price";

/**
 * Structured data for the pages that describe one thing, so a search engine
 * can read a destination as a place, an experience as an attraction with a
 * price, and a journey as a trip, rather than as prose.
 */

/** The largest rendered variant of a photograph, as an absolute address for a link preview. */
export function socialImageFor(src: string): string | undefined {
  const entry = imageManifest[src];
  if (!entry) return undefined;
  const largest = entry.sources[entry.sources.length - 1];
  return `${SITE_ORIGIN}${largest.url}`;
}

export function destinationData(destination: Destination, language: string) {
  return {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: pick(destination.name, language),
    description: pick(destination.intro, language),
    url: `${SITE_ORIGIN}/destinations/${destination.slug}`,
    image: socialImageFor(destination.heroImage.src),
    geo: { "@type": "GeoCoordinates", latitude: destination.coordinates.lat, longitude: destination.coordinates.lng },
    containedInPlace: { "@type": "Country", name: language.startsWith("ar") ? "مصر" : "Egypt" },
    touristType: destination.travelStyles,
  };
}

export function experienceData(experience: Experience, language: string) {
  const destination = destinationBySlug.get(experience.destinationSlug);
  return {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: pick(experience.name, language),
    description: pick(experience.summary, language),
    url: `${SITE_ORIGIN}/experiences/${experience.slug}`,
    image: socialImageFor(experience.heroImage.src),
    ...(destination ? { containedInPlace: { "@type": "TouristDestination", name: pick(destination.name, language), url: `${SITE_ORIGIN}/destinations/${destination.slug}` } } : {}),
    offers: { "@type": "Offer", price: experience.priceFrom, priceCurrency: "USD", url: `${SITE_ORIGIN}/experiences/${experience.slug}` },
    aggregateRating: { "@type": "AggregateRating", ratingValue: experience.rating, reviewCount: experience.reviewCount, bestRating: 5 },
  };
}

export function journeyData(journey: Journey, language: string) {
  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: pick(journey.name, language),
    description: pick(journey.summary, language),
    url: `${SITE_ORIGIN}/journeys/${journey.slug}`,
    image: socialImageFor(journey.heroImage.src),
    itinerary: {
      "@type": "ItemList",
      itemListElement: journey.destinationSlugs.map((slug, index) => {
        const destination = destinationBySlug.get(slug);
        return { "@type": "ListItem", position: index + 1, name: destination ? pick(destination.name, language) : slug, url: `${SITE_ORIGIN}/destinations/${slug}` };
      }),
    },
    offers: { "@type": "Offer", price: journeyPriceFrom(journey), priceCurrency: "USD", url: `${SITE_ORIGIN}/journeys/${journey.slug}` },
  };
}
