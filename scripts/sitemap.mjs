/**
 * Writes public/sitemap.xml from the route table and the content slugs, so
 * every guide, experience and journey is discoverable without a crawler
 * having to run the app. Runs as part of `npm run build`.
 */
import { writeFileSync } from "node:fs";
import { destinations } from "../content/destinations.ts";
import { experiences } from "../content/experiences.ts";
import { journeys } from "../content/journeys.ts";

const ORIGIN = "https://wanderlush-egypt.vercel.app";
const STATIC = ["/", "/destinations", "/experiences", "/journeys", "/trip-builder", "/about", "/contact", "/faq", "/privacy"];

const paths = [
  ...STATIC,
  ...destinations.map((d) => `/destinations/${d.slug}`),
  ...experiences.map((e) => `/experiences/${e.slug}`),
  ...journeys.map((j) => `/journeys/${j.slug}`),
];

// Both languages share a URL; the Arabic version is reachable with ?lng=ar.
const urls = paths.map((path) => `  <url>
    <loc>${ORIGIN}${path}</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${ORIGIN}${path}" />
    <xhtml:link rel="alternate" hreflang="ar" href="${ORIGIN}${path}${path.includes("?") ? "&" : "?"}lng=ar" />
  </url>`);

writeFileSync(
  new URL("../public/sitemap.xml", import.meta.url),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join("\n")}\n</urlset>\n`,
);
console.log(`sitemap: ${paths.length} urls`);
