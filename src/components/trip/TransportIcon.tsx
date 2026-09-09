import type { TransportMode } from "@content/transport";

const paths: Record<TransportMode, React.ReactNode> = {
  flight: <path d="M2.5 16.5 21 3.5l-5 17-3.5-6.5L2.5 16.5z" />,
  train: (
    <>
      <rect x="5" y="3" width="14" height="14" rx="3" />
      <path d="M5 11h14M9 21l1.5-3M15 21l-1.5-3M9 14h.01M15 14h.01" />
    </>
  ),
  road: (
    <>
      <path d="M3 13l2-5.5A2 2 0 0 1 6.9 6h10.2a2 2 0 0 1 1.9 1.5L21 13v5H3v-5z" />
      <path d="M6 18v2M18 18v2M7 13h.01M17 13h.01" />
    </>
  ),
};

export function TransportIcon({ mode, size = 18, className }: { mode: TransportMode; size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      {paths[mode]}
    </svg>
  );
}
