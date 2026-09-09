import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";

export function Logo({ onDark = false, className }: { onDark?: boolean; className?: string }) {
  const { t } = useTranslation();
  return (
    <Link
      to="/"
      className={cn("group inline-flex items-baseline gap-2 no-underline", className)}
    >
      <span
        className={cn(
          "font-display text-xl leading-none tracking-tight sm:text-2xl",
          onDark ? "text-ivory" : "text-charcoal-900",
        )}
      >
        {t("brand.name")}
      </span>
      <span
        aria-hidden
        className={cn(
          "hidden h-1.5 w-1.5 rounded-full transition-colors duration-300 sm:block",
          onDark ? "bg-gold-300 group-hover:bg-ember-400" : "bg-ember-500 group-hover:bg-gold-500",
        )}
      />
    </Link>
  );
}
