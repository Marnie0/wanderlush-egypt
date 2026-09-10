/**
 * Content integrity check.
 *
 *   npm run check:content
 *
 * Catches the class of mistake that put the Giza pyramids under Cairo: a slug
 * that does not resolve, an image with no file behind it, or a destination
 * that nothing links to.
 */
import { destinations, destinationBySlug, homepageDestinationSlugs } from "../content/destinations.ts";
import { experiences } from "../content/experiences.ts";
import { journeys } from "../content/journeys.ts";
import { accommodationById, accommodationLevels } from "../content/accommodation.ts";
import { reviews } from "../content/reviews.ts";
import { faqs, faqCategories } from "../content/faqs.ts";
import { imageManifest } from "../src/generated/images.ts";
import { journeyPriceFrom } from "../src/lib/journey-price.ts";

const problems = [];
const fail = (where, message) => problems.push(`${where}: ${message}`);

const destinationSlugs = new Set(destinations.map((d) => d.slug));
const experienceSlugs = new Set(experiences.map((e) => e.slug));

// A Set would silently swallow a duplicate, and the database would not.
function unique(label, items, key) {
  const seen = new Set();
  for (const item of items) {
    const value = item[key];
    if (seen.has(value)) fail(label, `duplicate ${key} "${value}"`);
    seen.add(value);
  }
}
unique("destinations", destinations, "slug");
unique("destinations", destinations, "id");
unique("experiences", experiences, "slug");
unique("experiences", experiences, "id");
unique("journeys", journeys, "slug");
unique("journeys", journeys, "id");
unique("reviews", reviews, "id");
unique("faqs", faqs, "id");
unique("accommodation", accommodationLevels, "id");

// Every localised field must carry both languages, and neither may be blank.
function walkLocalized(where, value, path = "") {
  if (Array.isArray(value)) {
    value.forEach((item, index) => walkLocalized(where, item, `${path}[${index}]`));
    return;
  }
  if (!value || typeof value !== "object") return;
  const keys = Object.keys(value);
  if (keys.includes("en") || keys.includes("ar")) {
    for (const lang of ["en", "ar"]) {
      const text = value[lang];
      const empty = Array.isArray(text) ? text.length === 0 || text.some((t) => !String(t).trim()) : !String(text ?? "").trim();
      if (empty) fail(where, `${path || "field"}.${lang} is empty`);
    }
    return;
  }
  for (const key of keys) walkLocalized(where, value[key], path ? `${path}.${key}` : key);
}
for (const d of destinations) walkLocalized(d.slug, d);
for (const e of experiences) walkLocalized(e.slug, e);
for (const j of journeys) walkLocalized(j.slug, j);
for (const r of reviews) walkLocalized(r.id, r);
for (const f of faqs) walkLocalized(f.id, f);
for (const a of accommodationLevels) walkLocalized(a.id, a);

const faqCategoryIds = new Set(faqCategories.map((c) => c.id));
for (const f of faqs) {
  if (!faqCategoryIds.has(f.categoryId)) fail(f.id, `unknown FAQ category "${f.categoryId}"`);
}
for (const a of accommodationLevels) {
  if (a.nightlyFrom <= 0 || a.nightlyTo < a.nightlyFrom) fail(a.id, "nightly range is inverted or zero");
}

for (const d of destinations) {
  for (const related of d.relatedSlugs) {
    if (!destinationSlugs.has(related)) fail(d.slug, `related destination "${related}" does not exist`);
    if (related === d.slug) fail(d.slug, "lists itself as related");
  }
  for (const image of [d.heroImage, ...d.gallery]) {
    if (!imageManifest[image.src]) fail(d.slug, `missing image ${image.src}`);
  }
  if (d.recommendedDays.min > d.recommendedDays.max) fail(d.slug, "recommended days are inverted");
  if (d.recommendedDays.min < 1) fail(d.slug, "recommended stay must be at least a day");
  // Egypt sits between 22 and 32 north and 25 and 37 east.
  const { lat, lng } = d.coordinates;
  if (lat < 21.9 || lat > 31.8 || lng < 24.5 || lng > 37) fail(d.slug, `coordinates ${lat}, ${lng} are outside Egypt`);
  if (d.dailyBudgetFrom <= 0) fail(d.slug, "daily budget must be positive");
  for (const [tier, rate] of Object.entries(d.nightlyRates)) {
    if (rate <= 0) fail(d.slug, `${tier} nightly rate must be positive`);
  }
  if (d.bestSeason.length === 0) fail(d.slug, "needs at least one good month");
  if (d.gallery.length === 0) fail(d.slug, "has no gallery");
  if (d.attractions.length === 0) fail(d.slug, "has no attractions");
}

