import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, m } from "framer-motion";
import { SmartImage } from "./SmartImage";
import { pick } from "@/lib/format";
import { transitions } from "@/lib/motion";
import type { ImageRef } from "@content/types";

/**
 * A responsive gallery with a lightbox. Thumbnails are buttons, the lightbox
 * is a modal dialog, and arrow keys move between images, so the whole thing
 * works without a pointer.
 */
export function Gallery({ images, accent }: { images: ImageRef[]; accent?: string }) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? "en";
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const step = useCallback(
    (delta: number) =>
      setOpenIndex((current) =>
        current === null ? current : (current + delta + images.length) % images.length,
      ),
    [images.length],
  );

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
      if (event.key === "Tab") event.preventDefault();
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      restoreFocusRef.current?.focus?.();
    };
  }, [openIndex, close, step]);

  if (images.length === 0) return null;
  const active = openIndex === null ? null : images[openIndex];

  return (
    <>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                imgClassName="transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
              />
            </button>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {active && (
          <m.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-950/92 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transitions.soft}
          >
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-label={t("gallery.title")}
              tabIndex={-1}
              className="relative w-full max-w-5xl focus:outline-none"
            >
              <SmartImage
                src={active.src}
                alt={pick(active.alt, language)}
                accent={accent}
                priority
                sizes="(min-width: 1024px) 80vw, 96vw"
                className="max-h-[78svh] w-full"
                imgClassName="object-contain"
              />
              <p className="mt-4 text-center text-sm text-ivory/70">
                {pick(active.alt, language)}
                <span className="mx-2 text-ivory/35">·</span>
                {t("gallery.counter", { index: (openIndex ?? 0) + 1, total: images.length })}
              </p>
            </div>

            <button
              type="button"
              onClick={close}
              aria-label={t("gallery.close")}
              className="absolute end-4 top-4 rounded-sm p-3 text-ivory/70 transition-colors hover:text-ivory"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label={t("gallery.previous")}
                  className="absolute start-2 rounded-sm p-3 text-ivory/70 transition-colors hover:text-ivory sm:start-6"
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden className="rtl:rotate-180">
                    <path d="m15 6-6 6 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label={t("gallery.next")}
                  className="absolute end-2 rounded-sm p-3 text-ivory/70 transition-colors hover:text-ivory sm:end-6"
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden className="rtl:rotate-180">
                    <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </>
            )}
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
