# Case study: Wanderlush Egypt

A bilingual travel discovery and trip-building site for a fictional premium
Egyptian travel company, built from a ten-phase brief as a portfolio piece.
This is the story of the decisions, not the feature list; the README has that.

**Live site:** https://wanderlush-egypt.vercel.app

## The brief

A premium travel brand wants a site that does more than list tours. Visitors
should be able to explore Egypt, understand what a trip would involve, build
one themselves day by day, see an honest price before anyone is contacted, and
send a request that a specialist can act on. It has to work as well in Arabic
as in English, on a phone as on a laptop, and it has to feel like a considered
travel brand rather than a booking engine.

The stack was fixed: React with TypeScript, Node, PostgreSQL, Vercel, GitHub.
The delivery was phased, with a review at the end of each phase before the
next began.

## What was built

Ten destinations, twenty-seven experiences and six curated journeys, each
described in both languages with photography, seasons, prices and practical
notes. An interactive map of Egypt, drawn in SVG so it needs no key and can be
coloured to match the site. A trip builder in five steps that share one data
model. An estimate that explains every line. A booking request with a
reference and a lookup. A PDF of the whole trip. Arabic written natively.

## The decisions that shaped it

### Content first, one source of truth

Everything the site says about a place or an experience lives in
`content/*.ts`, written once with `{ en, ar }` pairs and a validated shape. The
seed script fills PostgreSQL from it, the API reads from it, the pages import
it, and a checker resolves every slug, link and image on every run. There is
no CMS to keep in step and no duplicated copy to drift.

The cost of that choice was bundle weight: every English visitor would have
downloaded all the Arabic prose. A small Vite plugin now rewrites each pair at
build time, keeping the English string inline and reading the Arabic one from
a chunk that only Arabic visitors fetch. The content files stay as they are
written.

### The trip is the itinerary

Early sketches had the builder hold destinations, nights and experiences as
separate lists, with the day-by-day view derived from them. That would have
meant two sources of truth and a class of bugs where the setup steps and the
editor disagree. Instead the day list is the only state: choosing a place
appends days, setting nights adds or removes them, adding an experience puts it
on the emptiest day in that place, and the estimate is a pure function of the
list. The setup steps are views of the itinerary, not inputs to it.

### A price that says how it was worked out

Travel sites tend to hide the arithmetic. Here every total comes with its
parts: nights at the chosen level for each place on the route, experiences per
traveller with children at half and free where a minimum age rules them out,
the quickest transfer between each pair of places, and a planning fee on
everything but the hotel. The rules are written on the page and in
`docs/pricing.md`, the same rules the code applies. Warnings appear while the
trip is being built rather than after it is sent: an overloaded day, a repeated
experience, a journey of ten hours with activities planned on top of it, and
each one names the day and says what to do.

The number itself moves. When a change alters the price, the figure travels to
its new value over a moment and warms in colour, so the effect of the change
is seen without comparing two numbers.

### Arabic written, not translated

The Arabic side was treated as a second authored version. Every one of the
seven hundred interface strings and the content was written to read as an
Egyptian travel editor would write it: Modern Standard Arabic with a warm
register, fixed terms for the site's own concepts, no calques. Arabic's six
plural categories are all present, and sentences with two counts in them are
built from phrased parts so each number governs its own noun. Digits are
Western, as Egyptian readers expect. The typefaces change with the language,
the layout mirrors through logical CSS properties rather than a second
stylesheet, and the things that must not mirror (the map, phone numbers,
references) are marked as such. A checker keeps the two locale files in step.

### Motion where it means something

The brief asked for a memorable presentation without animating everything.
The site has a short vocabulary of durations and easings and a handful of
signature sequences: the hero settling, the selected map marker breathing and
the route drawing itself, the tick landing on "Add to trip", the step row
filling, an activity dropping into a day, the price travelling, the
confirmation's tick drawing. Everything else is a fade or a colour change,
everything is transform or opacity, and the whole of it snaps under the
system's reduced-motion preference.

### The trip on paper

A printable itinerary was on the enhancement list. Rather than a print
stylesheet alone, the summary and the confirmation produce a real PDF in the
browser: A4, the site's typefaces embedded, the route drawn on the same map,
every day, the estimate explained, page numbers. Arabic runs right to left at
the paragraph level with the rows mirrored. The renderer is the largest thing
the site can load, so it is fetched on the first click and never before.

### Nothing personal until it is sent

The trip, the shortlist and the booking draft live in the visitor's browser.
Nothing reaches the database until a request is sent, and what is sent is a
snapshot rather than the live state, so the confirmation always shows exactly
what went. The API rate-limits by connection, rejects anything shaped like a
script's submission, and answers a reference lookup with the trip and the
estimate but never the contact details. Those stay in the browser that sent
them, and the visitor can forget them with one click.

## Testing it

The site is checked by scripts rather than by hand. One walks every route at
two widths in both languages and reports console noise, failed requests,
missing headings, overflow and broken links. One loads twelve routes at five
widths in both languages with screenshots. One walks the whole product the way
a visitor would, in headless Chrome against a build with the API: search, the
map, filters and sorting, the guide and gallery, every builder step, the
estimate controls, a booking request through to a real confirmation and its
lookup, the language switch, what survives a reload, and a silent console.
Eighty-three checks, all passing. Lighthouse on production in both languages
scores 100 for accessibility, best practices and SEO on every page type.

## What it taught

- **Bidirectional text is a layout problem, not a translation problem.** The
  bugs were never in the words: they were phone digits reversed by the bidi
  algorithm, a full stop landing at the wrong end of a PDF line, a percent
  sign wandering. Each one needed the right isolation or direction mark in
  the right place, and a test in Arabic to catch it.
- **A rule that cannot be satisfied is a bug.** A long-transfer warning that
  told the reader to keep free a day that already was cost a real visitor
  their patience. The fix was in the rule and in the sentence, and in showing
  the reason (the journey) inside the day it landed on.
- **Measure before optimising.** A fade that made every page arrive
  gracefully also held the page at opacity zero until the animation began,
  and cost a second of measured first paint. Lighthouse caught it; the first
  render now paints at once and only navigations fade.
- **Write the check, then fix the bug.** Every bug found in review became a
  line in a script before it was fixed, so it stays fixed.

## What would come next

A shareable trip link, so a plan can be sent to whoever is travelling with
you before it is requested. Recently viewed destinations. Real availability
behind the estimate, and a specialist's side of the booking request.
