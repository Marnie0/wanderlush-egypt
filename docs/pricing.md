# Pricing rules

How the trip builder's estimate is calculated. The code is
`src/lib/estimate.ts`; the same rules are shown to the traveller on the
`/trip-summary` page under "How this is calculated". Change one, change all
three.

Every figure is an estimate in US dollars. The site says so wherever a total
appears: availability, season and room type can change it, flights to and from
Egypt are not in it, and a travel specialist confirms the final quotation.

## Inputs

| Input | Where it is set | Used for |
| --- | --- | --- |
| Adults, children | Basics step | Rooms, per-person prices, per-traveller figures |
| Itinerary (ordered days, each in one place, with its experiences) | Places, Experiences and Itinerary steps | Nights, transfers, experiences |
| Accommodation level | Stay step | Nightly rate per place |
| Tour style: shared or private | Estimate controls | Private supplements |
| Planning and support fee: on or off | Estimate controls | Service fee |
| Currency | Basics step or estimate controls | Display only |

Children are under twelve. There is no separate infant category.

## Rules

1. **Accommodation.** Every day but the last is a hotel night, charged at the
   destination's nightly rate for the chosen level (`nightlyRates` in
   `content/destinations.ts`, USD per room per night). The last day is the
   journey home. An experience of twenty hours or more (a cruise cabin, a
   desert camp) sleeps its guests, so no hotel is charged for the nights it
   covers: one for an overnight camp, three for a four-day cruise (the days
   it spans, less one), counted from the day it sits on. Rooms hold two
   people; children count towards rooms;
   `rooms = ceil((adults + children) / 2)`, and a lone traveller still needs
   one room.
2. **Experiences.** Each experience on the itinerary is charged per adult at
   its `priceFrom`. Duplicates are charged twice and flagged by the itinerary
   warnings.
3. **Children.** A child pays 50% of the adult price on each experience,
   rounded to the dollar. An experience whose minimum age is twelve or more
   has no place for a child, so nothing is charged for children on it and the
   breakdown says how many such experiences there are.
4. **Private tours.** When "Private" is chosen, each experience that lists a
   private format and has a supplement adds `privateSupplement` per person
   (children at their 50% rate on the combined price). Experiences that only
   run shared are unchanged and counted in the breakdown. Experiences that
   only run private already carry the private price in `priceFrom`.
5. **Transportation.** For every change of place along the route, the
   quickest transfer from `content/transport.ts` (via a hub when there is no
   direct link) is charged at its `priceFrom` per traveller, children at full
   price. It is booked to the first day in the new place.
6. **Planning and support.** 8% (`SERVICE_FEE_RATE`) of experiences plus
   transport, never of accommodation, rounded to the dollar. It is optional:
   the traveller can take it out to see the bare cost, and the breakdown then
   says it is not included.
7. **Subtotal and total.** `subtotal = accommodation + experiences +
   transport`; `total = subtotal + fee`.
8. **Per traveller.** `total / travellers`, rounded. When children are on the
   trip the breakdown also shows a per-adult and per-child figure: rooms,
   transfers and the fee are split equally between everyone, and each person
   carries the experiences they were charged for. The adult and child figures
   multiply back to the total.
9. **Currency.** Prices are stored in USD and converted for display with the
   static rates in `content/currencies.ts`, rounded to whole units. When the
   display currency is not USD the summary page states the rate used.

## Worked example

Two adults and one child, Comfort level, three days: two in Luxor, then one in
Aswan, shared tours, fee included. Luxor Comfort is $105 a room a night; Luxor
to Aswan by train (the quickest link) is $20 a person. The Luxor days hold the
hot-air balloon ($125 a person) and the private Valley of the Kings morning
($110 a person; it only runs private, so its price already is the private
price).

| Line | Working | USD |
| --- | --- | --- |
| Accommodation | 2 rooms × (night 1 Luxor $105 + night 2 Luxor $105); day 3 is the journey home | 420 |
| Experiences | Balloon $125 × 2 adults + $63 child; Valley of the Kings $110 × 2 + $55 child | 588 |
| Transportation | Train $20 × 3 travellers | 60 |
| Subtotal | | 1,068 |
| Planning and support | 8% × (588 + 60) = 51.84 | 52 |
| Total | | 1,120 |
| Per traveller | 1,120 / 3 | 373 |
| Per adult | (420 + 60 + 52) / 3 + (125 + 110) | 412 |
| Per child | (420 + 60 + 52) / 3 + (63 + 55) | 295 |

Check: 2 × 412 + 295 = 1,119, the total to within the rounding of each figure.
Choosing private tours adds the balloon's $480 supplement per person (the
child at half): experiences become $1,788 and the total $2,416. Taking the fee
out of the shared version gives $1,068.

## Per-day figures

The day-by-day table on the summary page uses the same numbers, attributed to
days: a hotel night to the day it begins, a transfer to the day it happens,
an experience to the day it is on. The day totals sum to the subtotal; the fee
is applied once, on the whole.
