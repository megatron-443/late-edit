import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";

import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import { OverlayPortal, useOverlayPresence } from "./overlay-portal";

/**
 * One shared overlay mechanism for every drawer, sheet and modal.
 *
 * Responsibilities kept here so no surface can drift:
 *   - portal + mount/unmount (nothing off-canvas when closed)
 *   - reference-counted body scroll lock
 *   - role="dialog" + aria-modal + accessible name
 *   - Escape closes only the top-most overlay
 *   - focus is moved in on open, trapped while open, and returned to the
 *     trigger element on close
 *   - backdrop click closes
 */

/** Ordered stack of open overlays; only the last one owns Escape + focus. */
const stack: string[] = [];

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export type OverlaySurface = "left" | "right" | "top" | "sheet" | "center";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Accessible name for the dialog. */
  label: string;
  surface: OverlaySurface;
  children: ReactNode;
  /** Extra classes for the panel element. */
  panelClassName?: string;
  panelStyle?: React.CSSProperties;
  backdropClassName?: string;
  /** Stacking order — drawers 60/70, filters 75, search 80, nested pickers 90. */
  z?: number;
  exitMs?: number;
  /** Element focused when the overlay opens; defaults to the panel itself. */
  initialFocusRef?: RefObject<HTMLElement | null>;
  panelRef?: RefObject<HTMLElement | null>;
  /** Panel props for swipe-to-dismiss and friends. */
  panelProps?: React.HTMLAttributes<HTMLDivElement>;
};

const SURFACE_BASE: Record<OverlaySurface, string> = {
  left: "absolute left-0 top-0 h-dvh w-[85vw] max-w-[380px] md:max-w-md bg-background border-r border-border transition-transform duration-[520ms] ease-editorial will-change-transform",
  right:
    "absolute right-0 top-0 h-dvh w-full max-w-md bg-surface border-l border-border transition-transform duration-[520ms] ease-editorial will-change-transform",
  top: "absolute left-0 right-0 top-0 bg-background border-b border-border transition-transform duration-[520ms] ease-editorial will-change-transform",
  sheet:
    "absolute inset-x-0 bottom-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[min(640px,92vw)] max-h-[90dvh] md:max-h-[80dvh] bg-background border border-border shadow-2xl transition-[transform,opacity] duration-[460ms] ease-editorial will-change-transform",
  center:
    "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(560px,92vw)] max-h-[85dvh] bg-background border border-border shadow-2xl transition-[transform,opacity] duration-[420ms] ease-editorial",
};

function surfaceState(surface: OverlaySurface, shown: boolean) {
  switch (surface) {
    case "left":
      return shown ? "translate-x-0" : "-translate-x-full";
    case "right":
      return shown ? "translate-x-0" : "translate-x-full";
    case "top":
      return shown ? "translate-y-0" : "-translate-y-full";
    case "sheet":
      return shown
        ? "translate-y-0 opacity-100 md:scale-100"
        : "translate-y-full opacity-0 md:translate-y-0 md:scale-[0.98]";
    case "center":
      return shown ? "opacity-100 scale-100" : "opacity-0 scale-[0.98]";
  }
}

export function Overlay({
  open,
  onClose,
  label,
  surface,
  children,
  panelClassName = "",
  panelStyle,
  backdropClassName = "bg-foreground/30 backdrop-blur-sm",
  z = 70,
  exitMs = 560,
  initialFocusRef,
  panelRef,
  panelProps,
}: Props) {
  const id = useId();
  const localPanel = useRef<HTMLDivElement>(null);
  const restoreTo = useRef<HTMLElement | null>(null);
  const { mounted, shown } = useOverlayPresence(open, exitMs);

  useBodyScrollLock(mounted);

  const setPanel = useCallback(
    (node: HTMLDivElement | null) => {
      localPanel.current = node;
      if (panelRef) (panelRef as { current: HTMLElement | null }).current = node;
    },
    [panelRef],
  );

  // Stack registration + focus lifecycle.
  useEffect(() => {
    if (!mounted) return;
    stack.push(id);
    restoreTo.current = document.activeElement as HTMLElement | null;

    const focusIn = window.setTimeout(() => {
      const target = initialFocusRef?.current ?? localPanel.current;
      target?.focus({ preventScroll: true });
    }, 40);

    return () => {
      window.clearTimeout(focusIn);
      const i = stack.lastIndexOf(id);
      if (i >= 0) stack.splice(i, 1);
      const el = restoreTo.current;
      if (el && el.isConnected) el.focus({ preventScroll: true });
      restoreTo.current = null;
    };
  }, [mounted, id, initialFocusRef]);

  // Escape + focus trap — only while this overlay is top-most.
  useEffect(() => {
    if (!mounted) return;
    const onKey = (e: KeyboardEvent) => {
      if (stack[stack.length - 1] !== id) return;

      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }

      if (e.key !== "Tab") return;
      const panel = localPanel.current;
      if (!panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
      if (items.length === 0) {
        e.preventDefault();
        panel.focus({ preventScroll: true });
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (!panel.contains(active)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
        return;
      }
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [mounted, id, onClose]);

  if (!mounted) return null;

  return (
    <OverlayPortal>
      <div
        className={`fixed inset-0 transition-opacity duration-500 ${
          shown ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ zIndex: z }}
      >
        <div className={`absolute inset-0 ${backdropClassName}`} onClick={onClose} aria-hidden />
        <div
          {...panelProps}
          ref={setPanel}
          role="dialog"
          aria-modal="true"
          aria-label={label}
          tabIndex={-1}
          style={{ ...panelStyle, ...(panelProps?.style ?? {}) }}
          className={`outline-none ${SURFACE_BASE[surface]} ${surfaceState(surface, shown)} ${panelClassName} ${panelProps?.className ?? ""}`}
        >
          {children}
        </div>
      </div>
    </OverlayPortal>
  );
}
