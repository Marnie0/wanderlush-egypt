import type { Transition, Variants } from "framer-motion";

/**
 * The motion vocabulary for the whole site. Components import from here so
 * that timing stays consistent, and so Phase 9 can tune the feel in one file.
 * The numbers mirror the CSS custom properties in `styles/index.css`.
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

/** Parent of a list whose children rise in one after another. */
export const stagger = (delayChildren = 0.05, staggerChildren = 0.08): Variants => ({
  hidden: {},
  visible: { transition: { delayChildren, staggerChildren } },
});

/** Standard viewport trigger: fire once, slightly before the element lands. */
export const viewportOnce = { once: true, margin: "-80px" } as const;
