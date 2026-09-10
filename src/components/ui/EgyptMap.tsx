import { useId } from "react";
import { useTranslation } from "react-i18next";
import { m, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";
import { transitions } from "@/lib/motion";
import { pick } from "@/lib/format";
import {
  DEFAULT_LABEL,
  LABEL_PLACEMENT,
  MAP_HEIGHT,
  MAP_WIDTH,
  MARKER_NUDGE,
  egyptOutlinePath,
  lakeNasserPath,
  nileEastPath,
  nileMainPath,
  nileWestPath,
  projectToMap,
} from "@/lib/egypt-geo";
import type { Destination } from "@content/types";

interface EgyptMapProps {
  destinations: Destination[];
  activeSlug?: string;
  onSelect?: (slug: string) => void;
  /** Places in the trip, in order: they are numbered and joined by a route. */
  route?: string[];
  /** Selecting on hover suits browsing; a trip map only follows clicks. */
  selectOnHover?: boolean;
  className?: string;
}

/**
 * An interactive SVG map rather than a tile provider: no key, no network, and
 * it can be coloured to match the rest of the site. Markers are real buttons,
 * so the whole map works from the keyboard.
 *
 * Phase 3 reuses this component for the full destination explorer.
 *
 * Motion: the selected marker breathes, a new stop lands with a spring, and
 * the route draws itself from the first stop to the last whenever it
 * changes. The drawing is a mask over the dashed line, because Framer's
 * `pathLength` and a dash pattern cannot share one stroke.
 */
export function EgyptMap({
  destinations,
  activeSlug,
  onSelect,
  route = [],
  selectOnHover = true,
  className,
}: EgyptMapProps) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? "en";
  const reduceMotion = useReducedMotion();
  // Two maps can share a page (the builder's places step and its summary), so ids are per instance.
  const maskId = useId();
  const bySlug = new Map(destinations.map((destination) => [destination.slug, destination]));
  const position = (slug: string) => {
    const destination = bySlug.get(slug);
    if (!destination) return null;
    const base = projectToMap(destination.coordinates.lat, destination.coordinates.lng);
    const nudge = MARKER_NUDGE[slug] ?? { x: 0, y: 0 };
    return { x: base.x + nudge.x, y: base.y + nudge.y };
  };
  // Consecutive repeats collapse: Cairo, Luxor, Cairo is two legs, not three.
  const routePoints = route
    .filter((slug, index) => index === 0 || slug !== route[index - 1])
    .map(position)
    .filter((point): point is { x: number; y: number } => point !== null);
  const routeIndex = new Map<string, number>();
  route.forEach((slug) => {
    if (!routeIndex.has(slug)) routeIndex.set(slug, routeIndex.size + 1);
  });

  return (
    <svg
      viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
      className={cn("h-auto w-full overflow-visible", className)}
      role="group"
      aria-label={t("home.mapLabel")}
    >
      <defs>
        <linearGradient id="egypt-land" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="var(--color-sand-200)" />
          <stop offset="100%" stopColor="var(--color-sand-300)" />
        </linearGradient>
        <filter id="egypt-lift" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow
            dx="0"
            dy="6"
            stdDeviation="10"
            floodColor="var(--color-charcoal-900)"
            floodOpacity="0.14"
          />
        </filter>
      </defs>

      <path
        d={egyptOutlinePath}
        fill="url(#egypt-land)"
        stroke="var(--color-sand-600)"
        strokeWidth="1.75"
        strokeLinejoin="round"
        filter="url(#egypt-lift)"
      />
      <path d={lakeNasserPath} fill="var(--color-nile-300)" opacity="0.75" />
      {[nileMainPath, nileWestPath, nileEastPath].map((d) => (
        <path
          key={d}
          d={d}
          fill="none"
          stroke="var(--color-nile-400)"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.8"
        />
      ))}

      {routePoints.length > 1 && (() => {
        const d = routePoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x} ${p.y}`).join(" ");
        return (
          <>
            <mask id={maskId} maskUnits="userSpaceOnUse">
              <m.path
                key={d}
                d={d}
                fill="none"
                stroke="#fff"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={reduceMotion ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.9, ease: "easeInOut" }}
              />
            </mask>
            <path
              d={d}
              mask={`url(#${maskId})`}
              fill="none"
              stroke="var(--color-ember-600)"
              strokeWidth="2.5"
              strokeDasharray="6 6"
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity="0.85"
            />
          </>
        );
      })()}

      {destinations.map((destination) => {
        const base = projectToMap(destination.coordinates.lat, destination.coordinates.lng);
        const nudge = MARKER_NUDGE[destination.slug] ?? { x: 0, y: 0 };
        const x = base.x + nudge.x;
        const y = base.y + nudge.y;
        const isActive = destination.slug === activeSlug;
        const stopNumber = routeIndex.get(destination.slug);
        const inRoute = stopNumber !== undefined;
        const name = pick(destination.name, language);
        const label = LABEL_PLACEMENT[destination.slug] ?? DEFAULT_LABEL;

        return (
          <g
            key={destination.slug}
            role={onSelect ? "button" : undefined}
            tabIndex={onSelect ? 0 : undefined}
            aria-label={stopNumber ? `${stopNumber}. ${name}` : name}
            aria-pressed={onSelect ? isActive || inRoute : undefined}
            className={cn("group outline-none", onSelect && "cursor-pointer")}
            onClick={() => onSelect?.(destination.slug)}
            onMouseEnter={() => selectOnHover && onSelect?.(destination.slug)}
            onFocus={() => selectOnHover && onSelect?.(destination.slug)}
            onKeyDown={(event) => {
              if (onSelect && (event.key === "Enter" || event.key === " ")) {
                event.preventDefault();
                onSelect(destination.slug);
              }
            }}
          >
            {/* Generous invisible target: the visible dot is far too small to tap. */}
            <circle cx={x} cy={y} r="22" fill="transparent" />
            {isActive && (
              <>
                <circle cx={x} cy={y} r="15" fill={destination.accent} opacity="0.18" />
                <circle cx={x} cy={y} r="12" fill={destination.accent} className="marker-pulse" />
              </>
            )}
            <circle
              cx={x}
              cy={y}
              r={isActive || inRoute ? 7 : 5}
              fill={isActive || inRoute ? destination.accent : "var(--color-charcoal-700)"}
              stroke="var(--color-ivory)"
              strokeWidth="2"
              className="marker-dot transition-[fill,r] duration-300 group-focus-visible:stroke-ember-500 group-focus-visible:[stroke-width:3]"
            />
            {stopNumber !== undefined && (
              <m.g key={stopNumber} initial="hidden" animate="visible" variants={{ hidden: { scale: 0 }, visible: { scale: 1, transition: transitions.pop } }}>
                <circle cx={x} cy={y} r="10" fill="var(--color-ember-600)" stroke="var(--color-ivory)" strokeWidth="2" />
                <text
                  x={x}
                  y={y + 4}
                  textAnchor="middle"
                  direction="ltr"
                  className="pointer-events-none select-none font-body text-[11px] font-semibold"
                  fill="var(--color-ivory)"
                >
                  {stopNumber}
                </text>
              </m.g>
            )}
            <text
              x={x + label.dx}
              y={y + label.dy}
              textAnchor={label.anchor}
              // SVG resolves "start" and "end" against the inherited text
              // direction, so under dir="rtl" an end-anchored label would
              // run the other way, across its own marker. The placements
              // are geometric, so the text keeps a fixed direction.
              direction="ltr"
              className={cn(
                "pointer-events-none select-none font-body text-[15px] transition-opacity duration-300",
                isActive || inRoute ? "opacity-100" : "opacity-0",
              )}
              fill="var(--color-charcoal-900)"
              stroke="var(--color-ivory)"
              strokeWidth="4"
              paintOrder="stroke"
            >
              {name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
