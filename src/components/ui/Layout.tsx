import { cn } from "@/lib/cn";

export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[82rem] px-5 sm:px-8 lg:px-12", className)}>
      {children}
    </div>
  );
}

export function Section({
  className,
  children,
  id,
}: {
  className?: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className={cn("py-section lg:py-section-lg", className)}>
      {children}
    </section>
  );
}

/**
 * Small uppercase label above a heading. Arabic drops the tracking. Where the
 * eyebrow is the only title a section has, render it as the heading it is,
 * so the outline reads h1, h2, h3 rather than jumping straight to h3.
 */
export function Eyebrow({
  as: Tag = "p",
  className,
  children,
}: {
  as?: "p" | "h2" | "h3";
  className?: string;
  children: React.ReactNode;
}) {
  return <Tag className={cn("eyebrow text-ember-600", className)}>{children}</Tag>;
}

/** A short gold rule used to separate editorial blocks. */
export function Rule({ className }: { className?: string }) {
  return <div aria-hidden className={cn("rule-gold h-px w-24", className)} />;
}
