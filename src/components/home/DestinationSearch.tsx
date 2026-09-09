import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/Icon";
import { normalizeSearch, pick } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Destination } from "@content/types";

const LIST_MAX_HEIGHT = 336;
const MIN_ROOM_BELOW = 200;

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
  const optionId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [placement, setPlacement] = useState({ up: false, maxHeight: LIST_MAX_HEIGHT });

  // The catalogue is far larger than a search box needs at first paint, so it
  // is fetched once the browser is idle, and immediately if someone reaches
  // the field before that happens.
  const loaded = useRef(false);
  const loadCatalogue = useCallback(() => {
    if (loaded.current) return;
    loaded.current = true;
    void import("@content/destinations").then((module) => setDestinations(module.destinations));
  }, []);

  useEffect(() => {
    const idle = window.requestIdleCallback?.(loadCatalogue, { timeout: 2000 });
    if (idle === undefined) {
      const timer = window.setTimeout(loadCatalogue, 400);
      return () => window.clearTimeout(timer);
    }
    return () => window.cancelIdleCallback?.(idle);
  }, [loadCatalogue]);

  // Names, taglines, regions and the sights themselves, so "pyramids"
  // suggests Giza rather than reporting that no destination matches.
  const matches = useMemo(() => {
    const needle = normalizeSearch(query.trim());
    if (!needle) return destinations;
    return destinations.filter((destination) =>
      normalizeSearch(
        [
          destination.name.en,
          destination.name.ar,
          destination.tagline.en,
          destination.tagline.ar,
          destination.region.replace(/-/g, " "),
          t(`regions.${destination.region}`),
          ...destination.attractions.flatMap((attraction) => [attraction.name.en, attraction.name.ar]),
        ].join(" "),
      ).includes(needle),
    );
  }, [query, destinations, t]);

  /**
   * Prefer opening downward and shrink to the room available, since flipping
   * up covers the headline. Only flip when there is genuinely no space below.
   */
  const openList = () => {
    loadCatalogue();
    const rect = fieldRef.current?.getBoundingClientRect();
    if (rect) {
      const below = window.innerHeight - rect.bottom - 16;
      const above = rect.top - 16;
      setPlacement(
        below >= MIN_ROOM_BELOW || below >= above
          ? { up: false, maxHeight: Math.min(LIST_MAX_HEIGHT, below) }
          : { up: true, maxHeight: Math.min(LIST_MAX_HEIGHT, above) },
      );
    }
    setOpen(true);
  };

  const go = (slug: string) => {
    setOpen(false);
    setQuery("");
    navigate(`/destinations/${slug}`);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) openList();
      setHighlighted((current) => {
        const next = event.key === "ArrowDown" ? current + 1 : current - 1;
        return (next + matches.length) % Math.max(matches.length, 1);
      });
    } else if (event.key === "Enter") {
      const match = matches[highlighted];
      event.preventDefault();
      if (match) {
        go(match.slug);
      } else if (query.trim()) {
        // Nothing here matched, so hand the words to the explorer, which
        // searches more than names and can show the filters beside them.
        setOpen(false);
        navigate(`/destinations?q=${encodeURIComponent(query.trim())}`);
      }
    } else if (event.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className={cn("relative w-full max-w-lg", className)}>
      <div
        ref={fieldRef}
        className="flex items-center gap-3 border border-ivory/25 bg-ivory/95 px-4 py-3.5 shadow-lg backdrop-blur-sm transition-colors focus-within:border-ember-500 sm:px-5"
      >
        <Icon name="search" size={20} className="text-charcoal-400" />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={open && matches[highlighted] ? `${optionId}-${highlighted}` : undefined}
          aria-label={t("home.searchLabel")}
          placeholder={t("home.heroSearch")}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setHighlighted(0);
            openList();
          }}
          onFocus={openList}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          onKeyDown={onKeyDown}
          className="w-full bg-transparent text-base text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none sm:text-lg"
        />
        <span className="hidden shrink-0 text-xs text-ink-muted sm:block">
          {t("explore.resultCount", { count: destinations.length || 10 })}
        </span>
      </div>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={t("home.searchLabel")}
          style={{ maxHeight: placement.maxHeight }}
          className={cn(
            "absolute inset-x-0 z-40 overflow-y-auto border border-line bg-canvas py-1 shadow-2xl",
            placement.up ? "bottom-full mb-2" : "top-full mt-2",
          )}
        >
          {matches.length === 0 && (
            <li role="option" aria-selected={false} aria-disabled className="px-4 py-3 text-sm text-ink-muted">
              {destinations.length === 0 ? t("common.loading") : t("home.searchNoResults")}
            </li>
          )}
          {/* The option is the clickable row itself: a button inside an
              option is not allowed, an option's children are presentational. */}
          {matches.map((destination, index) => (
            <li
              key={destination.slug}
              id={`${optionId}-${index}`}
              role="option"
              aria-selected={index === highlighted}
              // The input's blur fires first on click, so commit on mousedown.
              onMouseDown={(event) => {
                event.preventDefault();
                go(destination.slug);
              }}
              onMouseEnter={() => setHighlighted(index)}
              className={cn(
                "flex cursor-pointer items-baseline justify-between gap-4 px-4 py-3 text-start transition-colors",
                index === highlighted ? "bg-sand-100" : "bg-transparent",
              )}
            >
              <span className="font-display text-lg text-charcoal-900">
                {pick(destination.name, language)}
              </span>
              <span className="shrink-0 text-xs text-ink-muted">
                {t(`regions.${destination.region}`)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
