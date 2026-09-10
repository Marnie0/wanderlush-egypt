import { useEffect } from "react";
import { useTranslation } from "react-i18next";

/**
 * Everything a page says about itself to a browser tab, a search engine and
 * a link preview: title, description, canonical address, the other language,
 * the social card, and structured data where a page describes one thing.
 * Tags are created once and updated in place, so a page never inherits the
 * previous page's description or leaves a stale card behind.
 */

const ORIGIN = "https://wanderlush-egypt.vercel.app";
const SOCIAL_IMAGE = `${ORIGIN}/social-preview.jpg`;

export interface PageMetaOptions {
  /** A page that only shows the visitor's own trip has nothing for a search engine. */
  noindex?: boolean;
  /** A photograph for the link preview, when the page has one better than the site's card. */
  image?: string;
  /** JSON-LD for the thing the page describes. */
  structuredData?: Record<string, unknown> | null;
}

function meta(attribute: "name" | "property", key: string): HTMLMetaElement {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }
  return tag;
}

function link(rel: string, extra: Record<string, string> = {}): HTMLLinkElement {
  const selector = `link[rel="${rel}"]${Object.entries(extra).map(([k, v]) => `[${k}="${v}"]`).join("")}`;
  let tag = document.head.querySelector<HTMLLinkElement>(selector);
  if (!tag) {
    tag = document.createElement("link");
    tag.rel = rel;
    for (const [k, v] of Object.entries(extra)) tag.setAttribute(k, v);
    document.head.appendChild(tag);
  }
  return tag;
}

/** The address of this page in the other language, and the canonical one without any language mark. */
function addresses() {
  const url = new URL(window.location.href);
  url.searchParams.delete("lng");
  url.hash = "";
  const canonical = `${ORIGIN}${url.pathname}${url.search}`;
  const arabic = new URL(canonical);
  arabic.searchParams.set("lng", "ar");
  return { canonical, english: canonical, arabic: arabic.toString() };
}

export function usePageMeta(title?: string, description?: string, options: PageMetaOptions = {}) {
  const { t, i18n } = useTranslation();
  const brand = t("brand.name");
  const language = i18n.resolvedLanguage ?? "en";
  const { noindex = false, image, structuredData = null } = options;
  const structured = structuredData ? JSON.stringify(structuredData) : null;

  useEffect(() => {
    const fullTitle = title ? `${title} — ${brand}` : `${brand} — ${t("brand.tagline")}`;
    const text = description ?? t("brand.shortDescription");
    const { canonical, english, arabic } = addresses();
    const isArabic = language.startsWith("ar");

    document.title = fullTitle;
    meta("name", "description").content = text;

    link("canonical").href = canonical;
    link("alternate", { hreflang: "en" }).href = english;
    link("alternate", { hreflang: "ar" }).href = arabic;
    link("alternate", { hreflang: "x-default" }).href = english;

    meta("property", "og:type").content = "website";
    meta("property", "og:site_name").content = brand;
    meta("property", "og:title").content = title ?? brand;
    meta("property", "og:description").content = text;
    meta("property", "og:url").content = isArabic ? arabic : canonical;
    meta("property", "og:image").content = image ?? SOCIAL_IMAGE;
    meta("property", "og:image:width").content = "1200";
    meta("property", "og:image:height").content = "630";
    meta("property", "og:locale").content = isArabic ? "ar_EG" : "en_GB";
    meta("property", "og:locale:alternate").content = isArabic ? "en_GB" : "ar_EG";
    meta("name", "twitter:card").content = "summary_large_image";
    meta("name", "twitter:title").content = title ?? brand;
    meta("name", "twitter:description").content = text;
    meta("name", "twitter:image").content = image ?? SOCIAL_IMAGE;

    const robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (noindex) meta("name", "robots").content = "noindex";
    else robots?.remove();

    let script = document.head.querySelector<HTMLScriptElement>('script[type="application/ld+json"][data-page]');
    if (structured) {
      if (!script) {
        script = document.createElement("script");
        script.type = "application/ld+json";
        script.dataset.page = "true";
        document.head.appendChild(script);
      }
      script.textContent = structured;
    } else {
      script?.remove();
    }
  }, [title, description, brand, t, language, noindex, image, structured]);
}

/** The site itself, for the homepage: who this is and where the search is. */
export function organisationData(brand: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "TravelAgency", "@id": `${ORIGIN}/#organization`, name: brand, url: ORIGIN, logo: `${ORIGIN}/icon-512.png`, description, areaServed: { "@type": "Country", name: "Egypt" } },
      { "@type": "WebSite", "@id": `${ORIGIN}/#website`, url: ORIGIN, name: brand, inLanguage: ["en", "ar"], publisher: { "@id": `${ORIGIN}/#organization` } },
    ],
  };
}

export { ORIGIN as SITE_ORIGIN };
