/**
 * The portfolio screenshots: the pages that show what the site does, at
 * desktop and phone widths, in both languages, with a trip already built so
 * the builder, the estimate and the confirmation have something to show.
 *
 *   node scripts/portfolio-shots.mjs http://localhost:4174 docs/portfolio
 */
import { mkdirSync } from "node:fs";
import { launch } from "./lib/chrome.mjs";

const base = (process.argv[2] ?? "http://localhost:4174").replace(/\/$/, "");
const out = process.argv[3] ?? "docs/portfolio";
mkdirSync(out, { recursive: true });

const TRIP = JSON.stringify({
  state: {
    startDate: "2027-03-10", month: "mar", adults: 2, children: 1, durationDays: 8, currency: "USD", interests: ["history", "food"], tier: "comfort", tourStyle: "private", serviceIncluded: true, savedExperienceSlugs: ["luxor-hot-air-balloon"],
    confirmed: ["basics", "places", "stay", "experiences", "itinerary"], journeySlug: null,
    days: [
      { id: "a", destinationSlug: "giza", items: [{ id: "a1", kind: "experience", experienceSlug: "giza-pyramids-sunrise" }] },
      { id: "b", destinationSlug: "giza", items: [{ id: "b1", kind: "experience", experienceSlug: "grand-egyptian-museum-guided" }] },
      { id: "c", destinationSlug: "luxor", items: [{ id: "c1", kind: "experience", experienceSlug: "luxor-hot-air-balloon" }] },
      { id: "d", destinationSlug: "luxor", items: [{ id: "d1", kind: "experience", experienceSlug: "valley-of-the-kings-private" }, { id: "d2", kind: "experience", experienceSlug: "karnak-sound-and-light" }] },
      { id: "e", destinationSlug: "luxor", items: [{ id: "e1", kind: "free", note: "A late breakfast and the pool" }] },
      { id: "f", destinationSlug: "aswan", items: [{ id: "f1", kind: "experience", experienceSlug: "abu-simbel-sunrise" }] },
      { id: "g", destinationSlug: "aswan", items: [{ id: "g1", kind: "transport", note: "Morning flight to Cairo" }] },
      { id: "h", destinationSlug: "cairo", items: [] },
    ],
  },
  version: 3,
});
const BOOKING = JSON.stringify({
  state: {
    details: { fullName: "Nour Hassan", email: "nour@example.com", phone: "+20 100 123 4567", country: "EG", contactMethod: "whatsapp" },
    preferences: { dietary: ["halal"], dietaryNotes: "", accessibility: "", roomType: "family", roomNotes: "", airportTransfer: "yes", occasion: "birthday", occasionNotes: "", additionalRequests: "A quiet room, please." },
    consent: true,
    lastRequest: { reference: "WL-P68G-WP6U", createdAt: "2026-09-10T13:38:00.000Z", status: "received", language: "en", firstName: "Nour",
      trip: { startDate: "2027-03-10", month: "mar", durationDays: 8, adults: 2, children: 1, tier: "comfort", tourStyle: "private", serviceIncluded: true, currency: "USD", interests: [], days: [{ destinationSlug: "giza", experienceSlugs: ["giza-pyramids-sunrise"], notes: [] }, { destinationSlug: "giza", experienceSlugs: ["grand-egyptian-museum-guided"], notes: [] }, { destinationSlug: "luxor", experienceSlugs: ["luxor-hot-air-balloon"], notes: [] }, { destinationSlug: "luxor", experienceSlugs: ["valley-of-the-kings-private", "karnak-sound-and-light"], notes: [] }, { destinationSlug: "luxor", experienceSlugs: [], notes: ["A late breakfast and the pool"] }, { destinationSlug: "aswan", experienceSlugs: ["abu-simbel-sunrise"], notes: [] }, { destinationSlug: "aswan", experienceSlugs: [], notes: ["Morning flight to Cairo"] }, { destinationSlug: "cairo", experienceSlugs: [], notes: [] }] },
      estimate: { accommodation: 1450, experiences: 2924, transport: 795, serviceFee: 298, subtotal: 5169, total: 5467, perPerson: 1822 },
      traveller: { fullName: "Nour Hassan", email: "nour@example.com", phone: "+20 100 123 4567", country: "EG", contactMethod: "whatsapp" },
      preferences: { dietary: ["halal"], dietaryNotes: "", accessibility: "", roomType: "family", roomNotes: "", airportTransfer: "yes", occasion: "birthday", occasionNotes: "", additionalRequests: "A quiet room, please." } },
  },
  version: 1,
});

const SHOTS = [
  ["home", "/", "desktop"],
  ["home-mobile", "/", "mobile"],
  ["destinations-map", "/destinations", "desktop", "#map, main section:nth-of-type(2)"],
  ["destination-guide", "/destinations/luxor", "desktop"],
  ["experiences", "/experiences", "desktop", "#results, main .grid"],
  ["trip-builder-itinerary", "/trip-builder?step=itinerary", "desktop"],
  ["trip-builder-mobile", "/trip-builder?step=itinerary", "mobile"],
  ["trip-summary", "/trip-summary", "desktop"],
  ["booking", "/booking?step=details", "desktop"],
  ["booking-confirmation", "/booking/confirmation?ref=WL-P68G-WP6U", "desktop"],
  ["arabic-home", "/", "desktop", null, "ar"],
  ["arabic-trip-builder", "/trip-builder?step=itinerary", "desktop", null, "ar"],
  ["arabic-mobile-summary", "/trip-summary", "mobile", null, "ar"],
];

const b = await launch({ port: 9840 });
const seed = async (language) => {
  await b.go(`${base}/?lng=${language}`, 1500);
  await b.ev(`localStorage.setItem('wanderlush.language', '${language}'); localStorage.setItem('wanderlush.trip', ${JSON.stringify(TRIP)}); localStorage.setItem('wanderlush.booking', ${JSON.stringify(BOOKING)});`);
};
let current = "";
for (const [name, route, size, scrollTo, language = "en"] of SHOTS) {
  if (language !== current) {
    await seed(language);
    current = language;
  }
  await b.viewport(size === "mobile" ? { width: 390, height: 844, mobile: true } : { width: 1440, height: 900 });
  await b.go(`${base}${route}`, 3000);
  await b.ev("document.documentElement.style.scrollBehavior = 'auto'");
  if (scrollTo) {
    await b.ev(`(() => { const el = ${JSON.stringify(scrollTo)}.split(',').map(s => document.querySelector(s.trim())).find(Boolean); el?.scrollIntoView({ block: 'start' }); })()`);
    await b.sleep(1800);
  } else {
    // Scroll through so lazy pictures load, then back up, and let the entrances settle.
    await b.ev("window.scrollTo(0, document.body.scrollHeight)");
    await b.sleep(900);
    await b.ev("window.scrollTo(0, 0)");
    await b.sleep(1200);
  }
  await b.shot(`${out}/${name}.jpg`, { quality: 78 });
  console.log("wrote", `${out}/${name}.jpg`);
}
b.close();
