import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { TripStep } from "@/lib/trip-plan";
import type { TripState } from "@/lib/trip-store";
import { cn } from "@/lib/cn";

/**
 * The estimate is only as true as its inputs. When a trip arrived with
 * defaults nobody has looked at (a journey's suggested stay, two adults, no
 * dates) this says so wherever a price appears, and links to the step that
 * settles each one. Gone the moment every priced step has been seen.
 */
export function ConfirmNotice({
  unconfirmed,
  trip,
  compact = false,
  className,
}: {
  unconfirmed: TripStep[];
  trip: Pick<TripState, "adults" | "children" | "tier">;
  compact?: boolean;
  className?: string;
}) {
  const { t } = useTranslation();
  if (unconfirmed.length === 0) return null;
  const travellers =
    t("builder.summary.adults", { count: trip.adults }) +
    (trip.children > 0 ? `${t("common.listSeparator")}${t("builder.summary.children", { count: trip.children })}` : "");
  return (
    <div
      role="status"
      className={cn("border-s-2 border-gold-500 bg-gold-50 text-gold-800", compact ? "px-3 py-2.5 text-xs" : "px-4 py-3 text-sm", className)}
    >
      <p className="font-medium">{t("builder.confirm.title")}</p>
      <p className={cn("mt-1 leading-relaxed", compact ? "" : "max-w-2xl")}>
        {t("builder.confirm.body", { travellers, stay: t(`tiers.${trip.tier}`) })}
      </p>
      <ul className={cn("mt-2 flex flex-wrap", compact ? "gap-x-3 gap-y-1" : "gap-x-4 gap-y-1")}>
        {unconfirmed.map((step) => (
          <li key={step}>
            <Link
              to={`/trip-builder?step=${step}`}
              className="font-medium underline decoration-gold-500/60 underline-offset-4 transition-colors hover:text-gold-900 hover:decoration-gold-700"
            >
              {t("builder.confirm.action", { step: t(`builder.confirm.${step}`) })}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
