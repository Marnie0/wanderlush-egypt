import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Container } from "@/components/ui/Layout";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { primaryNav, footerPlanNav, footerCompanyNav } from "./navItems";

const PORTFOLIO_URL = "https://portfolio-ih18.vercel.app/";

function FooterColumn({
  title,
  items,
}: {
  title: string;
  items: readonly { to: string; key: string }[];
}) {
  const { t } = useTranslation();
  return (
    <div>
      <h2 className="eyebrow mb-5 text-gold-300">{title}</h2>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.to + item.key}>
            <Link
              to={item.to}
              className="text-sm text-ivory/70 transition-colors duration-200 hover:text-ivory"
            >
              {t(item.key)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-teal-800 text-ivory">
      <Container className="py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <p className="font-display text-3xl leading-tight">{t("brand.name")}</p>
            <p className="mt-4 text-sm leading-relaxed text-ivory/70">{t("brand.tagline")}</p>
            <LanguageSwitcher onDark className="-ms-3 mt-6" />
          </div>
          <FooterColumn title={t("footer.explore")} items={primaryNav} />
          <FooterColumn title={t("footer.plan")} items={footerPlanNav} />
          <FooterColumn title={t("footer.company")} items={footerCompanyNav} />
        </div>

        <div className="mt-16 flex flex-col gap-6 border-t border-ivory/15 pt-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs leading-relaxed text-ivory/70">{t("footer.demoNotice")}</p>
            <p className="mt-2 text-xs text-ivory/70">
              © {year} {t("brand.name")}. {t("footer.rights")}
            </p>
          </div>
          {/* The maker's mark: one quiet line in the same voice as the rest
              of the bar, the name a link, and nothing that competes with the
              site it sits under. */}
          <p className="shrink-0 text-xs text-ivory/70">
            {t("footer.creditPrefix")}{" "}
            <a
              href={PORTFOLIO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1 text-ivory underline decoration-gold-300/50 underline-offset-4 transition-colors duration-200 hover:text-gold-200 hover:decoration-gold-200"
            >
              {t("footer.creditName")}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden className="transition-transform duration-300 group-hover:-translate-y-px group-hover:translate-x-px rtl:-scale-x-100 rtl:group-hover:-translate-x-px">
                <path d="M7 17 17 7M9 7h8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="sr-only"> ({t("footer.newTab")})</span>
            </a>
          </p>
        </div>
      </Container>
    </footer>
  );
}
