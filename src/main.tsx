import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { LazyMotion, MotionConfig, domAnimation } from "framer-motion";
import { ready as i18nReady } from "./i18n";
// Fonts are served from this origin with the rest of the bundle. The Google
// Fonts stylesheet was render-blocking and cost two extra connections before
// a single word could paint; these files are subset by script, so a visitor
// only downloads the alphabet they are reading. Inter is Latin-only because
// the Arabic side uses IBM Plex Sans Arabic for everything, including the
// Latin words inside Arabic text.
import "@fontsource-variable/fraunces/opsz.css";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/amiri/400.css";
import "@fontsource/amiri/700.css";
import "@fontsource/ibm-plex-sans-arabic/400.css";
import "@fontsource/ibm-plex-sans-arabic/500.css";
import "@fontsource/ibm-plex-sans-arabic/600.css";
import "./styles/index.css";
import { router, warmMainRoutes } from "./routes/router";

/**
 * `LazyMotion` with the `domAnimation` feature set ships animations, exit
 * animations, in-view triggers and pointer gestures, and leaves out drag,
 * pan and layout projection. Components use `m.*` rather than `motion.*`;
 * `strict` makes any slip a build-time error rather than a silent bloat.
 *
 * Phase 5 introduces drag-and-drop in the itinerary editor, which will need
 * the `domMax` feature set on that route.
 *
 * `reducedMotion="user"` makes Framer honour the system preference. The CSS
 * media query cannot do this on its own because these are JavaScript-driven
 * animations, not CSS transitions.
 */
// Strings before pixels: an Arabic visitor's bundle is a separate chunk, and
// the first render waits for it. A promise rather than a top-level await,
// which would turn the entry into a graph of tiny chunks.
void i18nReady.then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <LazyMotion features={domAnimation} strict>
        <MotionConfig reducedMotion="user">
          <RouterProvider router={router} />
        </MotionConfig>
      </LazyMotion>
    </StrictMode>,
  );
  warmMainRoutes();
});
