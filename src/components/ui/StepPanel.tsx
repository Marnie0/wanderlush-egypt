import { useRef } from "react";
import { m } from "framer-motion";
import { useDirection } from "@/hooks/useDirection";
import { stepPanel } from "@/lib/motion";

/**
 * The body of a multi-step page. When the step changes the new panel slides
 * in from the direction of travel: forward from the end edge, back from the
 * start edge, mirrored in Arabic. There is no exit animation on purpose,
 * because two panels on screen at once would double the page height and
 * push the footer about; the old one simply gives way.
 */
export function StepPanel({ step, index, children }: { step: string; index: number; children: React.ReactNode }) {
  const { isRtl } = useDirection();
  const lastIndex = useRef(index);
  const forward = index >= lastIndex.current;
  lastIndex.current = index;
  const direction = (forward ? 1 : -1) * (isRtl ? -1 : 1);
  return (
    <m.div key={step} initial="hidden" animate="visible" variants={stepPanel(direction)}>
      {children}
    </m.div>
  );
}
