import { Link } from "react-router-dom";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "onDark";
type Size = "sm" | "md" | "lg";

// A press moves the button by a pixel and back: felt more than seen, and
// the only thing here that is not a colour change.
const base =
  "inline-flex items-center justify-center gap-2 rounded-sm font-medium transition-[background-color,border-color,color,transform] duration-200 active:translate-y-px " +
  "focus-visible:outline-2 focus-visible:outline-offset-3 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-y-0";

const variants: Record<Variant, string> = {
  // Ivory on ember-500 is 3.97:1, short of the 4.5:1 that button text needs.
  primary: "bg-ember-600 text-ivory hover:bg-ember-700",
  secondary:
    "border border-charcoal-800/25 text-charcoal-800 hover:border-charcoal-800/60 hover:bg-sand-100",
  ghost: "text-charcoal-700 hover:bg-sand-100",
  onDark: "border border-ivory/40 text-ivory hover:border-ivory hover:bg-ivory/10",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-13 px-8 text-base",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

/** `ref` is an ordinary prop in React 19, so a dialog can focus its safe choice. */
interface ButtonProps extends React.ComponentPropsWithRef<"button"> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return <button className={buttonClasses(variant, size, className)} {...props} />;
}

interface ButtonLinkProps extends React.ComponentProps<typeof Link> {
  variant?: Variant;
  size?: Size;
}

export function ButtonLink({ variant, size, className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClasses(variant, size, className)} {...props} />;
}
