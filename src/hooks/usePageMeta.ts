import { useEffect } from "react";
import { useTranslation } from "react-i18next";

/**
 * Minimal document head handling. Phase 10 replaces this with full metadata,
 * but titles and descriptions belong in place from the start.
 */
/** The description index.html shipped with, restored on pages without their own. */
let defaultDescription: string | undefined;

export function usePageMeta(title?: string, description?: string, options: { noindex?: boolean } = {}) {
  const { t, i18n } = useTranslation();
  const brand = t("brand.name");

  useEffect(() => {
    document.title = title ? `${title} — ${brand}` : `${brand} — ${t("brand.tagline")}`;
    let tag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!tag) {
      tag = document.createElement("meta");
      tag.name = "description";
      document.head.appendChild(tag);
    }
    defaultDescription ??= tag.content;
    // Otherwise the previous page's description would travel with the visitor.
    tag.content = description ?? defaultDescription;
    // A page that only shows the visitor's own trip has nothing for a search engine.
    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (options.noindex) {
      if (!robots) {
        robots = document.createElement("meta");
        robots.name = "robots";
        document.head.appendChild(robots);
      }
      robots.content = "noindex";
    } else {
      robots?.remove();
    }
  }, [title, description, brand, t, i18n.resolvedLanguage, options.noindex]);
}
