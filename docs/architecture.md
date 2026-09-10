# Architecture

Five views of the site as it is built, drawn from the code and the live
database rather than from the brief. Every diagram is Mermaid, so GitHub
renders it in place. Where the code does not have the shape a diagram
usually assumes, the caption says so.

Read alongside `docs/pricing.md` (the estimate rules), `docs/booking.md`
(the request) and `docs/content-model.md` (what a destination or experience
carries).

## 1. Entity-relationship diagram

Eight tables in one Neon PostgreSQL database, verified against
`information_schema` on 10 September 2026. Localised text is stored as
`jsonb` of the shape `{"en": …, "ar": …}`; every filterable field is a real
column.

```mermaid
erDiagram
  destinations {
    text slug PK
    text id UK
    jsonb name "en and ar"
    jsonb tagline
    text region "btree index"
    numeric latitude "precision 9, scale 6"
    numeric longitude "precision 9, scale 6"
    text[] travel_styles "GIN index"
    text[] best_season "month keys"
    jsonb best_season_note
    smallint recommended_min_days
    smallint recommended_max_days
    jsonb nightly_rates "USD per room per night, one key per tier"
    integer daily_budget_from "USD per person per day"
    jsonb intro
    jsonb hero_image
    jsonb gallery "array of image refs"
    jsonb attractions
    jsonb suggested_itinerary
    jsonb local_advice
    jsonb getting_there
    jsonb accommodation_note
    text[] related_slugs "slugs of destinations, no FK"
    text accent
    timestamptz updated_at "default now()"
  }
  experiences {
    text slug PK
    text id UK
    jsonb name
    text destination_slug FK "btree index"
    text category "btree index"
    text[] travel_styles
    text environment
    text[] group_format "private and or shared"
    boolean family_friendly "default true"
    integer duration_minutes
    integer price_from "USD per adult, shared departure; btree index"
    integer private_supplement "USD per person, default 0"
    numeric rating "precision 2, scale 1"
    integer review_count "default 0"
    integer max_group_size
    smallint min_age "nullable"
    jsonb summary
    jsonb description
    jsonb schedule
    jsonb meeting_point
    jsonb inclusions
    jsonb exclusions
    jsonb what_to_bring
    jsonb accessibility
    jsonb cancellation
    jsonb hero_image
    jsonb gallery
    text accent
    timestamptz updated_at
  }
  accommodation_levels {
    text id PK "essential, comfort, premium, luxury"
    smallint sort_order
    jsonb name
    jsonb summary
    jsonb description
    integer nightly_from "USD"
    integer nightly_to "USD"
    jsonb inclusions
    jsonb example_properties
    text accent
  }
  journeys {
    text slug PK
    text id UK
    jsonb name
    jsonb tagline
    jsonb summary
    smallint days
    text[] destination_slugs "ordered stops, no FK"
    jsonb stop_nights "nights per stop, same order"
    text[] experience_slugs "no FK"
    text[] travel_styles
    text suggested_tier FK
    integer price_from "USD"
    jsonb best_season_note
    jsonb hero_image
    jsonb outline
    text accent
    timestamptz updated_at
  }
  reviews {
    text id PK
    jsonb author
    jsonb origin
    text journey_slug FK "nullable, btree index"
    text destination_slug FK "nullable, btree index"
    smallint rating "check between 1 and 5"
    jsonb quote
    text travelled_on
    boolean is_demo "default true"
  }
  faq_categories {
    text id PK
    jsonb name
  }
  faqs {
    text id PK
    text category_id FK "btree index"
    jsonb question
    jsonb answer
  }
  booking_requests {
    text reference PK "WL-XXXX-XXXX"
    timestamptz created_at "default now(); btree index desc"
    text language "en or ar"
    text full_name
    text email
    text phone "nullable"
    text country "nullable, ISO 3166-1 alpha-2"
    text preferred_contact "nullable"
    smallint travellers_adults "default 2"
    smallint travellers_children "default 0"
    date start_date "nullable"
    date end_date "nullable, derived on insert"
    text accommodation_tier FK "nullable"
    text currency "default USD"
    numeric estimate_total_usd "precision 10, scale 2"
    jsonb itinerary "RequestTrip snapshot"
    jsonb preferences "Preferences snapshot"
    jsonb estimate "RequestEstimate snapshot, USD"
    text tour_style "shared or private"
    boolean service_included "default true"
    text status "default new, never updated"
  }

  destinations ||--o{ experiences : "destination_slug, on delete cascade"
  accommodation_levels ||--o{ journeys : "suggested_tier"
  accommodation_levels |o--o{ booking_requests : "accommodation_tier"
  journeys |o--o{ reviews : "journey_slug, on delete set null"
  destinations |o--o{ reviews : "destination_slug, on delete set null"
  faq_categories ||--o{ faqs : "category_id, on delete cascade"
  journeys }o..o{ destinations : "destination_slugs array, no FK"
  journeys }o..o{ experiences : "experience_slugs array, no FK"
  destinations }o..o{ destinations : "related_slugs array, no FK"
  booking_requests }o..o{ destinations : "itinerary jsonb, one slug per day, no FK"
  booking_requests }o..o{ experiences : "itinerary jsonb, slugs per day, no FK"
```

