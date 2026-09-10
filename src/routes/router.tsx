import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "@/components/layout/RootLayout";
import { RouteError } from "./RouteError";
import { HomePage } from "./HomePage";

/**
 * The homepage is bundled with the entry chunk because it is the landing
 * route. Everything else is split, so a first visit downloads the shell, the
 * hero and nothing it does not need.
 */
const DestinationsPage = lazy(() =>
  import("./DestinationsPage").then((m) => ({ default: m.DestinationsPage })),
);
const DestinationDetailPage = lazy(() =>
  import("./DestinationDetailPage").then((m) => ({ default: m.DestinationDetailPage })),
);
const ExperiencesPage = lazy(() =>
  import("./ExperiencesPage").then((m) => ({ default: m.ExperiencesPage })),
);
const ExperienceDetailPage = lazy(() =>
  import("./ExperienceDetailPage").then((m) => ({ default: m.ExperienceDetailPage })),
);
const JourneysPage = lazy(() =>
  import("./JourneysPage").then((m) => ({ default: m.JourneysPage })),
);
const JourneyDetailPage = lazy(() =>
  import("./JourneyDetailPage").then((m) => ({ default: m.JourneyDetailPage })),
);
const AboutPage = lazy(() => import("./AboutPage").then((m) => ({ default: m.AboutPage })));
const FaqPage = lazy(() => import("./FaqPage").then((m) => ({ default: m.FaqPage })));
const PrivacyPage = lazy(() => import("./PrivacyPage").then((m) => ({ default: m.PrivacyPage })));
const NotFoundPage = lazy(() =>
  import("./NotFoundPage").then((m) => ({ default: m.NotFoundPage })),
);
const TripBuilderPage = lazy(() =>
  import("./TripBuilderPage").then((m) => ({ default: m.TripBuilderPage })),
);
const TripSummaryPage = lazy(() =>
  import("./TripSummaryPage").then((m) => ({ default: m.TripSummaryPage })),
);
const BookingPage = lazy(() => import("./BookingPage").then((m) => ({ default: m.BookingPage })));
const BookingConfirmationPage = lazy(() =>
  import("./BookingConfirmationPage").then((m) => ({ default: m.BookingConfirmationPage })),
);
const ContactPage = lazy(() => import("./StubPages").then((m) => ({ default: m.ContactPage })));

/**
 * Fetch the chunks behind the main navigation once the landing page has gone
 * idle, so the first click opens instantly instead of waiting on a download.
 * Together they are under twenty kilobytes compressed. Skipped for anyone
 * who has asked the browser to save data.
 */
export function warmMainRoutes() {
  if ((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData) return;
  const warm = () => {
    void import("./DestinationsPage");
    void import("./DestinationDetailPage");
    void import("./ExperiencesPage");
    void import("./ExperienceDetailPage");
    void import("./JourneysPage");
    void import("./TripBuilderPage");
  };
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(warm, { timeout: 4000 });
  } else {
    window.setTimeout(warm, 2500);
  }
}

/** The route table from the brief, in full, from the first deployment. */
export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "destinations", element: <DestinationsPage /> },
      { path: "destinations/:slug", element: <DestinationDetailPage /> },
      { path: "experiences", element: <ExperiencesPage /> },
      { path: "experiences/:slug", element: <ExperienceDetailPage /> },
      { path: "journeys", element: <JourneysPage /> },
      { path: "journeys/:slug", element: <JourneyDetailPage /> },
      { path: "trip-builder", element: <TripBuilderPage /> },
      { path: "trip-summary", element: <TripSummaryPage /> },
      { path: "booking", element: <BookingPage /> },
      { path: "booking/confirmation", element: <BookingConfirmationPage /> },
      { path: "about", element: <AboutPage /> },
      { path: "contact", element: <ContactPage /> },
      { path: "faq", element: <FaqPage /> },
      { path: "privacy", element: <PrivacyPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
