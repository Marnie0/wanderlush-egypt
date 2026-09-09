# Wanderlush Egypt

An immersive, bilingual travel discovery and itinerary-building experience for a
fictional premium Egyptian travel company. Visitors explore destinations, choose
curated experiences, build a day-by-day journey, watch a transparent estimate
update as they go, and submit a booking request. English LTR and Arabic RTL are
both first-class.

> Portfolio project. Every destination, experience, price and testimonial on the
> site is demonstration content.

## Stack

| Layer | Choice |
| --- | --- |
| Frontend | React 19 + TypeScript, Vite |
| Styling | Tailwind CSS v4, CSS-first design tokens |
| Motion | Framer Motion |
| Routing | React Router |
| i18n | i18next with English and Arabic locale files |
| Backend | Node.js serverless functions on Vercel |
| Database | PostgreSQL on Neon |
| Hosting | Vercel |

## Running locally

```bash
npm install
cp .env.example .env.local     # then paste your Neon connection string
npm run dev
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Type-check then production build |
| `npm run preview` | Serve the production build |
| `npm run typecheck` | `tsc -b` across app, API and content |
| `npm run db:migrate` | Apply `db/schema.sql` |
| `npm run db:seed` | Upsert every row from `content/` |

## Layout

```
api/          Vercel serverless functions (Node)
content/      All demo content, the single source of truth
db/           Schema, pooled client, seed script
docs/         Brand guide, design system, content model
src/
  components/ layout shell and reusable UI
  i18n/       i18next setup and en/ar locale files
  lib/        formatting, motion vocabulary, class merging
  routes/     one file per route plus the router
  styles/     design tokens and base styles
```

## Documentation

- [Brand and message guide](docs/brand-guide.md)
- [Design system](docs/design-system.md)
- [Content model](docs/content-model.md)
- [Photography](public/images/README.md)

## Build phases

The project is delivered in ten phases. Phase 1 covers the brand, the design
system, the route table, the localisation foundation, the demo content and the
first production deployment. Later phases add the cinematic homepage, the
destination explorer and map, the experiences marketplace, the trip builder,
the price estimator, the booking request, the full Arabic pass, motion polish
and final QA.