**What it shows.** Solid lines are real foreign keys; dotted lines are
relationships the application maintains without one. The catalogue tables
(`destinations`, `experiences`, `journeys`, `accommodation_levels`,
`reviews`, `faq_categories`, `faqs`) are a mirror of the TypeScript content
modules in `content/`, pushed by `db/seed.ts`, which upserts every row and
then deletes any row whose key is no longer in the content. The one table
the site writes to at runtime is `booking_requests`.

**Non-obvious choices.**

- **Slugs are the primary keys**, not the `id` columns. Every URL, every
  content lookup and every reference inside a trip uses the slug, so the
  key is the thing the rest of the system already holds. The `id` column is
  kept unique for the content model's sake.
- **A journey's stops are an array, not a join table.** A journey is an
  ordered list of places with nights per stop (`destination_slugs` and
  `stop_nights` are parallel arrays), and the same place can appear twice
  (Cairo first and last). A join table would need a position column and
  would still not enforce anything useful, because the content is authored
  in one place and validated there.
- **A booking request stores a snapshot, not references.** The `itinerary`
  column holds the days as sent (place, experience slugs, notes) and
  `estimate` holds the USD breakdown the traveller saw. Both are frozen on
  purpose: a price change in the content must not rewrite what someone was
  quoted. That is why there is no foreign key from a request to a place or
  an experience.
- **The only foreign key out of `booking_requests`** is the stay tier, and
  the API treats a violation there as a seeding fault, not a bad request,
  when the tier is one the content knows.
- **Indexes** exist for the filters the API exposes: region and travel
  styles on destinations (the styles index is GIN, for array containment),
  destination, category and price on experiences, and `created_at desc` on
  requests for a specialist's inbox.
- **`status` is a column without a lifecycle.** Every row is `new`; nothing
  in the code updates it. It is there so a back office could.

## 2. Component and module diagram

### 2a. Frontend

