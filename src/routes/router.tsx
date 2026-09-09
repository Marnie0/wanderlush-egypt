import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "@/components/layout/RootLayout";
import { HomePage } from "./HomePage";
import { DestinationsPage } from "./DestinationsPage";
import { DestinationDetailPage } from "./DestinationDetailPage";
import { ExperiencesPage } from "./ExperiencesPage";
import { ExperienceDetailPage } from "./ExperienceDetailPage";
import { JourneysPage } from "./JourneysPage";
import { JourneyDetailPage } from "./JourneyDetailPage";
import { AboutPage } from "./AboutPage";
import { FaqPage } from "./FaqPage";
import { PrivacyPage } from "./PrivacyPage";
import { NotFoundPage } from "./NotFoundPage";
import {
  BookingConfirmationPage,
  BookingPage,
  ContactPage,
  TripBuilderPage,
  TripSummaryPage,
} from "./StubPages";

/** The route table from the brief, in full, from the first deployment. */
export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <RootLayout />,
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
