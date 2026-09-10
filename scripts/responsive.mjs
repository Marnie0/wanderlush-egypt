/**
 * The responsive review: a representative set of routes at five widths, in
 * both languages, checking for horizontal overflow and anything pushed off
 * the viewport, and saving a screenshot of each for a visual pass.
 *
 *   node scripts/responsive.mjs http://localhost:4174 [out-dir]
 */
import { mkdirSync } from "node:fs";
import { launch } from "./lib/chrome.mjs";

const base = (process.argv[2] ?? "http://localhost:4174").replace(/\/$/, "");
const out = process.argv[3] ?? "tmp/responsive";
mkdirSync(out, { recursive: true });

const VIEWPORTS = [
  ["phone-s", 360, 740, true],
  ["phone-l", 430, 932, true],
  ["tablet", 820, 1180, true],
  ["laptop", 1366, 768, false],
  ["wide", 1920, 1080, false],
];
const ROUTES = ["/", "/destinations", "/destinations/luxor", "/experiences", "/experiences/luxor-hot-air-balloon", "/journeys/family-journey", "/trip-builder?step=places", "/trip-builder?step=itinerary", "/trip-summary", "/booking?step=details", "/booking/confirmation?ref=WL-QA2X-TEST", "/faq"];

const SEEDED_TRIP = JSON.stringify({
  state: {
    startDate: "2027-03-10", month: "mar", adults: 2, children: 1, durationDays: 6, currency: "EGP", interests: [], tier: "comfort", tourStyle: "private", serviceIncluded: true, savedExperienceSlugs: [],
    confirmed: ["basics", "places", "stay", "experiences", "itinerary"], journeySlug: null,
    days: [
      { id: "a", destinationSlug: "cairo", items: [] },
      { id: "b", destinationSlug: "aswan", items: [{ id: "b1", kind: "experience", experienceSlug: "nile-cruise-aswan-to-luxor" }] },
      { id: "c", destinationSlug: "aswan", items: [] },
      { id: "d", destinationSlug: "luxor", items: [{ id: "d1", kind: "experience", experienceSlug: "luxor-hot-air-balloon" }, { id: "d2", kind: "experience", experienceSlug: "valley-of-the-kings-private" }, { id: "d3", kind: "free", note: "Pool afternoon" }] },
      { id: "e", destinationSlug: "luxor", items: [] },
    ],
  },
  version: 3,
});
const SEEDED_BOOKING = JSON.stringify({
  state: {
    details: { fullName: "Nour Hassan", email: "nour@example.com", phone: "+20 100 123 4567", country: "EG", contactMethod: "whatsapp" },
    preferences: { dietary: ["halal"], dietaryNotes: "", accessibility: "", roomType: "family", roomNotes: "", airportTransfer: "yes", occasion: "birthday", occasionNotes: "", additionalRequests: "" },
    consent: true,
    lastRequest: { reference: "WL-QA2X-TEST", createdAt: "2026-09-10T10:00:00.000Z", status: "received", language: "en", firstName: "Nour", trip: { startDate: "2027-03-10", month: "mar", durationDays: 6, adults: 2, children: 1, tier: "comfort", tourStyle: "private", serviceIncluded: true, currency: "EGP", interests: [], days: [{ destinationSlug: "cairo", experienceSlugs: [], notes: [] }, { destinationSlug: "aswan", experienceSlugs: ["nile-cruise-aswan-to-luxor"], notes: [] }, { destinationSlug: "luxor", experienceSlugs: ["luxor-hot-air-balloon"], notes: ["Pool afternoon"] }] }, estimate: { accommodation: 700, experiences: 900, transport: 300, serviceFee: 96, subtotal: 1900, total: 1996, perPerson: 665 }, traveller: { fullName: "Nour Hassan", email: "nour@example.com", phone: "+20 100 123 4567", country: "EG", contactMethod: "whatsapp" }, preferences: { dietary: ["halal"], dietaryNotes: "", accessibility: "", roomType: "family", roomNotes: "", airportTransfer: "yes", occasion: "birthday", occasionNotes: "", additionalRequests: "" } },
  },
  version: 1,
});

const b = await launch({ port: 9820 });
const problems = [];
for (const language of ["en", "ar"]) {
  await b.go(`${base}/?lng=${language}`, 1500);
  await b.ev(`localStorage.setItem('wanderlush.language', '${language}'); localStorage.setItem('wanderlush.trip', ${JSON.stringify(SEEDED_TRIP)}); localStorage.setItem('wanderlush.booking', ${JSON.stringify(SEEDED_BOOKING)});`);
  for (const [name, width, height, mobile] of VIEWPORTS) {
    await b.viewport({ width, height, mobile });
    for (const route of ROUTES) {
      await b.go(`${base}${route}`, 2200);
      const report = await b.ev(`(() => {
        const doc = document.documentElement;
        const overflow = doc.scrollWidth - doc.clientWidth;
        const off = [...document.querySelectorAll('main *, header *')].filter(e => {
          const r = e.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) return false;
          const s = getComputedStyle(e);
          return s.position !== 'fixed' && (r.left < -2 || r.right > doc.clientWidth + 2) && s.overflow !== 'hidden' && !e.closest('[class*=overflow-x-auto], [class*=overflow-hidden], svg');
        }).slice(0, 3).map(e => e.tagName.toLowerCase() + (e.className && typeof e.className === 'string' ? '.' + e.className.split(' ').slice(0, 2).join('.') : ''));
        return { overflow, off, h1: !!document.querySelector('h1') };
      })()`);
      const label = `${language} ${name} ${route}`;
      if (report.overflow > 0) problems.push(`${label}: overflow ${report.overflow}px`);
      if (report.off.length) problems.push(`${label}: outside the viewport: ${report.off.join(", ")}`);
      if (!report.h1) problems.push(`${label}: no h1`);
      const file = `${out}/${language}-${name}-${route.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "") || "home"}.jpg`;
      await b.shot(file, { full: mobile, quality: 55 });
      console.log(`${report.overflow > 0 || report.off.length ? "!!" : "ok"} ${label}`);
    }
  }
  const noise = b.drain().filter((e) => !/ERR_ABORTED|WL-QA2X-TEST|status of 404/.test(e));
  if (noise.length) problems.push(`${language}: console: ${noise.slice(0, 3).join(" | ")}`);
}
b.close();
console.log(problems.length ? `\n${problems.length} problems:\n${problems.map((p) => `  - ${p}`).join("\n")}` : "\nno overflow, nothing outside the viewport, a heading on every page");
process.exit(problems.length ? 1 : 0);