```mermaid
%%{init: {"flowchart": {"nodeSpacing": 25, "rankSpacing": 40}}}%%
flowchart TB
  Main["main.tsx\nRouterProvider · LazyMotion · waits for i18n"] --> Root["RootLayout\nHeader · Outlet · Footer · Toast · ScrollRestoration"]
  Root --> Header["Header\ntrip badge from useTripCount"]
  Root --> explore
  Root --> builder
  Root --> request

  subgraph explore["Destination explorer"]
    direction TB
    DP["DestinationsPage\nfilters live in the URL"] --> DF["DestinationFilters · ActiveFilters\nDrawer on phones"]
    DP --> Map["EgyptMap\nSVG, markers are buttons"]
    DP --> Spot["DestinationSpotlight"]
    DP --> DCard["DestinationCard"]
    DCard --> ATB["AddToTripButton\ntoggle, tick, toast"]
    DDP["DestinationDetailPage"] --> ATB
  end

  subgraph builder["Trip builder"]
    direction TB
    TBP["TripBuilderPage\nstep in ?step= · estimate and warnings by useMemo"] --> Stepper["Stepper"]
    TBP --> Steps["StepBasics · StepPlaces · StepStay · StepExperiences"]
    TBP --> SI["StepItinerary\nDndContext · DayCard · ItemRow"]
    TBP --> TS["TripSummary\nsticky aside, phone bar"]
    TS --> CB["CostBreakdown\nCostLines · CostTotal · LiveMoney · EstimateControls"]
    TS --> CN["ConfirmNotice"]
    TS --> TW["TripWarnings"]
    SI --> TW
    Steps --> Map2["EgyptMap\nwith the route drawn"]
  end

  subgraph request["Estimate and booking"]
    direction TB
    TSP["TripSummaryPage\nfull breakdown"] --> CB2["CostBreakdown · EstimateControls"]
    TSP --> PDF["DownloadPdfButton\nlazy: pdf/download · pdf/TripDocument · @react-pdf/renderer"]
    BP["BookingPage\nreview · details · preferences · send"] --> TR["TripReview\nrenders the snapshot, not the store"]
    BCP["BookingConfirmationPage"] --> TR
    BCP --> PDF
  end

  subgraph stores["Shared state: Zustand, persisted to localStorage"]
    direction LR
    TStore[("trip-store\nwanderlush.trip")]
    BStore[("booking-store\nwanderlush.booking")]
    Toast[("toast-store")]
  end

  subgraph logic["Pure functions in src/lib and shared/"]
    direction LR
    Plan["trip-plan\nstopsFromDays · pickDayFor · tripWarnings"]
    Est["estimate\nestimateTrip · coveredNights"]
    Trans["transport\nfindRoute · routeModes"]
    Req["booking-request · shared/booking\nsnapshotTrip · validateDetails · parsePayload"]
  end

  Content["content/*.ts\ndestinations · experiences · journeys · accommodation · transport"]

  Header -. reads .-> TStore
  ATB -. toggles .-> TStore
  ATB -. shows .-> Toast
  builder -. reads and writes .-> TStore
  request -. reads the trip .-> TStore
  request -. draft and sent record .-> BStore
  builder -- "estimateTrip, tripWarnings" --> logic
  request -- "estimateTrip, tripWarnings, snapshots" --> logic
  Est --> Trans
  Plan --> Trans
  logic --> Content
  TStore --> Content
```

**What it shows.** Solid arrows are rendering (parent to child) or a plain
import of a function; dotted arrows are store subscriptions. The pages that
show a price (`TripBuilderPage`, `TripSummaryPage`, `BookingPage`) each
call the same two pure functions with the same inputs from the trip store:
`estimateTrip` for the money and `tripWarnings` for the problems. Neither
result is stored anywhere. They are recomputed by `useMemo` whenever the
trip changes, so there is exactly one source of truth (the store) and no
way for the sidebar, the phone bar and the booking review to disagree.

**Non-obvious choices.**

- **The itinerary is the trip.** The store holds `days[]`, each with a
  destination slug and a list of items. Places, nights per stop and chosen
  experiences are all derived from that list (`stopsFromDays`,
  `experienceSlugsInDays`), so the places step, the stay step and the
  itinerary editor are three views of one array rather than three lists
  that have to be reconciled.
- **Cards subscribe to one slug.** `AddToTripButton` uses selectors such as
  `useHasDestination(slug)`, so adding a place re-renders that button and
  the header badge, not every card on the page.
- **`TripReview` takes the snapshot**, the same `RequestTrip` object that is
  sent to the server, so the review on the form, the confirmation page and
  the PDF all show what was actually sent.
- **The PDF is a separate React tree.** `trip-pdf.ts` flattens the trip into
  plain strings first, because the document renders outside the app's
  providers and cannot translate or format anything itself. The renderer
  and the document are fetched only on the first click.
- **Nothing here is a class.** Components are functions, stores are Zustand
  hooks, logic modules export functions.

### 2b. Backend modules

```mermaid
%%{init: {"flowchart": {"nodeSpacing": 25, "rankSpacing": 50}}}%%
flowchart LR
  subgraph fn["Vercel serverless functions (api/*.ts, one default export each)"]
    R["requests.ts\nPOST: validate, insert, return reference\nGET ?ref=: read one request, no contact details"]
    D["destinations.ts\nGET all, or ?slug="]
    E["experiences.ts\nGET all, ?slug=, ?destination=, ?category="]
    H["health.ts\nGET: select now()"]
  end
  subgraph db["db/"]
    Client["client.ts\ngetPool (one pg Pool per container, max 3)\nquery(text, params)"]
    Rows["rows.ts\nrowToDestination · rowToExperience"]
    Seed["seed.ts (command line only)\n--migrate-only applies schema.sql\notherwise upserts content and prunes"]
    Schema["schema.sql"]
  end
  Shared["shared/booking.ts\nparsePayload · validateDetails · makeReference · isReference"]
  Content["content/*.ts\ncountries · currencies · accommodation"]
  PG[("Neon PostgreSQL")]

  R --> Shared
  R --> Content
  R --> Client
  D --> Client
  D --> Rows
  E --> Client
  E --> Rows
  H --> Client
  Client -- "TLS, certificate verified" --> PG
  Seed --> Schema
  Seed --> Content
  Seed --> PG
```

