import { useEffect } from "react";
import { useTranslation } from "react-i18next";

/**
 * Minimal document head handling. Phase 10 replaces this with full metadata,
 * but titles and descriptions belong in place from the start.
 */
export function usePageMeta(title?: string, description?: string) {
  const { t, i18n } = useTranslation();
  const brand = t("brand.name");

  useEffect(() => {
    document.title = title ? `${title} — ${brand}` : `${brand} — ${t("brand.tagline")}`;
    if (description) {
      let tag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
      if (!tag) {
        tag = document.createElement("meta");
        tag.name = "description";
        document.head.appendChild(tag);
      }
      tag.content = description;
    }
  }, [title, description, brand, t, i18n.resolvedLanguage]);
}
