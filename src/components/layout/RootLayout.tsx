import { useEffect } from "react";
import { Outlet, ScrollRestoration, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Header } from "./Header";
import { Footer } from "./Footer";

/**
 * The homepage and destination guides open on full-bleed photography, so the
 * header floats over them. Every other route gets a solid bar and top padding.
 */
const TRANSPARENT_HEADER = [/^\/$/, /^\/destinations\/[^/]+$/, /^\/journeys\/[^/]+$/];

export function RootLayout() {
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();
  const transparent = TRANSPARENT_HEADER.some((pattern) => pattern.test(pathname));

  // Keep the document language in step when i18next resolves asynchronously.
  useEffect(() => {
    document.documentElement.lang = i18n.resolvedLanguage ?? "en";
  }, [i18n.resolvedLanguage]);

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <a
        href="#main"
        className="sr-only rounded-sm bg-ember-500 px-4 py-2 text-ivory focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50"
      >
        {t("nav.skipToContent")}
      </a>
      <Header transparent={transparent} />
      <main id="main" className={transparent ? "flex-1" : "flex-1 pt-20"}>
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  );
}
