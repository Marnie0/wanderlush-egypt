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
| `base` | 320ms | Menus, drawers, small entrances |
| `slow` | 640ms | Section and card entrances |
| `cinematic` | 1200ms | Hero headline only |

Easing: `entrance` `cubic-bezier(0.16, 1, 0.3, 1)` for anything arriving,
`soft` for interface state, `exit` for anything leaving.

Rules: entrances fire once via `viewportOnce`; lists stagger by 80ms; images
scale to 1.04 on hover and nothing else moves; `prefers-reduced-motion` is
honoured globally in CSS and by Framer Motion.

## Direction

Layout uses logical properties throughout (`ps-`, `pe-`, `ms-`, `me-`,
`start-`, `end-`), so RTL is a document attribute rather than a second
stylesheet. Anything that must mirror in JavaScript reads `useDirection()`.
