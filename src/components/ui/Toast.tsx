import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AnimatePresence, m } from "framer-motion";
import { useToastStore } from "@/lib/toast-store";
import { transitions } from "@/lib/motion";

const SHOWN_FOR_MS = 4500;

/**
 * The bridge from browsing to planning. Adding a place or an experience
 * from anywhere on the site answers with one line at the foot of the
 * screen and a way into the trip builder, then gets out of the way. It is
 * a status region, so a screen reader hears the same sentence once.
 */
export function Toast() {
  const { t } = useTranslation();
  const toast = useToastStore((state) => state.toast);
  const dismiss = useToastStore((state) => state.dismiss);
  const { pathname } = useLocation();

  useEffect(() => {
    if (!toast) return;
    const handle = window.setTimeout(() => dismiss(toast.id), SHOWN_FOR_MS);
    return () => window.clearTimeout(handle);
  }, [toast, dismiss]);

  // A navigation is an answer of its own; the note need not follow the visitor.
  useEffect(() => {
    dismiss();
  }, [pathname, dismiss]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-4 sm:pb-6" aria-live="polite">
      <AnimatePresence>
        {toast && (
          <m.div
            key={toast.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8, transition: { duration: 0.18 } }}
            transition={transitions.pop}
            className="pointer-events-auto flex max-w-full items-center gap-4 border border-charcoal-700 bg-charcoal-900 py-3 pe-2 ps-4 text-sm text-ivory shadow-lg"
          >
            <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-500 text-ivory">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="min-w-0">{toast.message}</span>
            {toast.action && (
              <Link
                to={toast.action.to}
                onClick={() => dismiss(toast.id)}
                className="shrink-0 rounded-sm px-3 py-1.5 font-medium text-gold-200 underline decoration-gold-200/40 underline-offset-4 transition-colors hover:bg-ivory/10 hover:text-gold-100"
              >
                {toast.action.label}
              </Link>
            )}
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label={t("common.dismiss")}
              className="shrink-0 rounded-sm p-1.5 text-ivory/60 transition-colors hover:bg-ivory/10 hover:text-ivory"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
