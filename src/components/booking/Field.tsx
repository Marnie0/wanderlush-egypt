import { cn } from "@/lib/cn";

/**
 * A labelled control with its hint and its error wired up: the error is
 * both visible and announced, and the control says it is invalid.
 */
export function Field({
  id,
  label,
  hint,
  error,
  optional,
  className,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  /** The word "optional" beside the label, so the required ones need no asterisk. */
  optional?: string;
  className?: string;
  children: (props: { id: string; "aria-describedby": string | undefined; "aria-invalid": true | undefined }) => React.ReactNode;
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-charcoal-900">
        {label}
        {optional && <span className="ms-2 text-xs font-normal text-ink-muted">{optional}</span>}
      </label>
      {hint && (
        <p id={hintId} className="mt-1 text-xs leading-relaxed text-ink-muted">
          {hint}
        </p>
      )}
      <div className="mt-2">{children({ id, "aria-describedby": describedBy, "aria-invalid": error ? true : undefined })}</div>
      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-ember-700">
          {error}
        </p>
      )}
    </div>
  );
}

export const inputClasses = (invalid?: boolean) =>
  cn(
    "w-full border bg-canvas px-3 py-2.5 text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none",
    invalid ? "border-ember-600 focus:border-ember-700" : "border-line focus:border-ember-500",
  );

/** Radio cards: the same look as the estimate's tour choice, one per option. */
export function RadioCards<Value extends string>({
  name,
  legend,
  value,
  options,
  onChange,
  columns = 3,
}: {
  name: string;
  legend: string;
  value: Value;
  options: { value: Value; label: string; hint?: string }[];
  onChange: (value: Value) => void;
  columns?: 2 | 3;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-charcoal-900">{legend}</legend>
      <div className={cn("mt-2 grid gap-2", columns === 3 ? "sm:grid-cols-3" : "grid-cols-2")}>
        {options.map((option) => {
          const active = option.value === value;
          return (
            <label
              key={option.value}
              className={cn(
                "cursor-pointer rounded-sm border px-3 py-3 text-start transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ember-500 has-[:focus-visible]:ring-offset-2",
                active ? "border-charcoal-800 bg-charcoal-800 text-ivory" : "border-line text-charcoal-700 hover:border-charcoal-800/50 hover:bg-sand-100",
              )}
            >
              <input type="radio" name={name} value={option.value} checked={active} onChange={() => onChange(option.value)} className="sr-only" />
              <span className="block text-sm font-medium">{option.label}</span>
              {option.hint && <span className={cn("mt-0.5 block text-xs leading-snug", active ? "text-ivory/80" : "text-ink-muted")}>{option.hint}</span>}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
