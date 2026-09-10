import { Suspense, useEffect } from "react";
import { Outlet, ScrollRestoration, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { m } from "framer-motion";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { RouteFallback } from "@/components/ui/RouteFallback";
import { Toast } from "@/components/ui/Toast";
import { fadeIn } from "@/lib/motion";
import { useHeaderStore } from "@/lib/header-store";

/**
 * The homepage and destination guides open on full-bleed photography, so the
 * header floats over them. Every other route gets a solid bar and top padding.
 *
 * Each route fades in as it arrives. There is no exit: an outgoing page kept
 * on screen would hold the scroll position and double the document while
 * the new one loads. Keyed on the path only, so a filter or a builder step
 * (which live in the query string) does not re-run it; those have their own
 * motion.
 */
const TRANSPARENT_HEADER = [/^\/$/, /^\/destinations\/[^/]+$/, /^\/journeys\/[^/]+$/];

export function RootLayout() {
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();
  const solid = useHeaderStore((state) => state.solid);
  const transparent = !solid && TRANSPARENT_HEADER.some((pattern) => pattern.test(pathname));

  // Keep the document language in step when i18next resolves asynchronously.
  useEffect(() => {
    document.documentElement.lang = i18n.resolvedLanguage ?? "en";
  }, [i18n.resolvedLanguage]);

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <a
        href="#main"
        className="sr-only rounded-sm bg-ember-600 px-4 py-2 text-ivory focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50"
      >
        {t("nav.skipToContent")}
      </a>
      <Header transparent={transparent} />
      <main id="main" className={transparent ? "flex-1" : "flex-1 pt-20"}>
        <Suspense fallback={<RouteFallback />}>
          <m.div key={pathname} initial="hidden" animate="visible" variants={fadeIn}>
            <Outlet />
          </m.div>
        </Suspense>
      </main>
      <Footer />
      <Toast />
      {/* Every fresh load has the key "default", so without this a page
          opened from the address bar restores the scroll position of the
          last page opened that way. A fresh load is keyed by its URL
          instead, which also gives a reload its own position back. */}
      <ScrollRestoration getKey={(location) => (location.key === "default" ? location.pathname + location.search : location.key)} />
    </div>
  );
}
