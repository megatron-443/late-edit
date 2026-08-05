/**
 * LATE EDIT — "LE" monogram system.
 *
 * Three original marks, all drawn on a 64-unit grid, monochrome, and using
 * `currentColor` so they inherit the active theme token. Every concept holds
 * together at 16px (favicon) and scales cleanly to print/packaging.
 *
 *  1. LogoInterlocked — primary mark: L and E intertwined into one seal.
 *  2. LogoVertical    — the L as architecture, the E stacked inside its well.
 *  3. LogoGeometric   — symmetrical grid interpretation for micro sizes.
 */

type MarkProps = {
  size?: number;
  className?: string;
  /** Stroke weight on the 64-unit grid. Raise slightly for very small sizes. */
  weight?: number;
  title?: string;
};

function Frame({
  size = 28,
  className,
  title,
  children,
}: MarkProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      fill="none"
      stroke="currentColor"
      strokeLinecap="butt"
      strokeLinejoin="miter"
    >
      {children}
    </svg>
  );
}

/** CONCEPT 1 — Interlocking Monogram (primary). */
export function LogoInterlocked({ weight = 3.6, ...props }: MarkProps) {
  return (
    <Frame {...props}>
      {/* L — vertical spine and foot */}
      <path d="M18 13 V51 H44" strokeWidth={weight} />
      {/* E — spine set inside the L, its centre bar threading through the L stem */}
      <path d="M34 21 V43" strokeWidth={weight} />
      <path d="M34 21 H52" strokeWidth={weight} />
      <path d="M18 32 H49" strokeWidth={weight} />
      <path d="M34 43 H52" strokeWidth={weight} />
    </Frame>
  );
}

/** CONCEPT 2 — Vertical Monogram. */
export function LogoVertical({ weight = 3.4, ...props }: MarkProps) {
  return (
    <Frame {...props}>
      {/* L — full-height architecture */}
      <path d="M20 8 V56 H46" strokeWidth={weight} />
      {/* E — three bars descending inside the L's well */}
      <path d="M20 20 H48" strokeWidth={weight} />
      <path d="M20 32 H41" strokeWidth={weight} />
      <path d="M20 44 H48" strokeWidth={weight} />
    </Frame>
  );
}

/** CONCEPT 3 — Geometric Monogram (optimised for 16px). */
export function LogoGeometric({ weight = 5, ...props }: MarkProps) {
  return (
    <Frame {...props}>
      {/* L — heavier angle on an 8-unit grid */}
      <path d="M14 14 V50 H32" strokeWidth={weight} />
      {/* E — three equal bars, flush right, same rhythm as the L */}
      <path d="M40 14 H50" strokeWidth={weight} />
      <path d="M40 32 H50" strokeWidth={weight} />
      <path d="M40 50 H50" strokeWidth={weight} />
      <path d="M40 14 V50" strokeWidth={weight} />
    </Frame>
  );
}

/** Primary brand mark alias — swap this one line to change the site logo. */
export const LogoLE = LogoInterlocked;
