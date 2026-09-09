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
import { accommodationById } from "../content/accommodation.ts";
import { reviews } from "../content/reviews.ts";
import { imageManifest } from "../src/generated/images.ts";

const problems = [];
const fail = (where, message) => problems.push(`${where}: ${message}`);

const destinationSlugs = new Set(destinations.map((d) => d.slug));
const experienceSlugs = new Set(experiences.map((e) => e.slug));

for (const d of destinations) {
  for (const related of d.relatedSlugs) {
    if (!destinationSlugs.has(related)) fail(d.slug, `related destination "${related}" does not exist`);
    if (related === d.slug) fail(d.slug, "lists itself as related");
  }
  for (const image of [d.heroImage, ...d.gallery]) {
    if (!imageManifest[image.src]) fail(d.slug, `missing image ${image.src}`);
  }
  if (d.recommendedDays.min > d.recommendedDays.max) fail(d.slug, "recommended days are inverted");
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
  if (!imageManifest[j.heroImage.src]) fail(j.slug, `missing image ${j.heroImage.src}`);
}

for (const r of reviews) {
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
