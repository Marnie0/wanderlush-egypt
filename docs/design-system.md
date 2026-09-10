# Design system

Tokens live in `src/styles/index.css` under `@theme`. Tailwind generates
utilities from them, so `bg-ember-500` and `var(--color-ember-500)` are the same
value. Motion constants are mirrored in `src/lib/motion.ts` for Framer Motion.

## Colour

| Role | Token | Notes |
| --- | --- | --- |
| Page ground | `canvas` / `ivory` `#fdfbf7` | Warm white, never pure `#fff` |
| Raised surface | `surface` / `sand-50` | Section bands, cards, aside panels |
| Deep surface | `teal-800` `#143331` | Footer, night sections, mobile menu |
| Body text | `charcoal-800` | |
| Muted text | `charcoal-400` | Metadata, labels, captions |
| Hairlines | `sand-200` | Every border on a light ground |
| Action | `ember-500` `#c85f26` | Primary buttons and links only |
| Information | `nile-500` | Water, coastal and map accents |
| Accent marks | `gold-400/500` | Rules, eyebrows, small marks. Never a button |

Each destination, experience and journey also carries an `accent` hex used for
its gradient placeholder and small per-page accents.

**Avoid:** purple, glassmorphism, drop shadows for depth, more than one accent
colour in a single component.

## Typography

| Use | Latin | Arabic |
| --- | --- | --- |
| Display | Fraunces | Amiri |
| Body | Inter | IBM Plex Sans Arabic |

Families swap on `[dir="rtl"]`, and Arabic gets looser leading (1.9 for body,
1.35 for headings) because the script needs it. Eyebrows drop their letter
spacing and uppercase transform in Arabic, where neither applies.

Fluid sizes: `text-hero`, `text-display`, `text-title`, `text-lead`,
`text-eyebrow`. All clamp between a mobile and a desktop bound, so there are no
breakpoint-specific font sizes anywhere in the components.

## Spacing and layout

- Container: `max-w-[82rem]`, gutters `1.25rem → 2rem → 3rem`.
- Section rhythm: `py-section` (6rem), `py-section-lg` (9rem) above `lg`.
- Editorial pages use a `1.6fr / 1fr` split with a sticky aside from `lg` up.

## Geometry

Radii are small on purpose: `2px`, `4px`, `8px`, `14px`. Photography is square
cornered. Buttons and inputs use `rounded-sm`.

## Motion

| Token | Value | Use |
| --- | --- | --- |
| `fast` | 180ms | Hover and colour changes |
| `base` | 320ms | Menus, drawers, step panels, small entrances |
| `slow` | 640ms | Section and card entrances, the price travelling |
| `cinematic` | 1200ms | Hero headline and the photograph hover |
| `pop` | spring 520/28 | A tick, a badge, a map stop landing |

Easing: `entrance` `cubic-bezier(0.16, 1, 0.3, 1)` for anything arriving,
`soft` for interface state, `exit` for anything leaving. The vocabulary
lives in `src/lib/motion.ts`; components import variants from there rather
than writing their own numbers.

Rules: transforms and opacity only, so a phone keeps up and nothing
reflows; entrances fire once via `viewportOnce`; lists stagger by 80ms; a
photograph scales to 1.04 on hover (`.photo-zoom`) and nothing else on the
card moves; no exit animation on route or step changes, because two pages
on screen at once double the document and shove the footer about.

### Signature sequences

The brief asks for a few sequences rather than motion everywhere. These are
the ones, and everything else is a fade or a colour change.

- **Hero.** The photograph settles from a 1.06 zoom over 1.8s while the
  copy rises in, then drifts at 12% of the scroll speed for depth.
- **Map.** The selected marker breathes (`.marker-pulse`, one element on the
  page). A stop that joins the route lands with the `pop` spring, and the
  route draws itself from first stop to last whenever it changes: a mask
  with an animated `pathLength` over the dashed line, because Framer's
  `pathLength` and a dash pattern cannot share one stroke.
- **Into planning.** "Add to trip" flips to a tick with the `pop` spring,
  the count in the navigation lands the same way, and a line at the foot
  of the screen (`Toast`) names what was added and offers the trip
  builder. The builder itself does not show the line; the trip is already
  on screen there.
- **Builder progress.** Under the step row a line fills from the start
  edge to the current step (mirrored in Arabic), an earned tick springs
  in, and each step panel slides in from the direction of travel
  (`StepPanel`). The booking request uses the same two pieces.
- **Itinerary.** An activity added to a day drops in; the copy under the
  pointer while dragging is lifted a touch and tilted half a degree; the
  day about to receive it shows an ember inset line.
- **Price.** The total travels to its new value over 640ms
  (`useTweenedNumber`) and its colour warms for a second (`LiveMoney`).
  The live region is the parent, so a screen reader hears one figure per
  change, not every frame.
- **Confirmation.** The tick draws itself, the reference card lands with
  the `pop` spring, and the sections below rise in one after another.
  While a reference is being fetched the page shows a skeleton the shape
  of what is coming, not a spinner.
- **Routes.** Each route fades in on arrival, keyed on the path only, so a
  filter or a step (which live in the query string) does not re-run it.

### Reduced motion

`MotionConfig reducedMotion="user"` in `main.tsx` makes Framer treat every
transform animation as an instant change and keep only the opacity fades,
which is what the preference asks for. CSS transitions and keyframes are
cut to a frame under the same media query, and the two looping animations
(the marker pulse, the skeleton shimmer) are removed outright, because a
one-frame loop still repaints. The hand-driven pieces, the price tween and
the SVG route, read `useReducedMotion()` and snap.

### Polished states

- `EmptyState` is the one shape for "nothing here yet": a mark, what is
  missing, what to do, the action that does it. Filters with no results,
  a trip with no places, a reference that leads nowhere.
- `RouteFallback` stands in for a route chunk; `.skeleton` blocks stand in
  for data. Both are taller than the fold so the footer does not leap.
- Buttons move a pixel on press and back; focus rings are the global
  `:focus-visible` outline; a card's title warms on hover (`.card-title`).

## Direction

Layout uses logical properties throughout (`ps-`, `pe-`, `ms-`, `me-`,
`start-`, `end-`), so RTL is a document attribute rather than a second
stylesheet. Anything that must mirror in JavaScript reads `useDirection()`.
