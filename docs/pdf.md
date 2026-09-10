# The trip on paper

Anyone who has built a trip can download it as a PDF: from the trip summary
page, and again from the booking confirmation, where the file also carries
the reference and, in the browser that sent the request, the traveller's
details and preferences. It is a real document, not a screenshot: selectable
text, the site's own typefaces, the route drawn on the same map the builder
uses, and a page number on every page.

## What is in it

1. The title (the journey's name if the trip started from one, otherwise
   "Your trip to Egypt"), the trip in one line, the date it was prepared,
   and the booking reference when there is one.
2. The facts: dates, travellers, length against the intended length, stay
   level, tour style, currency. Beside them the map, the numbered stops
   with their nights, and how to get between each pair of places.
3. Day by day: every day with its date, what is planned and for how long,
   each experience with its duration and per-person price, free time and
   transfers with their notes, and the day's cost.
4. The estimate: the stacked bar, every line with what it is made of, the
   subtotal, the fee (or that it is left out), the total, per traveller,
   per adult and child, and the conversion note when the currency is not
   dollars.
5. Things to know: the builder's warnings and notes, and the "not yet
   confirmed" notice when defaults have not been seen.
6. Your details and preferences, on the confirmation's copy only.
7. How the estimate is calculated, and the disclaimer.

## How it is made

`src/lib/trip-pdf.ts` turns a trip into plain strings (`TripPdfData`):
every label translated, every number, date and amount formatted the way the
page formats them. It accepts both shapes a trip comes in, the live builder
state and the snapshot a request was sent with, so the summary page and the
confirmation produce the same document. `src/pdf/TripDocument.tsx` is the
layout, written with `@react-pdf/renderer`; it renders in a React tree of
its own, outside the app's providers, which is why it takes strings and
never translates.

The renderer is the largest thing the site can load (about 445 KB
compressed), so nothing touches it until the button is pressed:
`src/pdf/download.tsx` imports it and the document then, builds the file as
a blob and hands it to the browser's download. The button
(`DownloadPdfButton`) builds the data at the moment of the click, so the
file says what the page says.

## Fonts and Arabic

The renderer embeds fonts from files, so `public/fonts/pdf/` carries static
instances of Fraunces, Inter, Amiri and IBM Plex Sans Arabic (see the
credits file there). The Arabic files include Latin letters and digits,
because the renderer cannot fall back between families glyph by glyph.

Arabic is shaped by the renderer's own layout engine, and each paragraph is
given `direction: "rtl"`, which the layout reads: without it a sentence's
full stop lands at the wrong end. Rows are mirrored with `row-reverse`.
Where a bold run sits inside a paragraph (the calculation rules), the
Arabic version stacks the title above the body instead, because nested
runs confuse the bidirectional pass.

Two renderer quirks worth knowing: a `lineHeight` on the page style, or on
text inside a `fixed` element, makes the fixed header and footer vanish, so
leading lives on the running-text styles only; and the Unicode isolate
characters the site uses on screen have no glyphs in these fonts, so the
builder leaves them out.

## Looking at it

    npx tsx --tsconfig tsconfig.app.json scripts/pdf-sample.tsx out/
    pdftoppm -r 70 -png out/trip-en.pdf out/trip-en

renders a sample trip in both languages without clicking through the site.
