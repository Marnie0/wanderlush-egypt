import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, m } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/hooks/useDirection";
import { transitions } from "@/lib/motion";

/**
 * A side panel for controls that live in a sidebar on a wide screen. Escape
 * closes it, Tab stays inside, the page behind does not scroll, and it enters
 * from the trailing edge, which flips with the reading direction.
 */
export function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const { t } = useTranslation();
  const { isRtl } = useDirection();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  // Pages pass a fresh arrow each render, and every filter change re-renders
  // the page. Keyed on the callback, the effect would re-run on each change
  // and pull focus out of the search box mid-word, so the latest callback is
  // read through a ref and the effect follows `open` alone.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

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
    const previousOverflow = document.body.style.overflow;
    const restoreFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      restoreFocus?.focus?.();
    };
  }, [open]);

  // Rendered on the body so no animated ancestor can trap the panel in its own
  // stacking context, underneath the fixed header.
  return createPortal(
    <AnimatePresence>
      {open && (
        <m.div className="fixed inset-0 z-50" initial="hidden" animate="visible" exit="hidden">
          <m.button
            type="button"
            aria-label={t("gallery.close")}
            onClick={onClose}
            className="absolute inset-0 bg-charcoal-950/50"
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
            transition={transitions.soft}
          />
          <m.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            className="absolute inset-y-0 end-0 flex w-[min(26rem,92vw)] flex-col bg-canvas focus:outline-none"
            variants={{ hidden: { x: isRtl ? "-100%" : "100%" }, visible: { x: 0 } }}
            transition={transitions.soft}
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <h2 className="font-display text-xl text-charcoal-900">{title}</h2>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label={t("gallery.close")}
                className="rounded-sm p-2 text-charcoal-500 transition-colors hover:text-charcoal-900"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
            {footer && <div className="border-t border-line p-4">{footer}</div>}
          </m.div>
        </m.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