**What it shows.** There is no service layer, no repository, no ORM and no
classes on the server. Each route is one file exporting one handler that
runs SQL through a shared `query` function. The only logic that is more
than a query is in `shared/booking.ts`, and it is shared with the browser
so that a request which passed the form also passes the API. **Two of the
four routes are unused by the site**: `/api/destinations` and
`/api/experiences` are live and answer from the database, but the React app
reads the same content from the bundled modules and never calls them. They
exist so the catalogue can be served from the database when a phase needs
it, and the end-to-end suite checks them.

## 3. System architecture

```mermaid
%%{init: {"flowchart": {"nodeSpacing": 25, "rankSpacing": 50}}}%%
flowchart LR
  subgraph browser["Visitor's browser"]
    SPA["React 19 single-page app\nReact Router 7 · i18next · Zustand · Framer Motion"]
    LS[("localStorage\nwanderlush.trip · wanderlush.booking · wanderlush.language")]
    PDFR["@react-pdf/renderer\nPDF built in the browser, fonts from /fonts/pdf"]
  end

  subgraph vercel["Vercel (one project, deploys from main)"]
    CDN["Static files and CDN\ndist/ · images · self-hosted fonts\nrewrite: everything not /api/ serves index.html\nimmutable cache headers on assets and images"]
    FN["Serverless functions, Node\n/api/requests · /api/destinations · /api/experiences · /api/health"]
  end

  subgraph neon["Neon"]
    PG[("PostgreSQL\n8 tables · DATABASE_URL")]
  end

  GH["GitHub\nMarnie0/wanderlush-egypt"]
  DEV["Developer machine\nnpm run build · db/seed.ts · QA scripts"]

  SPA -- "HTTPS GET\nHTML, JS chunks, CSS, WebP images, WOFF2 fonts" --> CDN
  SPA -- "HTTPS, JSON\nPOST /api/requests\nGET /api/requests?ref=" --> FN
  SPA <-- "synchronous read and write" --> LS
  SPA -- "dynamic import on first click" --> PDFR
  FN -- "PostgreSQL wire protocol over TLS\npg Pool, max 3 connections, certificate verified" --> PG
  DEV -- "git push, SSH" --> GH
  GH -- "push to main triggers build and deploy" --> vercel
  DEV -- "tsx db/seed.ts, TLS\nreads .env.local" --> PG
```

**What it shows.** Three hosted parts and one repository. The browser does
almost all of the work: content, search, filtering, the map, the trip, the
estimate, the warnings and the PDF are all computed on the client from the
bundled content modules. The server is reached twice in a whole visit at
most, both times for a booking request. Vercel serves the static build and
runs the four API files as functions from the same deployment. Neon holds
the database, reached only from those functions and from the seed script.

**Third-party services that are not there.**

- **No email provider.** A booking request is stored, and the traveller is
  shown a reference on a confirmation page. Nothing is sent to anyone.
  `docs/booking.md` records this as a deliberate limit of the demo.
- **No map tiles.** The map is an SVG drawn from `src/lib/egypt-geo.ts`.
- **No font or analytics CDN at runtime.** Fonts are self-hosted from
  `@fontsource` packages, subset by script. Google Fonts was used once, at
  build time, to fetch the static instances used inside the PDF.
- **No authentication and no back office.** The `status` column exists
  for one, but nothing reads or writes it.

**Environment.** One secret, `DATABASE_URL`, set in Vercel and in
`.env.local`. The pool strips `sslmode` from the string and sets its own
TLS options so the certificate is always verified. Rate limiting on
`/api/requests` is an in-memory map per function container (eight requests
per address per ten minutes), which the code itself describes as a brake
rather than a defence.

## 4. Sequence diagrams

### 4a. Selecting a destination and adding it to the trip

