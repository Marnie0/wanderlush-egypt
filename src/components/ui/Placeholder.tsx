import { useTranslation } from "react-i18next";
import { Container } from "./Layout";

/**
 * Used by routes whose feature arrives in a later phase. It states what the
 * page will be rather than pretending to be broken.
 */
export function Placeholder() {
  const { t } = useTranslation();
  return (
    <Container className="pb-section">
      <div className="border-s-2 border-gold-400 bg-sand-50 px-6 py-8 sm:px-10 sm:py-10">
        <p className="eyebrow text-gold-600">{t("placeholder.label")}</p>
        <p className="mt-3 max-w-xl text-lead leading-relaxed text-charcoal-600">
          {t("placeholder.body")}
        </p>
      </div>
    </Container>
  );
}
