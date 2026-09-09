/**
 * A hand-simplified outline of Egypt, plus the projection used to place
 * destinations on it. An SVG map rather than a tile provider: it needs no key,
 * no network, and it can be styled to match the rest of the site.
 *
 * Coordinates are [longitude, latitude], traced clockwise from Sallum on the
 * Mediterranean, out around Sinai and down the Red Sea coast, west along the
 * 22nd parallel and back north up the 25th meridian.
 */
const OUTLINE: [number, number][] = [
  [25.15, 31.65], [26.2, 31.5], [27.2, 31.28], [28.5, 31.05], [29.0, 30.85],
  [29.9, 31.2], [30.4, 31.45], [31.0, 31.52], [31.8, 31.5], [32.3, 31.26],
  [33.5, 31.1], [34.25, 31.29],
  [34.9, 29.49], [34.72, 28.9], [34.45, 28.2], [34.25, 27.72],
  [33.6, 28.35], [33.35, 29.2], [32.55, 29.97],
  [32.85, 29.4], [33.2, 28.6], [33.55, 27.9], [33.81, 27.25],
  [34.4, 26.0], [34.9, 25.07], [35.5, 23.9], [36.2, 23.0], [36.9, 22.0],
  [31.0, 22.0], [25.0, 22.0],
  [25.0, 25.0], [25.0, 29.0], [25.15, 31.65],
];

/** The Nile, from Lake Nasser to the two mouths of the delta. */
const NILE_MAIN: [number, number][] = [
  [32.2, 22.1], [32.55, 23.1], [32.85, 23.95], [32.9, 24.09], [32.64, 25.69], [32.3, 26.2],
  [31.18, 27.18], [30.8, 28.1], [31.1, 29.3], [31.23, 30.04],
];
const NILE_WEST_BRANCH: [number, number][] = [[31.23, 30.04], [30.7, 30.8], [30.4, 31.45]];
const NILE_EAST_BRANCH: [number, number][] = [[31.23, 30.04], [31.5, 30.9], [31.8, 31.5]];

/** Lake Nasser: a narrow lobe following the drowned Nile down to the border. */
const LAKE_NASSER: [number, number][] = [
  [32.88, 23.95], [32.72, 23.4], [32.5, 22.8], [32.35, 22.0], [31.95, 22.0],
  [32.15, 22.85], [32.35, 23.45], [32.62, 23.98], [32.88, 23.95],
];

export const EGYPT_BBOX = { minLng: 24.6, maxLng: 37.2, minLat: 21.7, maxLat: 31.9 };

/**
 * Longitudes are compressed by the cosine of the mid latitude so the country
 * keeps its real proportions instead of looking stretched east to west.
 */
const MID_LAT_SCALE = Math.cos(((EGYPT_BBOX.minLat + EGYPT_BBOX.maxLat) / 2) * (Math.PI / 180));
const LNG_SPAN = (EGYPT_BBOX.maxLng - EGYPT_BBOX.minLng) * MID_LAT_SCALE;
const LAT_SPAN = EGYPT_BBOX.maxLat - EGYPT_BBOX.minLat;

export const MAP_HEIGHT = 560;
export const MAP_WIDTH = Math.round((LNG_SPAN / LAT_SPAN) * MAP_HEIGHT);

export function projectToMap(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng - EGYPT_BBOX.minLng) * MID_LAT_SCALE * MAP_HEIGHT) / LAT_SPAN;
  const y = ((EGYPT_BBOX.maxLat - lat) * MAP_HEIGHT) / LAT_SPAN;
  return { x, y };
}

function toPath(points: [number, number][], close = false): string {
  const d = points
    .map(([lng, lat], index) => {
      const { x, y } = projectToMap(lat, lng);
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  return close ? `${d} Z` : d;
}

/**
 * Cairo and Giza are four kilometres apart, which is smaller than a marker at
 * this scale. Nudging them apart is a cartographic decision, so it lives here
 * rather than in the content.
 */
export const MARKER_NUDGE: Record<string, { x: number; y: number }> = {
  cairo: { x: 9, y: -9 },
  giza: { x: -11, y: 7 },
};

/**
 * Labels sit above their marker by default. Around Cairo the markers are close
 * enough that a label would land on a neighbouring dot, so those few are
 * placed by hand.
 */
export interface LabelPlacement {
  dx: number;
  dy: number;
  anchor: "start" | "middle" | "end";
}

export const DEFAULT_LABEL: LabelPlacement = { dx: 0, dy: -20, anchor: "middle" };

export const LABEL_PLACEMENT: Record<string, LabelPlacement> = {
  // Above would hit Cairo, below would hit Fayoum, so Giza reads to the west.
  giza: { dx: -13, dy: 6, anchor: "end" },
  fayoum: { dx: 0, dy: 34, anchor: "middle" },
  // Above would run into the Sharm el-Sheikh marker across the gulf.
  hurghada: { dx: 0, dy: 28, anchor: "middle" },
};

export const egyptOutlinePath = toPath(OUTLINE, true);
export const nileMainPath = toPath(NILE_MAIN);
export const nileWestPath = toPath(NILE_WEST_BRANCH);
export const nileEastPath = toPath(NILE_EAST_BRANCH);
export const lakeNasserPath = toPath(LAKE_NASSER, true);
