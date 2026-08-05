import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getProduct, type Product } from "./mockData";

export type CartLine = { id: string; size: string; qty: number };

type CartCtx = {
  lines: CartLine[];
  count: number;
  /** Resolved lines with their product record (skips unknown ids). */
  detailed: { line: CartLine; product: Product }[];
  /** Base-currency (EUR) subtotal. */
  subtotal: number;
  add: (id: string, size: string, qty?: number) => void;
  setQty: (id: string, size: string, qty: number) => void;
  remove: (id: string, size: string) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "late-edit-bag";

/** One-of-one stock: a line can never exceed a single unit. */
const MAX_QTY = 1;

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const add = (id: string, size: string, qty = 1) =>
    setLines((prev) => {
      const i = prev.findIndex((l) => l.id === id && l.size === size);
      if (i === -1) return [...prev, { id, size, qty: Math.min(qty, MAX_QTY) }];
      const next = [...prev];
      next[i] = { ...next[i], qty: Math.min(next[i].qty + qty, MAX_QTY) };
      return next;
    });

  const setQty = (id: string, size: string, qty: number) =>
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => !(l.id === id && l.size === size))
        : prev.map((l) => (l.id === id && l.size === size ? { ...l, qty: Math.min(qty, MAX_QTY) } : l)),
    );

  const remove = (id: string, size: string) =>
    setLines((prev) => prev.filter((l) => !(l.id === id && l.size === size)));

  const value = useMemo<CartCtx>(() => {
    const detailed = lines.flatMap((line) => {
      const product = getProduct(line.id);
      return product ? [{ line, product }] : [];
    });
    return {
      lines,
      detailed,
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal: detailed.reduce((n, d) => n + d.product.price * d.line.qty, 0),
      add,
      setQty,
      remove,
      clear: () => setLines([]),
    };
  }, [lines]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCart must be used within CartProvider");
  return v;
}