```mermaid
%%{init: {"sequence": {"wrap": true, "width": 190, "messageMargin": 45}}}%%
sequenceDiagram
  autonumber
  actor V as Visitor
  participant DP as DestinationsPage
  participant Map as EgyptMap
  participant Card as DestinationCard
  participant Btn as AddToTripButton
  participant Store as trip-store (Zustand)
  participant LS as localStorage
  participant Hdr as Header badge
  participant Toast as Toast

  V->>DP: open /destinations?region=…&style=…
  DP->>DP: filtersFromParams(searchParams)
  DP->>DP: filterDestinations(content, filters) via useMemo
  DP->>Map: destinations, activeSlug
  DP->>Card: one card per result
  V->>Map: click or hover a marker
  Map-->>DP: onSelect(slug)
  DP->>DP: setActiveSlug → DestinationSpotlight shows it
  V->>Btn: click "Add to trip" on the card or the guide page
  Btn->>Store: toggleDestination(slug)
  Store->>Store: not in days? addDestination(slug)
  Store->>Store: withDestination: makeDays(slug, recommendedDays.min) appended
  Store->>LS: persist partialised state under wanderlush.trip
  Store-->>Btn: useHasDestination(slug) → true, tick pops in
  Store-->>Hdr: useTripCount() → stops + experiences
  Btn->>Toast: show("Added Aswan", action: open trip builder)
  V->>Toast: "Open trip builder" → /trip-builder
```

**What it shows.** Adding a place is a synchronous store update in the
browser; no request leaves the page. The place arrives as a run of days at
its shortest recommended stay, inserted after any existing days for the same
place or at the end of the route, and everything else the visitor sees (the
tick on the button, the badge in the header, the toast) is a subscription to
that one write. The same click on an already-added place removes every day
for it.

### 4b. Building and editing the day-by-day itinerary

```mermaid
%%{init: {"sequence": {"wrap": true, "width": 190, "messageMargin": 45}}}%%
sequenceDiagram
  autonumber
  actor V as Visitor
  participant TBP as TripBuilderPage
  participant SP as StepPlaces
  participant SE as StepExperiences
  participant SI as StepItinerary (DndContext)
  participant Store as trip-store
  participant Plan as trip-plan
  participant Trans as transport

  V->>TBP: /trip-builder?step=places
  TBP->>TBP: confirmStep("places") in an effect
  V->>SP: set nights on a stop
  SP->>Store: setStopNights(stopIndex, nights)
  Store->>Plan: stopsFromDays(days)
  Store->>Store: withRunLength: add days to the run, or pop days and move their items to pickDayFor(run)
  V->>SP: move a stop up or down
  SP->>Store: moveStop(index, ±1) swaps whole runs of days
  SP->>Trans: findRoute(previous, next) for each pair → hours, modes, via hub

  V->>TBP: next step → ?step=experiences
  V->>SE: add an experience
  SE->>Store: toggleExperience(slug)
  Store->>Store: placeExperience: its place joins at min days if absent, then pickDayFor(days, place) → emptiest day
  Store->>Store: items.push({ kind: "experience", experienceSlug })

  V->>TBP: next step → ?step=itinerary
  TBP->>Plan: tripWarnings({ days, durationDays, month, children }) via useMemo
  TBP->>SI: estimate, warnings
  SI->>SI: DayCard per day: date, arrival transfer via findRoute, load in hours, inline warnings
  V->>SI: drag a day handle onto another day
  SI->>SI: collision: only "day" droppables count
  SI->>Store: moveDay(fromIndex, toIndex)
  V->>SI: drag an item into another day's list or its drop zone
  SI->>Store: moveItem(itemId, toDayId, toIndex)
  V->>SI: add a free-time or transfer note, edit it, remove an item
  SI->>Store: addNote / updateNote / removeItem
  Store-->>TBP: days changed → useMemo recomputes estimate and warnings
  TBP-->>SI: DayCards re-render with new warnings and arrival lines
```

**What it shows.** Every edit, whether from the places step, the experiences
step or a drag in the editor, is a store action that returns a new `days`
array; nothing in the editor keeps state of its own beyond which item is
being dragged. Warnings are not raised by the actions. They are computed
from the resulting days on the next render, so a fix made anywhere clears
the warning everywhere. Two rules do most of the placing: `pickDayFor` puts
a new experience on the emptiest day in its place, and a day taken away by
shortening a stop hands its items to the emptiest day that remains.

