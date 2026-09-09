import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { imageManifest } from "@/generated/images";

interface SmartImageProps {
  /** Manifest key, e.g. `/images/destinations/cairo-hero.webp`. */
  src: string;
  alt: string;
  /** Fallback colour used if the file is missing from the manifest. */
  accent?: string;
  className?: string;
  imgClassName?: string;
  /** Only above-the-fold heroes should be eager. */
  priority?: boolean;
  sizes?: string;
  /** Show the photographer credit, required by the CC BY and CC BY-SA licences. */
  showCredit?: boolean;
  children?: React.ReactNode;
}

/** Cards sit in a 1, 2 or 3 column grid depending on width. */
export const CARD_SIZES = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw";
export const HALF_SIZES = "(min-width: 640px) 50vw, 100vw";
export const FULL_SIZES = "100vw";

/**
 * Serves the responsive WebP variants produced by `scripts/images/build.mjs`,
 * with the generated blur placeholder painted underneath so there is never a
 * blank rectangle. Anything missing from the manifest degrades to a warm
 * gradient built from the subject's accent colour rather than a broken image.
 */
export function SmartImage({
  src,
  alt,
  accent = "#9a7a54",
  className,
  imgClassName,
  priority = false,
  sizes = CARD_SIZES,
  showCredit = false,
  children,
}: SmartImageProps) {
  const entry = imageManifest[src];
  const imgRef = useRef<HTMLImageElement>(null);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // A cached image can finish decoding before React attaches its onLoad
  // handler, which would leave the picture stuck at opacity zero with only
  // the blur placeholder showing. Check `complete` once on mount instead.
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) setLoaded(true);
  }, [src]);

  const base = src.replace(/\.webp$/, "");
  const srcSet = entry?.widths.map((w) => `${base}-${w}.webp ${w}w`).join(", ");
  const fallbackWidth = entry?.widths[Math.min(1, entry.widths.length - 1)];
  const showPlaceholder = !entry || failed;

  return (
    <div
      className={cn("relative overflow-hidden bg-sand-200", className)}
      style={
        showPlaceholder
          ? {
              backgroundImage: `linear-gradient(150deg, ${accent} 0%, color-mix(in oklab, ${accent} 55%, #12100c) 62%, #12100c 100%)`,
            }
          : {
              backgroundImage: `url("${entry.lqip}")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
      }
    >
      {entry && !failed && (
        <img
          ref={imgRef}
          src={`${base}-${fallbackWidth}.webp`}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          width={entry.width}
          height={entry.height}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          fetchPriority={priority ? "high" : "auto"}
          onError={() => setFailed(true)}
          onLoad={() => setLoaded(true)}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out",
            loaded ? "opacity-100" : "opacity-0",
            imgClassName,
          )}
        />
      )}
      {showPlaceholder && (
        <div aria-hidden className="absolute inset-0">
          <div className="absolute inset-0 opacity-25 mix-blend-soft-light [background-image:repeating-linear-gradient(115deg,transparent_0_18px,rgba(255,255,255,0.5)_18px_19px)]" />
          <div className="absolute inset-x-0 bottom-0 h-1/3 scrim-bottom" />
        </div>
      )}
      {children}
      {showCredit && entry && !failed && (
        <a
          href={entry.credit.source}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="absolute bottom-2 end-3 z-10 text-[0.625rem] text-ivory/45 transition-colors hover:text-ivory/80"
        >
          {entry.credit.artist} · {entry.credit.license}
        </a>
      )}
    </div>
  );
}
