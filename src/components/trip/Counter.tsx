import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";

/**
 * A number with a minus and a plus. Typing into a box is faster on a
 * desktop, but on a phone two big buttons beat a keyboard that covers the
 * page, and the count is never outside its bounds.
 */
export function Counter({
  id,
  label,
  hint,
  value,
  min,
  max,
  onChange,
  language,
  decrementLabel,
  incrementLabel,
  className,
}: {
  id: string;
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
  language: string;
  decrementLabel: string;
  incrementLabel: string;
  className?: string;
}) {
  const button =
    "inline-flex h-11 w-11 items-center justify-center border border-charcoal-800/25 text-xl text-charcoal-800 transition-colors hover:border-charcoal-800/60 hover:bg-sand-100 disabled:cursor-not-allowed disabled:opacity-35";
  return (
    <div className={cn("flex items-center justify-between gap-6", className)}>
      <div>
        <span id={`${id}-label`} className="block text-charcoal-900">
          {label}
        </span>
        {hint && <p className="mt-0.5 text-sm text-ink-muted">{hint}</p>}
      </div>
      <div className="flex items-center gap-2" role="group" aria-labelledby={`${id}-label`}>
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={decrementLabel}
          className={button}
        >
          <span aria-hidden>−</span>
        </button>
        <output id={id} aria-live="polite" className="w-10 text-center font-display text-2xl tabular-nums text-charcoal-900">
          {formatNumber(value, language)}
        </output>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label={incrementLabel}
          className={button}
        >
          <span aria-hidden>+</span>
        </button>
      </div>
    </div>
  );
}
