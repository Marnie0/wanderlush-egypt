/**
 * Renders the trip PDF for a sample trip, in both languages, so the layout
 * can be looked at without clicking through the site:
 *
 *   npx tsx --tsconfig tsconfig.app.json scripts/pdf-sample.tsx <out-dir>
 *
 * Then `pdftoppm -r 70 -png <out-dir>/trip-en.pdf <out-dir>/trip-en` to see it.
 */
import React from "react";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import i18next from "i18next";
import { renderToFile } from "@react-pdf/renderer";
void React;
import en from "../src/i18n/locales/en.json";
import ar from "../src/i18n/locales/ar.json";
import { journeyBySlug } from "../content/journeys";
import { experienceBySlug } from "../content/experiences";
import { estimateTrip } from "../src/lib/estimate";
import { makeDays, newId, tripWarnings, type TripDay } from "../src/lib/trip-plan";
import { buildTripPdfData } from "../src/lib/trip-pdf";
import { TripDocument, registerPdfFonts } from "../src/pdf/TripDocument";

const out = resolve(process.argv[2] ?? "tmp");
mkdirSync(out, { recursive: true });

await i18next.init({ resources: { en: { translation: en }, ar: { translation: ar } }, lng: "en", fallbackLng: "en", interpolation: { escapeValue: false } });
registerPdfFonts(resolve("public/fonts/pdf") + "/");

// Giza, Luxor and Aswan over eight days, with a few experiences and a note or two.
const days: TripDay[] = [...makeDays("giza", 2), ...makeDays("luxor", 3), ...makeDays("aswan", 2), ...makeDays("cairo", 1)];
const add = (dayIndex: number, slug: string) => {
  if (!experienceBySlug.has(slug)) throw new Error(`no experience ${slug}`);
  days[dayIndex].items.push({ id: newId(), kind: "experience", experienceSlug: slug });
};
const firstIn = (destination: string) => [...experienceBySlug.values()].filter((e) => e.destinationSlug === destination).map((e) => e.slug);
const [giza1, giza2] = firstIn("giza");
const [luxor1, luxor2, luxor3] = firstIn("luxor");
const [aswan1] = firstIn("aswan");
add(0, giza1);
add(1, giza2);
add(2, luxor1);
add(3, luxor2);
add(3, luxor3);
days[4].items.push({ id: newId(), kind: "free", note: "A late breakfast and the pool" });
add(5, aswan1);
days[6].items.push({ id: newId(), kind: "transport", note: "Morning flight to Cairo" });

const trip = {
  startDate: "2027-03-10",
  month: "mar",
  durationDays: 8,
  adults: 2,
  children: 1,
  tier: "comfort" as const,
  tourStyle: "private" as const,
  serviceIncluded: true,
  currency: "USD",
  days,
};
const estimate = estimateTrip({ days, tier: trip.tier, adults: trip.adults, children: trip.children, tourStyle: trip.tourStyle, serviceIncluded: true });
const warnings = tripWarnings({ days, durationDays: 9, month: trip.month, children: trip.children });

for (const language of ["en", "ar"] as const) {
  await i18next.changeLanguage(language);
  const data = buildTripPdfData({
    t: i18next.t.bind(i18next),
    language,
    siteHost: "wanderlush-egypt.vercel.app",
    trip: { ...trip, currency: language === "ar" ? "EGP" : "USD" },
    estimate,
    warnings,
    unconfirmed: language === "ar" ? ["stay"] : [],
    journeyName: language === "en" ? null : journeyBySlug.get("ancient-egypt-discovery")?.name.ar ?? null,
    reference: language === "en" ? { value: "WL-P68G-WP6U", createdAt: new Date().toISOString() } : null,
    traveller: language === "en" ? { fullName: "Nour Hassan", email: "nour@example.com", phone: "+20 100 123 4567", country: "EG", contactMethod: "whatsapp" } : null,
    preferences: language === "en" ? { dietary: ["halal"], dietaryNotes: "", accessibility: "", roomType: "family", roomNotes: "", airportTransfer: "yes", occasion: "birthday", occasionNotes: "", additionalRequests: "A quiet room, please." } : null,
  });
  const file = resolve(out, `trip-${language}.pdf`);
  await renderToFile(<TripDocument data={data} />, file);
  console.log("wrote", file);
}
