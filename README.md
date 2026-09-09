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

Requires Node 22 or newer.

```bash
npm install
cp .env.example .env.local     # then paste your Neon connection string
npm run dev                    # the React app, with content bundled in
npx vercel dev                 # the app plus the /api functions against Neon
```

`npm run dev` serves the frontend only; the pages read their content from the
bundled modules, so nothing on the site needs the database to render. The
serverless functions under `api/` run with `vercel dev`, which reads
`.env.local` for `DATABASE_URL`.

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Type-check then production build |
| `npm run preview` | Serve the production build |
| `npm run typecheck` | `tsc -b` across app, API and content |
| `npm run check:content` | Resolve every content slug, link and image |
| `npm run check:pages` | Load every route at desktop and phone widths, in both languages, and report console errors, failed requests, missing headings and overflow. Needs `npm run preview` running on port 4173 and a `google-chrome` binary |
| `npm run db:migrate` | Apply `db/schema.sql` |
| `npm run db:seed` | Upsert every row from `content/` |
| `node scripts/images/build.mjs` | Rebuild responsive photography, its manifest and the credits file from `scripts/images/sources.json` |
| `npm run fonts` | Regenerate the size-adjusted font fallbacks in `src/styles/font-fallbacks.css` |
| `npm run sitemap` | Regenerate `public/sitemap.xml` (also runs inside `npm run build`) |
| `node scripts/screenshot.mjs <url> <out.png>` | Screenshot a page, optionally scrolled to a section |

## Layout

```
api/          Vercel serverless functions (Node)
content/      All demo content, the single source of truth
db/           Schema, pooled client, row mappers, seed script
docs/         Brand guide, design system, content model
public/
  images/     Rendered photography (generated, committed) and its credits
scripts/      Content and page checkers, image pipeline, sitemap, fonts
src/
  components/ layout shell, homepage sections, explorer and marketplace UI
  generated/  Image manifest written by the image pipeline (committed)
  hooks/      page metadata, reading direction
  i18n/       i18next setup and en/ar locale files
  lib/        formatting, filters, stores, motion vocabulary, class merging
  routes/     one file per route plus the router
  styles/     design tokens, base styles and the generated font fallbacks
```

## Documentation

- [Brand and message guide](docs/brand-guide.md)
- [Design system](docs/design-system.md)
- [Content model](docs/content-model.md)
- [Photography](public/images/README.md)
- [Photo credits](public/images/CREDITS.md)

## Build phases

The project is delivered in ten phases. Phase 1 covers the brand, the design
system, the route table, the localisation foundation, the demo content and the
first production deployment. Later phases add the cinematic homepage, the
destination explorer and map, the experiences marketplace, the trip builder,
the price estimator, the booking request, the full Arabic pass, motion polish
and final QA.
