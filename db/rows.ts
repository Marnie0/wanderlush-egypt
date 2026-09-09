import type { Destination, Experience } from "../content/types";

/**
 * Rows come back with snake_case columns, flattened coordinates and numeric
 * columns as strings. The React app is typed against the content modules,
 * so the API returns exactly that shape and the swap from bundled content
 * to fetched content, when a phase needs it, changes no consumer.
 */
type Row = Record<string, unknown>;

const num = (value: unknown): number => Number(value);

export function rowToDestination(row: Row): Destination {
  return {
    id: row.id as string,
    slug: row.slug as string,
    name: row.name as Destination["name"],
    tagline: row.tagline as Destination["tagline"],
    region: row.region as Destination["region"],
    coordinates: { lat: num(row.latitude), lng: num(row.longitude) },
    travelStyles: row.travel_styles as Destination["travelStyles"],
    bestSeason: row.best_season as Destination["bestSeason"],
    bestSeasonNote: row.best_season_note as Destination["bestSeasonNote"],
    recommendedDays: { min: num(row.recommended_min_days), max: num(row.recommended_max_days) },
    nightlyRates: row.nightly_rates as Destination["nightlyRates"],
    dailyBudgetFrom: num(row.daily_budget_from),
    intro: row.intro as Destination["intro"],
    heroImage: row.hero_image as Destination["heroImage"],
    gallery: row.gallery as Destination["gallery"],
    attractions: row.attractions as Destination["attractions"],
    suggestedItinerary: row.suggested_itinerary as Destination["suggestedItinerary"],
    localAdvice: row.local_advice as Destination["localAdvice"],
    gettingThere: row.getting_there as Destination["gettingThere"],
    accommodationNote: row.accommodation_note as Destination["accommodationNote"],
    relatedSlugs: row.related_slugs as string[],
    accent: row.accent as string,
  };
}

export function rowToExperience(row: Row): Experience {
  return {
    id: row.id as string,
    slug: row.slug as string,
    name: row.name as Experience["name"],
    destinationSlug: row.destination_slug as string,
    category: row.category as Experience["category"],
    travelStyles: row.travel_styles as Experience["travelStyles"],
    environment: row.environment as Experience["environment"],
    groupFormat: row.group_format as Experience["groupFormat"],
    familyFriendly: Boolean(row.family_friendly),
    durationMinutes: num(row.duration_minutes),
    priceFrom: num(row.price_from),
    privateSupplement: num(row.private_supplement),
    rating: num(row.rating),
    reviewCount: num(row.review_count),
    maxGroupSize: num(row.max_group_size),
    minAge: row.min_age === null || row.min_age === undefined ? null : num(row.min_age),
    summary: row.summary as Experience["summary"],
    description: row.description as Experience["description"],
    schedule: row.schedule as Experience["schedule"],
    meetingPoint: row.meeting_point as Experience["meetingPoint"],
    inclusions: row.inclusions as Experience["inclusions"],
    exclusions: row.exclusions as Experience["exclusions"],
    whatToBring: row.what_to_bring as Experience["whatToBring"],
    accessibility: row.accessibility as Experience["accessibility"],
    cancellation: row.cancellation as Experience["cancellation"],
    heroImage: row.hero_image as Experience["heroImage"],
    gallery: row.gallery as Experience["gallery"],
    accent: row.accent as string,
  };
}
