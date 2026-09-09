import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/Icon";
import { pick } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Destination } from "@content/types";

/**
 * The quick destination search from the hero. A combobox rather than a form:
 * there is nothing to submit, every match is a real place, and choosing one
 * goes straight to its guide.
 */
export function DestinationSearch({ className }: { className?: string }) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? "en";
  const navigate = useNavigate();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const [destinations, setDestinations] = useState<Destination[]>([]);

  // The catalogue is far larger than a search box needs at first paint, so it
  // is fetched once the browser is idle. The same module backs the sections
  // below the hero, so this is usually a cache hit by the time anyone types.
  useEffect(() => {
    let cancelled = false;
    const load = () => {
      void import("@content/destinations").then((module) => {
        if (!cancelled) setDestinations(module.destinations);
      });
    };
    const idle = window.requestIdleCallback?.(load, { timeout: 1500 });
    if (idle === undefined) {
      const timer = window.setTimeout(load, 300);
      return () => {
        cancelled = true;
        window.clearTimeout(timer);
      };
    }
    return () => {
      cancelled = true;
      window.cancelIdleCallback?.(idle);
    };
  }, []);

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return destinations.slice(0, 6);
    return destinations
      .filter((destination) => {
        const haystack = [
          destination.name.en,
          destination.name.ar,
          destination.tagline.en,
          destination.tagline.ar,
          destination.region,
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(needle);
      })
      .slice(0, 6);
  }, [query, destinations]);

  const go = (slug: string) => {
    setOpen(false);
    setQuery("");
    navigate(`/destinations/${slug}`);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) setOpen(true);
      setHighlighted((current) => {
        const next = event.key === "ArrowDown" ? current + 1 : current - 1;
        return (next + matches.length) % Math.max(matches.length, 1);
      });
    } else if (event.key === "Enter") {
      const match = matches[highlighted];
      if (match) {
        event.preventDefault();
        go(match.slug);
      }
    } else if (event.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className={cn("relative w-full max-w-md", className)}>
      <div className="flex items-center gap-3 border-b border-ivory/40 pb-3 transition-colors focus-within:border-ivory">
        <Icon name="search" size={20} className="text-ivory/70" />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-label={t("home.searchLabel")}
          placeholder={t("home.heroSearch")}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setHighlighted(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          onKeyDown={onKeyDown}
          className="w-full bg-transparent text-lg text-ivory placeholder:text-ivory/60 focus:outline-none"
        />
      </div>

      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-full z-30 mt-2 max-h-80 overflow-y-auto border border-line bg-canvas py-1 shadow-lg"
        >
          {matches.length === 0 && (
            <li className="px-4 py-3 text-sm text-ink-muted">
              {destinations.length === 0 ? t("common.loading") : t("home.searchNoResults")}
            </li>
          )}
          {matches.map((destination, index) => (
            <li key={destination.slug} role="option" aria-selected={index === highlighted}>
              <button
                type="button"
                // The input's blur fires first on click, so commit on mousedown.
                onMouseDown={(event) => {
                  event.preventDefault();
                  go(destination.slug);
                }}
                onMouseEnter={() => setHighlighted(index)}
                className={cn(
                  "flex w-full items-baseline justify-between gap-4 px-4 py-3 text-start transition-colors",
                  index === highlighted ? "bg-sand-100" : "bg-transparent",
                )}
              >
                <span className="font-display text-lg text-charcoal-900">
                  {pick(destination.name, language)}
                </span>
                <span className="text-xs text-ink-muted">
                  {t(`regions.${destination.region}`)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
