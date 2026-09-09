import { cn } from "@/lib/cn";

/**
 * The shared vocabulary of both filter panels. Every control is a toggle
 * button rather than a select, so the current state is visible without
 * opening anything and the panel behaves the same inside a drawer.
 */
export function FilterToggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "border px-3.5 py-2 text-sm transition-colors",
        active
          ? "border-charcoal-800 bg-charcoal-800 text-ivory"
          : "border-line text-charcoal-600 hover:border-charcoal-800/50 hover:bg-sand-100",
      )}
    >
      {children}
    </button>
  );
}

export function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="eyebrow text-ink-muted">{label}</legend>
      <div className="mt-3 flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}
