import { Link } from "@tanstack/react-router";

type Props = {
  to: string;
  children: React.ReactNode;
  className?: string;
  /** Light treatment for use over imagery. */
  overlay?: boolean;
};

/**
 * Editorial CTA — flat rectangle, letter-spaced uppercase.
 * Replaces the previous pill/rounded-full silhouette to align with
 * the LATE EDIT high-fashion type system.
 */
export function PillCTA({ to, children, className = "", overlay = false }: Props) {
  return (
    <div className={`flex justify-center ${className}`}>
      <Link
        to={to}
        className={
          overlay
            ? "group inline-flex items-center gap-3 border border-white/70 bg-black/20 backdrop-blur-[2px] px-8 py-3.5 text-[0.7rem] tracking-[0.28em] uppercase text-white hover:bg-white hover:!text-black transition-colors press"
            : "group inline-flex items-center gap-3 border border-foreground/60 px-8 py-3.5 text-[0.7rem] tracking-[0.28em] uppercase text-foreground hover:bg-foreground hover:!text-background transition-colors press"
        }
      >
        <span>{children}</span>
        <span aria-hidden className="inline-block transition-transform duration-500 ease-out group-hover:translate-x-1">→</span>
      </Link>
    </div>
  );
}

