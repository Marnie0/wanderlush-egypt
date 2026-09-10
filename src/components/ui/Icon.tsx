import { cn } from "@/lib/cn";

export type IconName =
  | "route"
  | "compass"
  | "pin"
  | "shuffle"
  | "receipt"
  | "language"
  | "search"
  | "arrow"
  | "chevronDown"
  | "quote";

const paths: Record<IconName, React.ReactNode> = {
  route: (
    <>
      <circle cx="6" cy="18" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <path d="M8.5 18h5a3.5 3.5 0 0 0 0-7h-3a3.5 3.5 0 0 1 0-7h5" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5z" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  shuffle: (
    <>
      <path d="M3 7h4l10 10h4M3 17h4l3-3M17 17l4 0M17 7l4 0" />
      <path d="m18 4 3 3-3 3M18 14l3 3-3 3" />
    </>
  ),
  receipt: (
    <>
      <path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2z" />
      <path d="M9 8h6M9 12h6" />
    </>
  ),
  language: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </>
  ),
  arrow: <path d="M4 12h15m-5-6 6 6-6 6" />,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  quote: <path d="M9 6c-3 1.5-4.5 4-4.5 7.5V18h6v-6H7c0-2 .7-3.4 2-4.2zm10 0c-3 1.5-4.5 4-4.5 7.5V18h6v-6H17c0-2 .7-3.4 2-4.2z" />,
};

/**
 * One stroke weight, one corner treatment, no fills. Icons stay quiet next to
 * the photography rather than competing with it.
 */
export function Icon({
  name,
  className,
  size = 24,
}: {
  name: IconName;
  className?: string;
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn("shrink-0", className)}
    >
      {paths[name]}
    </svg>
  );
}
