# English and Arabic

The site is written twice, not translated once. Every visible string lives
in both `src/i18n/locales/en.json` and `src/i18n/locales/ar.json`, every
piece of content in `content/*.ts` carries `{ en, ar }`, and the Arabic side
is judged by one test: would an Egyptian travel editor have written it this
way?

## How a language is chosen

`src/i18n/index.ts`. English ships in the main bundle; Arabic is a chunk of
its own, fetched before the first paint for an Arabic visitor and on the
first switch for anyone else. Detection order: `?lng=` in the URL (so a
language can be linked to), then `localStorage` (`wanderlush.language`),
then the browser. The document gets `lang` and `dir`, so portals, dialogs,
scrollbars and the print stylesheet all follow.

## What the browser downloads

English strings ship in the main bundle. Arabic is two chunks fetched
together before the first paint for an Arabic visitor, and on the first
switch for anyone else: the locale file, and the Arabic side of the content.
`content/*.ts` is still written once, with `{ en, ar }` pairs, and the seed
script and the API read it as written. For the browser,
`scripts/vite-content-split.ts` rewrites each pair into a call that keeps
the English string inline and reads the Arabic one from a table emitted as
`virtual:content-ar`; `content/ar-text.ts` loads that table. An English
visitor never downloads a word of Arabic, and a pair read before its table
arrives answers in English rather than with nothing. The table and the
calls index the pairs in source order from the same walk, so they cannot
drift.

## Locale files

One namespace, grouped by page or feature (`home`, `explore`, `builder`,
`estimate`, `booking`), with shared vocabulary under `common`, `months`,
`tiers`, `categories`. `node scripts/check-locales.mjs` fails the build of
anyone's confidence if a key exists in one file only, an Arabic plural family
is missing a category, an Arabic string uses a placeholder English never
passes, or an Arabic value is still English.

### Plurals

English has `_one` and `_other`. Arabic has all six CLDR categories, and the
file carries every one of them for every counted phrase:

| Category | Count | Example |
| --- | --- | --- |
| zero | 0 | بلا أيام |
| one | 1 | يوم واحد |
| two | 2 | يومان |
| few | 3–10 | 5 أيام |
| many | 11–99 | 12 يومًا |
| other | 100+ | 100 يوم |

A number can only govern the noun that follows it, so a sentence with two
counts in it ("about 9 hours", "runs to 9 days but the trip is 7") is built
from phrased parts: `TripWarnings` turns the numbers into `common.hours` and
`common.days` strings first and hands the string to the sentence. The same
rule is why `formatDayRange` has its own string: "3–5 days" cannot be made
from the dual.

### Writing rules for Arabic

- Modern Standard Arabic, warm rather than formal. The reader is أنت,
  masculine singular, throughout.
- Digits are Western (`ar-EG-u-nu-latn`): prices, dates and counts stay
  legible to every Arabic reader and match Egyptian usage. Small counts
  inside prose are words ("ثلاث ليالٍ").
- Diacritics only where a word would otherwise be misread (ابنِ، خطِّط،
  مخطِّط، متميّز).
- Terms are fixed: travel specialist = مستشار السفر; trip builder = مخطِّط
  الرحلة; estimate = التقدير; quotation = عرض السعر; itinerary = البرنامج
  اليومي; transfer = انتقال; the four stay levels are أساسي، مريح، متميّز،
  فاخر with no article, and a sentence quotes them: «مريح».
- No calques. "Updates" is يتغيّر, not يتحدّث; a detour is محطة عابرة;
  "not yet confirmed" is بانتظار تأكيدك. The English is the brief, not the
  sentence.
- Lists in a sentence are joined with the Arabic comma (`common.listSeparator`
  is "، ").

## Numbers, dates and money

`src/lib/format.ts`. Dates are `Intl.DateTimeFormat` in `en-GB` or `ar-EG`,
parsed as local dates so a start date never slips a day west of Greenwich.
Money is `Intl.NumberFormat` for placement, grouping and digits, with the
symbol swapped for the one in `content/currencies.ts` (so Arabic shows
"ج.م" rather than the "E£" the locale falls back to, and neither language
shows "US$"). Percentages, ratings and plain counts go through the same
locale tag. Ranges use the en dash; Arabic keeps the same dash.

## Right to left

Layout uses logical properties (`ms-`, `pe-`, `text-start`, `border-s`), so
nothing is mirrored by hand. The things that need a decision:

- Arrows that mean "onwards" rotate (`rtl:rotate-180`) and their hover nudge
  flips. Chevrons that mean "open" do not.
- The filter drawer and the phone menu slide in from the end edge.
- In the gallery the next picture sits to the left in Arabic, and the arrow
  keys follow the pictures, not the labels.
- Hero and rule gradients run from the start edge.
- Not mirrored: the map of Egypt, phone numbers, email addresses and booking
  references (`dir="ltr"` on the value), and numerals, which are always
  left-to-right inside Arabic text. A number that would otherwise be pulled
  apart by neighbouring punctuation is wrapped in isolates (`⁦…⁩`).

## Typography

Arabic swaps the whole type system: Amiri for headings, IBM Plex Sans Arabic
for everything else, including the Latin words inside Arabic text. Leading
is higher than the Latin scale (1.9 for body, 1.28–1.4 for display sizes),
and every letter-spacing utility is zeroed under `[dir="rtl"]`, because
tracking pulls a connected script apart. Uppercase labels become plain.
Fonts are self-hosted and subset by script, and the family utilities follow
the swap under `[dir="rtl"]`, so an English visitor never downloads the
Arabic faces and an Arabic page never fetches Fraunces for a price or Inter
for a map label.

## Testing

- `node scripts/check-locales.mjs` for the files.
- `node scripts/check-pages.mjs <url>` loads every route in both languages
  and viewports and reports console errors, overflow, missing headings and
  broken links. The Arabic routes run last because the detector caches the
  choice.
- The Phase 8 end-to-end run walks discovery, planning, pricing and booking
  in Arabic against the real API, scans each page for Latin words that are
  not names, and screenshots every step for a visual RTL check.
