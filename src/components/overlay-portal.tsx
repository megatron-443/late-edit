import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

const CONTAINER_ID = "le-overlay-root";

function getContainer(): HTMLElement {
  let el = document.getElementById(CONTAINER_ID);
  if (!el) {
    el = document.createElement("div");
    el.id = CONTAINER_ID;
    document.body.appendChild(el);
  }
  return el;
}

/**
 * One shared container for every drawer/modal in the app. Overlays render here
 * only while they are open (or animating out), so no off-canvas panel is ever
 * left in the layout when closed.
 */
export function OverlayPortal({ children }: { children: ReactNode }) {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setContainer(getContainer());
  }, []);
  if (!container) return null;
  return createPortal(children, container);
}

/**
 * Mount/unmount presence with an exit animation window.
 *
 * `mounted` — render the overlay at all.
 * `shown`   — drive the open-state classes (false on the first painted frame
 *             so the enter transition runs, false again during the exit).
 */
export function useOverlayPresence(open: boolean, exitMs = 560) {
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    window.clearTimeout(timer.current);
    if (open) {
      setMounted(true);
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => setShown(true));
      });
      return () => cancelAnimationFrame(raf);
    }
    setShown(false);
    timer.current = window.setTimeout(() => setMounted(false), exitMs);
    return () => window.clearTimeout(timer.current);
  }, [open, exitMs]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return { mounted, shown };
}