for (const e of experiences) {
  if (!destinationSlugs.has(e.destinationSlug)) {
    fail(e.slug, `destination "${e.destinationSlug}" does not exist`);
  }
  for (const image of [e.heroImage, ...e.gallery]) {
    if (!imageManifest[image.src]) fail(e.slug, `missing image ${image.src}`);
  }
  if (e.durationMinutes <= 0) fail(e.slug, "duration must be positive");
  if (e.priceFrom <= 0) fail(e.slug, "price must be positive");
  if (e.privateSupplement < 0) fail(e.slug, "private supplement must not be negative");
  if (e.rating < 0 || e.rating > 5) fail(e.slug, "rating must be between 0 and 5");
  if (e.groupFormat.length === 0) fail(e.slug, "needs at least one group format");
  if (e.maxGroupSize < 1) fail(e.slug, "group size must be at least one");
  if (e.minAge !== null && e.minAge >= 16 && e.familyFriendly) {
    fail(e.slug, `minimum age ${e.minAge} contradicts family friendly`);
  }
  if (e.gallery.length === 0) fail(e.slug, "has no gallery");
}

for (const j of journeys) {
  for (const slug of j.destinationSlugs) {
    if (!destinationSlugs.has(slug)) fail(j.slug, `destination "${slug}" does not exist`);
  }
  for (const slug of j.experienceSlugs) {
    if (!experienceSlugs.has(slug)) fail(j.slug, `experience "${slug}" does not exist`);
  }
  // Every experience in a journey must sit in a destination the journey visits.
  for (const slug of j.experienceSlugs) {
    const experience = experiences.find((e) => e.slug === slug);
    if (experience && !j.destinationSlugs.includes(experience.destinationSlug)) {
      fail(j.slug, `includes "${slug}" but never visits ${experience.destinationSlug}`);
    }
  }
  if (!accommodationById.has(j.suggestedTier)) fail(j.slug, `unknown tier "${j.suggestedTier}"`);
  if (j.outline.length !== j.days) fail(j.slug, `${j.days} days but ${j.outline.length} outline entries`);
  j.outline.forEach((entry, index) => {
    if (entry.day !== index + 1) fail(j.slug, `outline day ${entry.day} is out of sequence`);
  });
  if (j.priceFrom <= 0) fail(j.slug, "price must be positive");
  // The card computes its price; the content copy feeds the database. Same number, or neither is honest.
  const computed = journeyPriceFrom(j);
  if (j.priceFrom !== computed) fail(j.slug, `priceFrom is ${j.priceFrom} but the estimator makes it ${computed}`);
  if (j.stopNights.length !== j.destinationSlugs.length) fail(j.slug, "stopNights must match destinationSlugs");
  if (j.stopNights.reduce((sum, n) => sum + n, 0) !== j.days) fail(j.slug, "stopNights must add up to the days");
  if (j.stopNights.some((n) => n < 1)) fail(j.slug, "every stop needs at least one night");
  if (!imageManifest[j.heroImage.src]) fail(j.slug, `missing image ${j.heroImage.src}`);
}

for (const r of reviews) {
  if (r.rating < 1 || r.rating > 5) fail(r.id, "rating must be between 1 and 5");
  if (r.destinationSlug && !destinationSlugs.has(r.destinationSlug)) {
    fail(r.id, `destination "${r.destinationSlug}" does not exist`);
  }
  if (r.journeySlug && !journeys.some((j) => j.slug === r.journeySlug)) {
    fail(r.id, `journey "${r.journeySlug}" does not exist`);
  }
}

for (const slug of homepageDestinationSlugs) {
  if (!destinationBySlug.has(slug)) fail("homepage", `destination "${slug}" does not exist`);
}

const orphans = destinations.filter(
  (d) =>
    !destinations.some((other) => other.relatedSlugs.includes(d.slug)) &&
    !journeys.some((j) => j.destinationSlugs.includes(d.slug)),
);
for (const d of orphans) fail(d.slug, "nothing links to this destination");

const withoutExperiences = destinations.filter(
  (d) => !experiences.some((e) => e.destinationSlug === d.slug),
);
for (const d of withoutExperiences) fail(d.slug, "has no experiences");

if (problems.length > 0) {
  console.error(`${problems.length} content problem(s):`);
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}

console.log(
  `content ok: ${destinations.length} destinations, ${experiences.length} experiences, ` +
    `${journeys.length} journeys`,
);
