import { useState } from "react";
import { cn } from "@/lib/cn";

interface SmartImageProps {
  src: string;
  alt: string;
  /** Brand colour used to build the placeholder when the file is absent. */
  accent?: string;
  className?: string;
  imgClassName?: string;
  /** Only the homepage hero and destination heroes should be eager. */
  priority?: boolean;
  sizes?: string;
  children?: React.ReactNode;
}

/**
 * Photography is dropped into `public/images/` during production. Until a
 * file exists the component renders a warm gradient built from the subject's
 * accent colour, so layouts, spacing and contrast can all be judged now and
 * nothing collapses when an image is missing.
 */
export function SmartImage({
  src,
  alt,
  accent = "#9a7a54",
  className,
  imgClassName,
  priority = false,
  sizes,
  children,
}: SmartImageProps) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={cn("relative overflow-hidden bg-sand-200", className)}
      style={{
        backgroundImage: `linear-gradient(150deg, ${accent} 0%, color-mix(in oklab, ${accent} 55%, #12100c) 62%, #12100c 100%)`,
      }}
    >
      {!failed && (
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          fetchPriority={priority ? "high" : "auto"}
          sizes={sizes}
          onError={() => setFailed(true)}
          onLoad={() => setLoaded(true)}
          className={cn(
            "h-full w-full object-cover transition-opacity duration-700",
            loaded ? "opacity-100" : "opacity-0",
            imgClassName,
          )}
        />
      )}
      {failed && (
        // Placeholder state. Decorative only: the alt text is already
        // announced by the absent image's surrounding content.
        <div aria-hidden className="absolute inset-0">
          <div className="absolute inset-0 opacity-25 mix-blend-soft-light [background-image:repeating-linear-gradient(115deg,transparent_0_18px,rgba(255,255,255,0.5)_18px_19px)]" />
          <div className="absolute inset-x-0 bottom-0 h-1/3 scrim-bottom" />
        </div>
      )}
      {children}
    </div>
  );
}
