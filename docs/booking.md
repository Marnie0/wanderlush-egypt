# Booking request

The itinerary becomes an inquiry, not a payment. `/booking` walks through four
steps, `/api/requests` stores the result in Neon, and `/booking/confirmation`
is the receipt.

## Steps

| Step | What it holds | What "done" means |
| --- | --- | --- |
| Review | The trip as it will be sent (`TripReview`), the estimate, and any itinerary problems, each linked to its day | The trip has days and no warnings of severity "warning" |
| Your details | Full name, email, phone, country, preferred reply method | `validateDetails` returns no errors |
| Preferences | Dietary, accessibility, room, airport transfer, special occasion, anything else; all optional | Visited |
| Send | Details and preferences read back, consent box, the send button | Never ticked; sending leaves the page |

The step is in the URL (`?step=`). A visitor cannot vault a gate: with
problems on the trip every step shows the review; without valid details the
send step shows the details. Leaving the details step checks them and focuses
the first invalid field; messages follow the typing after that first attempt.

The half-filled form lives in `localStorage` (`wanderlush.booking`, via
`src/lib/booking-store.ts`) so a refresh or a detour to fix the itinerary
costs nothing. Sending clears the draft and keeps the sent request in the same
store as `lastRequest`.

## What is sent

`shared/booking.ts` defines the payload and validates it. The same module
runs in the browser (before sending) and in the API route (on receipt), so a
request that passes the form passes the server, and one sent by hand is held
to the same rules. Strings are clipped to their limits rather than rejected,
by code point and with control characters removed, so a limit never leaves a
half emoji that the JSON columns would refuse. Arabic-Indic digits in a phone
number become Western digits as they are typed, so the number reads the
same way in the form, the read-back and the database, and the server
normalises again on receipt.

The route also answers 429 to more than eight requests from one address in
ten minutes. The counter lives in the function's memory, so it is a brake on
a loop rather than a guarantee.

- `traveller`: name, email, phone (7 to 15 digits with the usual punctuation),
  ISO country code from `content/countries.ts`, contact method.
- `preferences`: the optional fields, notes capped at 1,000 characters.
- `trip`: a snapshot (`snapshotTrip`): per day the place, the experience slugs
  and any notes (200 characters each, cut where they are typed); party,
  dates, level, tour style, fee choice, currency, interests. No ids, no drag
  state. Dates are checked as real calendar dates, months and currencies
  against the site's lists.
- `estimate`: the USD breakdown at the moment of sending (`snapshotEstimate`).
- `wl_extra`: a honeypot with a name no form filler recognises. People never
  see it; a filled one is answered with a fake success, stored nowhere and
  counted in the log.

## Storage

`booking_requests` in `db/schema.sql`. The reference is the primary key:
`WL-XXXX-XXXX` from an alphabet without 0, 1, I or O, drawn again on the rare
collision. Scalar columns (name, email, phone, country, contact method, party,
dates, tier, currency, total) are there for a specialist's query; `itinerary`,
`preferences` and `estimate` hold the snapshots as JSON. `status` starts at
`new`.

The server stores the estimate the traveller saw rather than recomputing it;
the reply quotes against that figure, and the itinerary snapshot is enough to
check it.

## Confirmation

`/booking/confirmation?ref=WL-…`. The browser that sent the request has the
whole thing, contact details included, and renders it from `lastRequest`.
Any other browser fetches `GET /api/requests?ref=`, which returns the trip,
the estimate, the first name and the status, and never email or phone.
Both pages are `noindex`.

"Print or save as PDF" is the browser's print dialog with a print stylesheet
(`@media print` in `src/styles/index.css`): header, footer, buttons and the
aside go; the reference, the itinerary, the estimate and the details stay.

## Testing locally

Vite's preview has no API. `npx tsx scripts/serve-local.mjs` serves `dist/`
with the API routes attached and `DATABASE_URL` from `.env.local`, so the
whole journey runs against the real database from this machine.

## The confirmation as a file

The confirmation page offers the request as a PDF as well as the print
stylesheet. See `docs/pdf.md`: the same document the trip summary page
produces, with the reference on it and, in the browser that sent the
request, the traveller's details and preferences.
