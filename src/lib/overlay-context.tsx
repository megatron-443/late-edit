import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

/**
 * One global overlay slot. Because the app stores a single `activeOverlay`
 * value, two chrome overlays can never be open at the same time — opening the
 * bag closes the menu, opening search closes the bag, and so on.
 *
 * Nested, contextual layers (the currency picker inside the menu, the filter
 * sheet on a catalogue page) intentionally stack on top and are owned locally;
 * they still share the Overlay primitive, so Escape and focus always resolve to
 * the top-most layer.
 */
export type OverlayId = "menu" | "search" | "wishlist" | "account" | "cart" | "region";

type OverlayContextValue = {
  active: OverlayId | null;
  isOpen: (id: OverlayId) => boolean;
  open: (id: OverlayId) => void;
  close: () => void;
  toggle: (id: OverlayId) => void;
};

const Ctx = createContext<OverlayContextValue | null>(null);

export function OverlayProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<OverlayId | null>(null);

  const open = useCallback((id: OverlayId) => setActive(id), []);
  const close = useCallback(() => setActive(null), []);
  const toggle = useCallback((id: OverlayId) => setActive((cur) => (cur === id ? null : id)), []);
  const isOpen = useCallback((id: OverlayId) => active === id, [active]);

  const value = useMemo(
    () => ({ active, isOpen, open, close, toggle }),
    [active, isOpen, open, close, toggle],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useOverlay() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useOverlay must be used inside <OverlayProvider>");
  return ctx;
}
