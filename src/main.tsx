import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { LazyMotion, MotionConfig, domAnimation } from "framer-motion";
import "./i18n";
import "./styles/index.css";
import { router } from "./routes/router";

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
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <RouterProvider router={router} />
      </MotionConfig>
    </LazyMotion>
  </StrictMode>,
);
