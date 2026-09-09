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

  // Escape closes, Tab stays inside the panel, and the page behind must not
  // scroll while the panel is up.
  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
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

      if (event.shiftKey && (active === first || !panelRef.current.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    const restoreFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
      restoreFocus?.focus?.();
    };
  }, [open, onClose]);

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
            className="absolute inset-y-0 end-0 flex w-[min(22rem,88vw)] flex-col bg-teal-800 text-ivory"
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
                        <span className="ms-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-ember-500 px-2 text-sm text-ivory">
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
