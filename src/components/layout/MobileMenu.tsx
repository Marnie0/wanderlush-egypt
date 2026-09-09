import { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AnimatePresence, m } from "framer-motion";
import { primaryNav } from "./navItems";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ButtonLink } from "@/components/ui/Button";
import { useDirection } from "@/hooks/useDirection";
import { transitions } from "@/lib/motion";
import { useTripCount } from "@/lib/trip-store";

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const { isRtl } = useDirection();
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const tripCount = useTripCount();
  // Read through a ref so the header re-rendering (a scroll, a language
  // change) does not re-run the effect and pull focus back to the close button.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Escape closes, Tab stays inside the panel, and the page behind must not
  // scroll while the panel is up.
  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      const outside = !panelRef.current.contains(active);
      if (event.shiftKey && (active === first || outside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || outside)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    const restoreFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    // The panel is hidden by CSS past the desktop breakpoint, but the scroll
    // lock and the key trap would stay. Rotating a tablet must not leave a
    // desktop page that cannot scroll.
    const desktop = window.matchMedia("(min-width: 64rem)");
    const onResize = (event: MediaQueryListEvent) => {
      if (event.matches) onCloseRef.current();
    };
    desktop.addEventListener("change", onResize);

    return () => {
      document.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onResize);
      document.body.style.overflow = previous;
      restoreFocus?.focus?.();
    };
  }, [open]);

  // The panel enters from the trailing edge, which flips with direction.
  const offscreen = isRtl ? "-100%" : "100%";

  return (
    <AnimatePresence>
      {open && (
        <m.div
          className="fixed inset-0 z-50 lg:hidden"
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <m.button
            type="button"
            aria-label={t("nav.closeMenu")}
            onClick={onClose}
            className="absolute inset-0 bg-charcoal-950/60"
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
            transition={transitions.soft}
          />
          <m.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={t("nav.primaryLabel")}
            tabIndex={-1}
            className="absolute inset-y-0 end-0 flex w-[min(22rem,88vw)] flex-col bg-teal-800 text-ivory focus:outline-none"
            variants={{ hidden: { x: offscreen }, visible: { x: 0 } }}
            transition={transitions.soft}
          >
            <div className="flex items-center justify-between border-b border-ivory/15 px-6 py-5">
              <LanguageSwitcher onDark />
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label={t("nav.closeMenu")}
                className="rounded-sm p-2 text-ivory/80 transition-colors hover:text-ivory"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-6 py-8">
              <ul className="space-y-1">
                {primaryNav.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      onClick={onClose}
                      className={({ isActive }) =>
                        [
                          "block border-b border-ivory/10 py-4 font-display text-2xl transition-colors",
                          isActive ? "text-gold-300" : "text-ivory hover:text-gold-200",
                        ].join(" ")
                      }
                    >
                      {t(item.key)}
                      {item.to === "/trip-builder" && tripCount > 0 && (
                        <span className="ms-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-ember-600 px-2 text-sm text-ivory">
                          {tripCount}
                        </span>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="border-t border-ivory/15 p-6">
              <ButtonLink to="/trip-builder" size="lg" onClick={onClose} className="w-full">
                {t("nav.startPlanning")}
              </ButtonLink>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