### 4c. The price estimate recalculating as the trip changes

```mermaid
%%{init: {"sequence": {"wrap": true, "width": 190, "messageMargin": 45}}}%%
sequenceDiagram
  autonumber
  actor V as Visitor
  participant UI as StepStay / EstimateControls / any step
  participant Store as trip-store
  participant TBP as TripBuilderPage (or TripSummaryPage, BookingPage)
  participant Est as estimate.estimateTrip
  participant Plan as trip-plan
  participant Trans as transport
  participant C as content (destinations, experiences)
  participant Out as TripSummary · CostLines · LiveMoney · phone bar

  V->>UI: pick "Premium", switch to private tours, drop the fee, change currency, add an experience…
  UI->>Store: setTier(tier) · setPricing({ tourStyle, serviceIncluded, currency }) · addExperience(slug)
  Store-->>TBP: subscribed slice changed → re-render
  TBP->>Est: estimateTrip({ days, tier, adults, children, tourStyle, serviceIncluded }) inside useMemo
  Est->>Plan: stopsFromDays(days)
  Est->>Est: coveredNights(days): nights a cruise or camp already sleeps
  loop each change of place
    Est->>Trans: findRoute(from, to) → priceFrom per person × travellers
  end
  loop each day
    Est->>C: destination.nightlyRates[tier] × rooms, unless last day or covered
    loop each experience on the day
      Est->>C: priceFrom (+ privateSupplement if private and offered)
      Est->>Est: × adults, + half price × children unless minAge rules them out
    end
  end
  Est->>Est: serviceFee = 8% of experiences + transport when included
  Est->>Est: total, perPerson, perAdult, perChild, counts for the explanations
  Est-->>TBP: TripEstimate (all USD)
  TBP->>Out: estimate, currency
  Out->>Out: formatMoney converts USD at the content rate and formats for the language
  Out->>Out: LiveMoney tweens from the old figure to the new one
```

**What it shows.** Pricing is one pure function with no network and no
stored result. The currency is not an input to it: every figure is USD until
the moment it is displayed, when `formatMoney` converts and formats, so a
currency change re-renders without re-estimating. The nightly rates come
from each destination, not from the tier, which is why the stay step can
show what Comfort against Premium costs for this particular route. The
figure on screen is the only thing that animates; the number underneath is
always the fresh one.

### 4d. Submitting a booking request end to end

```mermaid
%%{init: {"sequence": {"wrap": true, "width": 190, "messageMargin": 45}}}%%
sequenceDiagram
  autonumber
  actor V as Visitor
  participant BP as BookingPage
  participant TS as trip-store
  participant BS as booking-store
  participant Sh as shared/booking
  participant FN as Vercel function api/requests.ts
  participant Pool as db/client.ts (pg Pool)
  participant PG as Neon PostgreSQL
  participant BCP as BookingConfirmationPage

  V->>BP: /booking
  BP->>TS: read trip
  BP->>BP: estimateTrip, tripWarnings, unconfirmedSteps
  alt problems or unseen defaults
    BP-->>V: held at the review step with links to the fixes
  end
  V->>BP: details step: name, email, phone, country, contact method
  BP->>Sh: validateDetails(details, countryCodes) on leaving the step
  BP->>BS: setDetails / setPreferences (draft persisted)
  V->>BP: send step: consent, "Send request"
  BP->>BP: payload = { language, traveller, preferences, trip: snapshotTrip, estimate: snapshotEstimate, wl_extra }
  BP->>FN: POST /api/requests (JSON, 20 s timeout)
  FN->>FN: in-memory rate limit per address, body size at most 60 kB
  FN->>Sh: parsePayload(body, countryCodes, currencyCodes)
  alt honeypot filled
    FN-->>BP: 201 with a throwaway reference (nothing stored)
  else invalid
    FN-->>BP: 400 { error, field }
  end
  FN->>FN: endDate = startDate + days − 1
  loop up to 5 attempts on a reference collision
    FN->>Sh: makeReference() → WL-XXXX-XXXX
    FN->>Pool: query(insert into booking_requests … returning created_at)
    Pool->>PG: INSERT over TLS
    PG-->>Pool: created_at, or unique violation 23505
  end
  FN-->>BP: 201 { reference, createdAt }
  BP->>BS: recordSent({ reference, createdAt, status "new", trip, estimate, traveller, preferences }), draft cleared
  BP->>BCP: navigate /booking/confirmation?ref=WL-…
  BCP->>BS: lastRequest with this reference?
  alt same browser
    BCP-->>V: renders from the local record, contact details included
  else another browser, or later
    BCP->>FN: GET /api/requests?ref=WL-…
    FN->>Pool: select reference, created_at, status, language, full_name, itinerary, estimate
    Pool->>PG: SELECT
    PG-->>FN: row, or none
    FN-->>BCP: 200 BookingRecord with first name only, or 404
    BCP-->>V: renders the trip and estimate, no contact details
  end
  V->>BCP: optional: download the PDF, built in the browser from the record
```

