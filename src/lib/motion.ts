import type { Transition, Variants } from "framer-motion";

/**
 * The motion vocabulary for the whole site. Components import from here so
 * that timing stays consistent, and so the feel can be tuned in one file.
 * The numbers mirror the CSS custom properties in `styles/index.css`.
 *
 * The rules, from the brief: a few signature sequences rather than motion
 * on everything; transforms and opacity only, so a phone keeps up; and the
 * system preference wins everywhere. `MotionConfig reducedMotion="user"` in
 * `main.tsx` turns every transform animation here into an instant change and
 * keeps only the opacity fades, which is what `prefers-reduced-motion`
 * asks for. Anything that animates by hand (`useTweenedNumber`, the SVG
 * route) reads `useReducedMotion()` and does the same.
 */
export const duration = {
  fast: 0.18,
  base: 0.32,
  slow: 0.64,
  cinematic: 1.2,
} as const;

export const ease = {
  soft: [0.22, 1, 0.36, 1],
  entrance: [0.16, 1, 0.3, 1],
  exit: [0.7, 0, 0.84, 0],
} as const;

export const transitions = {
  soft: { duration: duration.base, ease: ease.soft },
  entrance: { duration: duration.slow, ease: ease.entrance },
  cinematic: { duration: duration.cinematic, ease: ease.entrance },
  /** A small, settled spring for things that pop into place: a tick, a badge, a marker. */
  pop: { type: "spring", stiffness: 520, damping: 28, mass: 0.8 },
} satisfies Record<string, Transition>;

/** Content rising into place. The default for section entrances. */
export const riseIn: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: transitions.entrance },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transitions.soft },
};

/** A state change made visible: the element lands with a little weight. */
export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.6 },
  visible: { opacity: 1, scale: 1, transition: transitions.pop },
};

/** Parent of a list whose children rise in one after another. */
export const stagger = (delayChildren = 0.05, staggerChildren = 0.08): Variants => ({
  hidden: {},
  visible: { transition: { delayChildren, staggerChildren } },
});

/**
 * A step panel arriving from the direction of travel: the next step slides
 * in from the end edge, the previous one from the start edge. `direction`
 * is +1 or -1 in reading order; the caller mirrors it for RTL.
 */
export const stepPanel = (direction: number): Variants => ({
  hidden: { opacity: 0, x: 20 * direction },
  visible: { opacity: 1, x: 0, transition: transitions.entrance },
});

/** Standard viewport trigger: fire once, slightly before the element lands. */
export const viewportOnce = { once: true, margin: "-80px" } as const;
