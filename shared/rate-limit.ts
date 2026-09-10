/**
 * A best-effort brake on one address sending request after request. Memory
 * lives as long as the function's container, which is enough to blunt a
 * loop and no substitute for edge rate limiting on a real deployment. No
 * Node, no DOM: shared by every API route that takes a form.
 */
export const WINDOW_MS = 10 * 60 * 1000;
export const WINDOW_LIMIT = 8;

export function makeLimiter(limit = WINDOW_LIMIT, windowMs = WINDOW_MS) {
  const recent = new Map<string, number[]>();
  return function tooMany(address: string): boolean {
    const now = Date.now();
    const stamps = (recent.get(address) ?? []).filter((at) => now - at < windowMs);
    stamps.push(now);
    recent.set(address, stamps);
    if (recent.size > 5000) recent.clear();
    return stamps.length > limit;
  };
}

/** The first hop of the forwarded chain, or the socket, or "unknown". */
export function clientAddress(req: { headers: Record<string, string | string[] | undefined>; socket?: { remoteAddress?: string } }): string {
  const forwarded = req.headers["x-forwarded-for"];
  const first = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(",")[0]?.trim();
  return first || req.socket?.remoteAddress || "unknown";
}
