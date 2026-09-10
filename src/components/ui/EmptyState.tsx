import { m } from "framer-motion";
import { Icon, type IconName } from "./Icon";
import { fadeIn } from "@/lib/motion";
import { cn } from "@/lib/cn";

/**
 * The one shape for "nothing here yet": a mark, a heading that says what is
 * missing, a line that says what to do, and the action that does it. The
 * same block stands in for empty filters, an unplanned trip and a booking
 * reference that leads nowhere, so a visitor learns it once.
 */
export function EmptyState({
  icon = "compass",
  title,
  body,
  action,
  className,
  headingLevel: Heading = "h2",
}: {
  icon?: IconName;
  title: string;
  body: string;
  action?: React.ReactNode;
  className?: string;
  headingLevel?: "h1" | "h2";
}) {
  return (
    <m.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className={cn("border border-line bg-sand-50 px-6 py-14 text-center", className)}
    >
      <span
        aria-hidden
        className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-gold-300 bg-gold-50 text-gold-600"
      >
        <Icon name={icon} size={22} />
      </span>
      <Heading className="mt-5 font-display text-2xl text-charcoal-900">{title}</Heading>
      <p className="mx-auto mt-3 max-w-md leading-relaxed text-charcoal-600">{body}</p>
      {action && <div className="mt-8 flex flex-wrap justify-center gap-3">{action}</div>}
    </m.div>
  );
}
