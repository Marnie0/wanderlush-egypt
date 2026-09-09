/**
 * Pushes the content modules into PostgreSQL.
 *
 *   npm run db:migrate   # applies db/schema.sql
 *   npm run db:seed      # upserts every row from content/
 *
 * The content modules stay the single source of truth: this script never
 * invents data, it only mirrors what the app already ships with.
 */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { config } from "dotenv";
import { Pool } from "pg";
import { destinations } from "../content/destinations";
import { experiences } from "../content/experiences";
import { journeys } from "../content/journeys";
import { accommodationLevels } from "../content/accommodation";
import { reviews } from "../content/reviews";
import { faqs, faqCategories } from "../content/faqs";

config({ path: ".env.local" });

const here = dirname(fileURLToPath(import.meta.url));

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set. Add it to .env.local first.");
    process.exit(1);
  }
  return url;
}

async function migrate(pool: Pool) {
  const sql = await readFile(resolve(here, "schema.sql"), "utf8");
  await pool.query(sql);
  console.log("schema applied");
}

async function seed(pool: Pool) {
  const client = await pool.connect();
  try {
    await client.query("begin");

    for (const level of accommodationLevels) {
      await client.query(
        `insert into accommodation_levels
           (id, sort_order, name, summary, description, nightly_from, nightly_to,
            inclusions, example_properties, accent)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         on conflict (id) do update set
           sort_order = excluded.sort_order, name = excluded.name,
           summary = excluded.summary, description = excluded.description,
           nightly_from = excluded.nightly_from, nightly_to = excluded.nightly_to,
           inclusions = excluded.inclusions,
           example_properties = excluded.example_properties, accent = excluded.accent`,
        [
          level.id, level.order, level.name, level.summary, level.description,
          level.nightlyFrom, level.nightlyTo, level.inclusions,
          level.exampleProperties, level.accent,
        ],
      );
    }

    for (const d of destinations) {
      await client.query(
        `insert into destinations
           (slug, id, name, tagline, region, latitude, longitude, travel_styles,
            best_season, best_season_note, recommended_min_days, recommended_max_days,
            nightly_rates, daily_budget_from, intro, hero_image, gallery, attractions,
            suggested_itinerary, local_advice, getting_there, accommodation_note,
            related_slugs, accent, updated_at)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24, now())
         on conflict (slug) do update set
           name = excluded.name, tagline = excluded.tagline, region = excluded.region,
           latitude = excluded.latitude, longitude = excluded.longitude,
           travel_styles = excluded.travel_styles, best_season = excluded.best_season,
           best_season_note = excluded.best_season_note,
           recommended_min_days = excluded.recommended_min_days,
           recommended_max_days = excluded.recommended_max_days,
           nightly_rates = excluded.nightly_rates,
           daily_budget_from = excluded.daily_budget_from, intro = excluded.intro,
           hero_image = excluded.hero_image, gallery = excluded.gallery,
           attractions = excluded.attractions,
           suggested_itinerary = excluded.suggested_itinerary,
           local_advice = excluded.local_advice, getting_there = excluded.getting_there,
           accommodation_note = excluded.accommodation_note,
           related_slugs = excluded.related_slugs, accent = excluded.accent,
           updated_at = now()`,
        [
          d.slug, d.id, d.name, d.tagline, d.region, d.coordinates.lat, d.coordinates.lng,
          d.travelStyles, d.bestSeason, d.bestSeasonNote, d.recommendedDays.min,
          d.recommendedDays.max, d.nightlyRates, d.dailyBudgetFrom, d.intro, d.heroImage,
          JSON.stringify(d.gallery), JSON.stringify(d.attractions),
          JSON.stringify(d.suggestedItinerary), d.localAdvice, d.gettingThere,
          d.accommodationNote, d.relatedSlugs, d.accent,
        ],
      );
    }

    for (const e of experiences) {
      await client.query(
        `insert into experiences
           (slug, id, name, destination_slug, category, travel_styles, environment,
            group_format, family_friendly, duration_minutes, price_from, private_supplement,
            rating, review_count, max_group_size, min_age, summary, description, schedule,
            meeting_point, inclusions, exclusions, what_to_bring, accessibility,
            cancellation, hero_image, gallery, accent, updated_at)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28, now())
         on conflict (slug) do update set
           name = excluded.name, destination_slug = excluded.destination_slug,
           category = excluded.category, travel_styles = excluded.travel_styles,
           environment = excluded.environment, group_format = excluded.group_format,
           family_friendly = excluded.family_friendly,
           duration_minutes = excluded.duration_minutes, price_from = excluded.price_from,
           private_supplement = excluded.private_supplement, rating = excluded.rating,
           review_count = excluded.review_count, max_group_size = excluded.max_group_size,
           min_age = excluded.min_age, summary = excluded.summary,
           description = excluded.description, schedule = excluded.schedule,
           meeting_point = excluded.meeting_point, inclusions = excluded.inclusions,
           exclusions = excluded.exclusions, what_to_bring = excluded.what_to_bring,
           accessibility = excluded.accessibility, cancellation = excluded.cancellation,
           hero_image = excluded.hero_image, gallery = excluded.gallery,
           accent = excluded.accent, updated_at = now()`,
        [
          e.slug, e.id, e.name, e.destinationSlug, e.category, e.travelStyles, e.environment,
          e.groupFormat, e.familyFriendly, e.durationMinutes, e.priceFrom, e.privateSupplement,
          e.rating, e.reviewCount, e.maxGroupSize, e.minAge, e.summary, e.description,
          e.schedule, e.meetingPoint, e.inclusions, e.exclusions, e.whatToBring,
          e.accessibility, e.cancellation, e.heroImage, JSON.stringify(e.gallery), e.accent,
        ],
      );
    }

    for (const j of journeys) {
      await client.query(
        `insert into journeys
           (slug, id, name, tagline, summary, days, destination_slugs, experience_slugs,
            travel_styles, suggested_tier, price_from, best_season_note, hero_image,
            outline, accent, updated_at)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15, now())
         on conflict (slug) do update set
           name = excluded.name, tagline = excluded.tagline, summary = excluded.summary,
           days = excluded.days, destination_slugs = excluded.destination_slugs,
           experience_slugs = excluded.experience_slugs,
           travel_styles = excluded.travel_styles, suggested_tier = excluded.suggested_tier,
           price_from = excluded.price_from, best_season_note = excluded.best_season_note,
           hero_image = excluded.hero_image, outline = excluded.outline,
           accent = excluded.accent, updated_at = now()`,
        [
          j.slug, j.id, j.name, j.tagline, j.summary, j.days, j.destinationSlugs,
          j.experienceSlugs, j.travelStyles, j.suggestedTier, j.priceFrom, j.bestSeasonNote,
          j.heroImage, JSON.stringify(j.outline), j.accent,
        ],
      );
    }

    for (const r of reviews) {
      await client.query(
        `insert into reviews
           (id, author, origin, journey_slug, destination_slug, rating, quote, travelled_on, is_demo)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         on conflict (id) do update set
           author = excluded.author, origin = excluded.origin,
           journey_slug = excluded.journey_slug, destination_slug = excluded.destination_slug,
           rating = excluded.rating, quote = excluded.quote,
           travelled_on = excluded.travelled_on, is_demo = excluded.is_demo`,
        [r.id, r.author, r.origin, r.journeySlug, r.destinationSlug, r.rating, r.quote, r.travelledOn, r.isDemo],
      );
    }

    for (const c of faqCategories) {
      await client.query(
        `insert into faq_categories (id, name) values ($1,$2)
         on conflict (id) do update set name = excluded.name`,
        [c.id, c.name],
      );
    }

    for (const f of faqs) {
      await client.query(
        `insert into faqs (id, category_id, question, answer) values ($1,$2,$3,$4)
         on conflict (id) do update set
           category_id = excluded.category_id, question = excluded.question,
           answer = excluded.answer`,
        [f.id, f.categoryId, f.question, f.answer],
      );
    }

    // Content is the source of truth, so a renamed or removed item must not
    // linger in the database. Children go before parents for the foreign keys.
    const keep = async (table: string, column: string, values: string[]) => {
      await client.query(`delete from ${table} where ${column} <> all($1::text[])`, [values]);
    };
    await keep("faqs", "id", faqs.map((f) => f.id));
    await keep("faq_categories", "id", faqCategories.map((c) => c.id));
    await keep("reviews", "id", reviews.map((r) => r.id));
    await keep("journeys", "slug", journeys.map((j) => j.slug));
    await keep("experiences", "slug", experiences.map((e) => e.slug));
    await keep("destinations", "slug", destinations.map((d) => d.slug));
    await keep("accommodation_levels", "id", accommodationLevels.map((l) => l.id));

    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }

  console.log(
    `seeded ${destinations.length} destinations, ${experiences.length} experiences, ` +
      `${journeys.length} journeys, ${accommodationLevels.length} accommodation levels, ` +
      `${reviews.length} reviews, ${faqs.length} FAQs`,
  );
}

async function main() {
  const pool = new Pool({ connectionString: requireDatabaseUrl(), max: 1 });
  try {
    if (process.argv.includes("--migrate-only")) {
      await migrate(pool);
    } else {
      await migrate(pool);
      await seed(pool);
    }
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
