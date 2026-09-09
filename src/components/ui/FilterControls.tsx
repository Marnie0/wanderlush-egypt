import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";
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

/**
 * The search box keeps its own text and reports it a beat after typing
 * stops. Writing every keystroke straight into the URL had two costs: the
 * whole result grid re-rendered per character, and because the URL holds a
 * trimmed query, the trailing space of "hot air" was stripped back out of
 * the box before the next letter arrived, so two-word searches could not be
 * typed at all.
 */
export function FilterSearch({
  id,
  label,
  placeholder,
  value,
  onChange,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (next: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  const lastSent = useRef(value);

  // A change that arrived from outside: a chip cleared it, or a link loaded
  // with a query already set.
  useEffect(() => {
    if (value.trim() !== lastSent.current.trim()) {
      lastSent.current = value;
      setDraft(value);
    }
  }, [value]);

  useEffect(() => {
    if (draft.trim() === lastSent.current.trim()) return;
    const handle = setTimeout(() => {
      lastSent.current = draft;
      onChange(draft);
    }, 160);
    return () => clearTimeout(handle);
  }, [draft, onChange]);

  return (
    <div>
      <label htmlFor={id} className="eyebrow text-ink-muted">
        {label}
      </label>
      <div className="mt-3 flex items-center gap-3 border border-line bg-canvas px-4 py-3 transition-colors focus-within:border-ember-500">
        <Icon name="search" size={18} className="shrink-0 text-charcoal-400" />
        <input
          id={id}
          type="search"
          value={draft}
          placeholder={placeholder}
          onChange={(event) => setDraft(event.target.value)}
          className="min-w-0 w-full bg-transparent text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none"
        />
      </div>
    </div>
  );
}
