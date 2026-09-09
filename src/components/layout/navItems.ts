/** One list, used by the header, the mobile menu and the footer. */
export const primaryNav = [
  { to: "/destinations", key: "nav.destinations" },
  { to: "/experiences", key: "nav.experiences" },
  { to: "/journeys", key: "nav.journeys" },
  { to: "/trip-builder", key: "nav.tripBuilder" },
  { to: "/about", key: "nav.about" },
] as const;

export const footerPlanNav = [
  { to: "/trip-builder", key: "nav.tripBuilder" },
  { to: "/trip-summary", key: "meta.tripSummary" },
  { to: "/booking", key: "meta.booking" },
  { to: "/faq", key: "nav.faq" },
] as const;

export const footerCompanyNav = [
  { to: "/about", key: "nav.about" },
  { to: "/contact", key: "nav.contact" },
  { to: "/privacy", key: "nav.privacy" },
] as const;
