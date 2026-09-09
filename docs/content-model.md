# Content model

`content/` is the single source of truth. The React app imports it directly,
and `db/seed.ts` mirrors it into PostgreSQL. Nothing else writes content.

```
content/
  types.ts          shared types, including Localized { en, ar }
  destinations.ts   8 destinations with full guides
  experiences.ts    24 bookable experiences
  journeys.ts       6 curated routes
  accommodation.ts  4 levels with nightly rates
  reviews.ts        10 fictional testimonials, all flagged isDemo
  faqs.ts           12 questions in 4 categories
  currencies.ts     6 currencies with static indicative rates
  brand.ts          purpose, story, values, privacy copy
```

## Localisation rule

Every visible string is `{ en, ar }`. There is no English fallback path in the
UI: if a field exists, both languages exist. Read it with `pick(value, language)`
from `src/lib/format.ts`.

## Database mapping

Localised fields are stored as `jsonb`. Filterable scalars (region, category,
price, duration) are real columns with indexes. See `db/schema.sql`.

Run `npm run db:migrate` to apply the schema and `npm run db:seed` to upsert
every row. Both are idempotent.

## Images

Content references `/images/...` paths. Files are dropped into `public/images/`
using the exact names in the content modules. Until a file exists, `SmartImage`
renders a warm gradient built from that item's `accent`, so nothing collapses
and layout can be judged without photography.

## Prices

All figures are USD and are estimates. `formatMoney()` converts with the static
rates in `currencies.ts`. Live foreign exchange is deliberately out of scope.