**What it shows.** The whole journey touches the server twice, once to
write and once, only in another browser, to read. The same `parsePayload`
that the form relies on runs again on the server, so validation cannot drift
between the two. The reference is generated by the server and is the
primary key, so a collision is handled by drawing again rather than by a
sequence. The confirmation page prefers the copy kept in the browser,
which is the only place the traveller's contact details ever come back
from; the API deliberately returns the trip, the estimate and a first name,
nothing more. There is no email, no payment and no status change: the row
sits at `new` for a specialist to pick up.

## 5. State diagram for the trip

```mermaid
stateDiagram-v2
  direction TB
  [*] --> Empty

  Empty : days is empty
  Empty : estimate is zero, one "empty" note
  Empty : summary and booking pages show an empty state

  Draft : has days, priced on defaults
  Draft : basics or stay step not yet seen (ConfirmNotice shown)
  Draft : estimate visible but marked as assumed

  Priced : basics and stay both seen
  Priced : at least one warning-severity problem
  Priced : booking review is held, problems listed with links

  Ready : basics and stay both seen
  Ready : no warning-severity problems (notes allowed)
  Ready : booking review passes to details

  Sent : booking-store holds lastRequest with the reference
  Sent : trip-store is unchanged and still editable

  Empty --> Draft : addDestination · toggleDestination · addExperience · loadJourney
  Draft --> Priced : confirmStep("basics") and confirmStep("stay") both recorded, warnings present
  Draft --> Ready : both steps seen, no warnings
  Priced --> Ready : last warning fixed (any edit that clears it)
  Ready --> Priced : an edit makes a rule fire
  Priced --> Draft : loadJourney (confirmed steps cleared)
  Ready --> Draft : loadJourney
  Ready --> Sent : details valid · consent · POST /api/requests → 201
  Sent --> Ready : keep editing, or request again
  Draft --> Empty : last stop removed
  Priced --> Empty : last stop removed
  Ready --> Empty : last stop removed
  Draft --> Empty : reset (after the confirm dialog)
  Priced --> Empty : reset
  Ready --> Empty : reset
  Sent --> Empty : reset
```

**What it shows.** The trip store persists only facts: the days, the party,
the dates, the tier, the pricing options, and which builder steps have been
seen. Every state above is derived from those facts on each render.

**Where this differs from the states the brief names.**

- **There is no "ready to price" state.** The estimate is computed on every
  render from the first day onwards, including in `Draft`. What changes when
  the basics and stay steps have been seen is only that the notice saying
  the figure rests on defaults goes away and the booking review stops
  holding the request.
- **"Validated" and "has conflicts" are not stored.** `tripWarnings` runs
  on every change and returns a fresh list. A rule of severity `warning`
  (over the trip length, a crowded day, the same experience twice, a busy
  day that starts with an eight-hour transfer, no route between two places)
  blocks the request; a `note` (under the trip length, a free transfer day,
  out of season, a minimum age, an overnight experience) does not. Because
  nothing is stored, there is no transition to write: the next render is the
  new state.
- **Sending does not end the trip.** The request is recorded in the booking
  store and the trip store is left alone, so the visitor can keep editing
  and send again; a second send creates a second row with a new reference.
  The only ways out are the reset dialog and removing every stop.
- **A journey resets the confirmation.** Loading a curated journey fills the
  days, the length and the suggested tier, then clears the seen steps, so
  a trip that arrived priced on someone else's defaults asks to be looked
  at before it can be requested.
- **The server has no state machine.** `booking_requests.status` is always
  `new`.
