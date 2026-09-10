import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import type { TripPdfData } from "@/lib/trip-pdf";
import { cn } from "@/lib/cn";

type State = "idle" | "working" | "failed";

/**
 * One button, three states. The data is built at the moment of the click,
 * so the file always says what the page says; the renderer is fetched at
 * the same moment, so a page that never asks for it never pays for it.
 */
export function DownloadPdfButton({
  build,
  fileName,
  variant = "secondary",
  size,
  className,
}: {
  build: () => TripPdfData;
  fileName: string;
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const { t } = useTranslation();
  const [state, setState] = useState<State>("idle");
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const onClick = async () => {
    if (state === "working") return;
    setState("working");
    try {
      const { downloadTripPdf } = await import("@/pdf/download");
      await downloadTripPdf(build(), fileName);
      if (mounted.current) setState("idle");
    } catch (error) {
      console.error(error);
      if (mounted.current) setState("failed");
    }
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Button type="button" variant={variant} size={size} onClick={onClick} disabled={state === "working"} aria-busy={state === "working"} className="w-full">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden className={cn(state === "working" && "animate-pulse")}>
          <path d="M12 4v11m0 0 4-4m-4 4-4-4M5 19h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {state === "working" ? t("pdf.preparing") : t("pdf.download")}
      </Button>
      {state === "failed" && (
        <p role="alert" className="text-xs leading-relaxed text-ember-700">
          {t("pdf.failed")}
        </p>
      )}
    </div>
  );
}
