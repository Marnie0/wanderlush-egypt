import { transportHubs, transportLinks, type TransportOption } from "@content/transport";

export interface RouteLeg {
  from: string;
  to: string;
  option: TransportOption;
}

export interface TransferRoute {
  legs: RouteLeg[];
  hours: number;
  /** USD per person. */
  priceFrom: number;
  /** The hub the route passes through, when it is not direct. */
  via: string | null;
}

function directOptions(from: string, to: string): TransportOption[] {
  const link = transportLinks.find(
    ({ between: [a, b] }) => (a === from && b === to) || (a === to && b === from),
  );
  return link?.options ?? [];
}

/** The quickest way, which is what a transfer day is planned around. */
function quickest(options: TransportOption[]): TransportOption | undefined {
  return [...options].sort((a, b) => a.hours - b.hours)[0];
}

/**
 * Direct if there is a link, otherwise through the hub that makes the
 * shortest day. A route through a hub adds an hour for the connection.
 */
export function findRoute(from: string, to: string): TransferRoute | null {
  if (from === to) return { legs: [], hours: 0, priceFrom: 0, via: null };
  const direct = quickest(directOptions(from, to));
  if (direct) {
    return { legs: [{ from, to, option: direct }], hours: direct.hours, priceFrom: direct.priceFrom, via: null };
  }
  let best: TransferRoute | null = null;
  for (const hub of transportHubs) {
    if (hub === from || hub === to) continue;
    const first = quickest(directOptions(from, hub));
    const second = quickest(directOptions(hub, to));
    if (!first || !second) continue;
    const route: TransferRoute = {
      legs: [
        { from, to: hub, option: first },
        { from: hub, to, option: second },
      ],
      hours: first.hours + second.hours + 1,
      priceFrom: first.priceFrom + second.priceFrom,
      via: hub,
    };
    if (!best || route.hours < best.hours) best = route;
  }
  return best;
}

/** Every way between two places that has a direct link, quickest first. */
export function transferOptions(from: string, to: string): TransportOption[] {
  return [...directOptions(from, to)].sort((a, b) => a.hours - b.hours);
}

/** Great-circle distance in kilometres, for the "how far" line. */
export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * 6371 * Math.asin(Math.sqrt(h)));
}
