import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { AnimatePresence, m } from "framer-motion";
import { SmartImage, preloadImage } from "./SmartImage";
import { pick } from "@/lib/format";
import { cn } from "@/lib/cn";
import { transitions } from "@/lib/motion";
import type { ImageRef } from "@content/types";

const FOCUSABLE = "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])";
const LIGHTBOX_SIZES = "(min-width: 1024px) 80vw, 96vw";

/**
 * A responsive gallery with a lightbox. Thumbnails are buttons, the lightbox
 * is a modal dialog, and arrow keys move between images, so the whole thing
 * works without a pointer.
 */
export function Gallery({ images, accent }: { images: ImageRef[]; accent?: string }) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? "en";
  const isRtl = i18n.dir() === "rtl";
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const isOpen = openIndex !== null;

  const close = useCallback(() => setOpenIndex(null), []);
  const step = useCallback(
    (delta: number) =>
      setOpenIndex((current) =>
        current === null ? current : (current + delta + images.length) % images.length,
      ),
    [images.length],
  );

  // Keyed on whether the lightbox is open rather than on which picture is
  // showing, so stepping between pictures does not throw focus back to the
  // thumbnail and re-lock the page each time.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      // The next picture sits to the left in Arabic, so the arrow keys follow
      // the reading direction rather than the order of the array.
      if (event.key === "ArrowRight") step(isRtl ? -1 : 1);
      if (event.key === "ArrowLeft") step(isRtl ? 1 : -1);
      if (event.key !== "Tab") return;
      // Keep Tab inside the dialog, but let it still reach the close and step
      // buttons rather than swallowing the key outright.
      const targets = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
      if (targets.length === 0) return event.preventDefault();
      const first = targets[0];
      const last = targets[targets.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || active === dialogRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    const restoreFocus = restoreFocusRef.current;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      restoreFocus?.focus?.();
    };
  }, [isOpen, isRtl, close, step]);

  // Fetch the pictures either side of the open one, so stepping does not
  // leave the previous photo on screen under the new caption.
  useEffect(() => {
    if (openIndex === null || images.length < 2) return;
    for (const delta of [1, -1]) {
      preloadImage(images[(openIndex + delta + images.length) % images.length].src, LIGHTBOX_SIZES);
    }
  }, [openIndex, images]);

  if (images.length === 0) return null;
  const active = openIndex === null ? null : images[openIndex];

  return (
    <>
      {/* Columns follow the count, so a pair of photographs fills the row
          instead of leaving a gap that reads as a missing image. */}
      <ul
        className={cn(
          "grid gap-4",
          images.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3",
        )}
      >
        {images.map((image, index) => (
          <li key={image.src}>
            <button
              type="button"
              onClick={(event) => {
                restoreFocusRef.current = event.currentTarget;
                setOpenIndex(index);
              }}
              aria-label={t("gallery.open", { index: index + 1, total: images.length })}
              className="group block w-full overflow-hidden"
            >
              <SmartImage
                src={image.src}
                alt={pick(image.alt, language)}
                accent={accent}
                sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
                className="aspect-[4/3] w-full"
                imgClassName="photo-zoom"
              />
            </button>
          </li>
        ))}
      </ul>

      {/* On the body, so no animated ancestor can trap the lightbox in its own
          stacking context, underneath the fixed header. */}
      {createPortal(
        <AnimatePresence>
          {active && (
            <m.div
              className="fixed inset-0 z-50 flex justify-center overflow-y-auto bg-charcoal-950/92 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={transitions.soft}
              onClick={close}
            >
              <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-label={t("gallery.title")}
                tabIndex={-1}
                className="relative my-auto w-full max-w-5xl focus:outline-none"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="relative">
                  <SmartImage
                    src={active.src}
                    alt={pick(active.alt, language)}
                    accent={accent}
                    priority
                    fit="contain"
                    sizes={LIGHTBOX_SIZES}
                    className="w-full"
                    imgClassName="max-h-[74svh] rounded-sm"
                  />

                  {images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => step(-1)}
                        aria-label={t("gallery.previous")}
                        className="absolute start-0 top-1/2 -translate-y-1/2 rounded-sm bg-charcoal-950/45 p-3 text-ivory/80 backdrop-blur-sm transition-colors hover:bg-charcoal-950/75 hover:text-ivory sm:-start-4"
                      >
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden className="rtl:rotate-180">
                          <path d="m15 6-6 6 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => step(1)}
                        aria-label={t("gallery.next")}
                        className="absolute end-0 top-1/2 -translate-y-1/2 rounded-sm bg-charcoal-950/45 p-3 text-ivory/80 backdrop-blur-sm transition-colors hover:bg-charcoal-950/75 hover:text-ivory sm:-end-4"
                      >
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden className="rtl:rotate-180">
                          <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>

                <p className="mx-auto mt-4 max-w-2xl text-center text-sm text-ivory/70">
                  {pick(active.alt, language)}
                  <span className="mx-2 text-ivory/35">·</span>
                  {t("gallery.counter", { index: (openIndex ?? 0) + 1, total: images.length })}
                </p>

                <button
                  type="button"
                  onClick={close}
                  aria-label={t("gallery.close")}
                  className="fixed end-4 top-4 rounded-sm p-3 text-ivory/70 transition-colors hover:text-ivory"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </m.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
