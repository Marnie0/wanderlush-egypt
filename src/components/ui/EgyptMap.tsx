import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";
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
  activeSlug: string;
  onSelect: (slug: string) => void;
  className?: string;
}

/**
 * An interactive SVG map rather than a tile provider: no key, no network, and
 * it can be coloured to match the rest of the site. Markers are real buttons,
 * so the whole map works from the keyboard.
 *
 * Phase 3 reuses this component for the full destination explorer.
 */
export function EgyptMap({ destinations, activeSlug, onSelect, className }: EgyptMapProps) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? "en";

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

      {destinations.map((destination) => {
        const base = projectToMap(destination.coordinates.lat, destination.coordinates.lng);
        const nudge = MARKER_NUDGE[destination.slug] ?? { x: 0, y: 0 };
        const x = base.x + nudge.x;
        const y = base.y + nudge.y;
        const isActive = destination.slug === activeSlug;
        const name = pick(destination.name, language);
        const label = LABEL_PLACEMENT[destination.slug] ?? DEFAULT_LABEL;

        return (
          <g
            key={destination.slug}
            role="button"
            tabIndex={0}
            aria-label={name}
            aria-pressed={isActive}
            className="cursor-pointer focus:outline-none"
            onClick={() => onSelect(destination.slug)}
            onMouseEnter={() => onSelect(destination.slug)}
            onFocus={() => onSelect(destination.slug)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect(destination.slug);
              }
            }}
          >
            {/* Generous invisible target: the visible dot is far too small to tap. */}
            <circle cx={x} cy={y} r="22" fill="transparent" />
            {isActive && (
              <circle
                cx={x}
                cy={y}
                r="15"
                fill={destination.accent}
                opacity="0.22"
                className="transition-all duration-300"
              />
            )}
            <circle
              cx={x}
              cy={y}
              r={isActive ? 7 : 5}
              fill={isActive ? destination.accent : "var(--color-charcoal-700)"}
              stroke="var(--color-ivory)"
              strokeWidth="2"
              className="transition-all duration-300"
            />
            <text
              x={x + label.dx}
              y={y + label.dy}
              textAnchor={label.anchor}
              className={cn(
                "pointer-events-none select-none font-body text-[15px] transition-opacity duration-300",
                isActive ? "opacity-100" : "opacity-0",
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
