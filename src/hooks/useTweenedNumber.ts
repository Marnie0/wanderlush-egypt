import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { duration } from "@/lib/motion";

/**
 * A number that travels to its new value instead of jumping. A price that
 * changes under the reader's hands (another night, a better hotel, private
 * tours) reads as one figure moving, not two figures swapped.
 *
 * Under `prefers-reduced-motion` it snaps; so does the very first value,
 * which is a render, not a change.
 */
export function useTweenedNumber(target: number, seconds = duration.slow): number {
  const reduceMotion = useReducedMotion();
  const [shown, setShown] = useState(target);
  const fromRef = useRef(target);
  const shownRef = useRef(target);
  shownRef.current = shown;

  useEffect(() => {
    if (reduceMotion || shownRef.current === target) {
      fromRef.current = target;
      setShown(target);
      return;
    }
    const from = shownRef.current;
    fromRef.current = from;
    const start = performance.now();
    const total = seconds * 1000;
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / total);
      // The entrance curve: fast off the mark, then settling.
      const eased = 1 - Math.pow(1 - t, 3);
      const value = from + (target - from) * eased;
      setShown(t < 1 ? value : target);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, seconds, reduceMotion]);

  return shown;
}
