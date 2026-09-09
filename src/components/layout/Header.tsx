import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Container } from "@/components/ui/Layout";
import { ButtonLink } from "@/components/ui/Button";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileMenu } from "./MobileMenu";
import { Logo } from "./Logo";
import { primaryNav } from "./navItems";
import { cn } from "@/lib/cn";
import { useTripCount } from "@/lib/trip-store";

/**
 * Transparent over a hero, solid once the page scrolls. The compact state is
 * driven by scroll position rather than an observer so it also behaves on
 * routes that have no hero at all.
 */
export function Header({ transparent = false }: { transparent?: boolean }) {
  const { t } = useTranslation();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const tripCount = useTripCount();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  const floating = transparent && !scrolled;

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-all duration-500",
          floating
            ? "bg-transparent py-5"
            : "border-b border-line bg-canvas/95 py-3 backdrop-blur-sm",
        )}
      >
        <Container className="flex items-center justify-between gap-6">
          <Logo onDark={floating} />

          <nav aria-label={t("nav.primaryLabel")} className="hidden lg:block">
            <ul className="flex items-center gap-8">
              {primaryNav.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        "relative text-sm transition-colors duration-200 after:absolute after:-bottom-1.5 after:h-px after:bg-current after:transition-all after:duration-300 after:content-['']",
                        "after:inset-x-0 after:origin-center after:scale-x-0 hover:after:scale-x-100",
                        floating ? "text-ivory/85 hover:text-ivory" : "text-charcoal-600 hover:text-charcoal-900",
                        isActive && (floating ? "text-ivory after:scale-x-100" : "text-charcoal-900 after:scale-x-100"),
                      )
                    }
                  >
                    {t(item.key)}
                    {item.to === "/trip-builder" && tripCount > 0 && (
                      <span
                        className="ms-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-ember-500 px-1.5 text-xs text-ivory"
                        aria-label={t("trip.count", { count: tripCount })}
                      >
                        {tripCount}
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <LanguageSwitcher onDark={floating} />
            <ButtonLink
              to="/trip-builder"
              variant={floating ? "onDark" : "primary"}
              size="sm"
              className="hidden sm:inline-flex"
            >
              {t("nav.startPlanning")}
            </ButtonLink>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label={t("nav.openMenu")}
              aria-expanded={menuOpen}
              className={cn(
                "rounded-sm p-2 transition-colors lg:hidden",
                floating ? "text-ivory" : "text-charcoal-800",
              )}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </Container>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
