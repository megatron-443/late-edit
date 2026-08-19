import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { getProduct, type Product } from "./mockData";

/**
 * One-of-one commerce model.
 *
 * A piece is a single inventory unit: one product id === one unit, in one
 * fixed size. There is no quantity and no variant matrix. Adding a piece to
 * the bag places a *time-boxed hold* (20 minutes) — it is not ownership, and
 * stock is revalidated again immediately before the order is confirmed.
 */
export const HOLD_MS = 20 * 60 * 1000;

export type CartLine = {
  id: string;
  /** Snapshot of the fixed size at the time of adding. */
  size: string;
  addedAt: number;
  /** Epoch ms at which the hold lapses and the piece returns to the floor. */
  holdExpiresAt: number;
};

export type DetailedLine = { line: CartLine; product: Product; msLeft: number };

export type AddResult =
  | { ok: true; already: boolean }
  | { ok: false; reason: "missing" | "unavailable" | "no-size" };

export type Revalidation = { ok: boolean; dropped: { title: string; reason: "sold" | "expired" | "missing" }[] };

type CartCtx = {
  lines: CartLine[];
  count: number;
  /** Resolved lines with their product record and remaining hold time. */
  detailed: DetailedLine[];
  /** Base-currency (EUR) subtotal. */
  subtotal: number;
  /** Soonest hold expiry across the bag, in ms (null when the bag is empty). */
  soonestHoldMs: number | null;
  /** Pieces released since the last acknowledgement (expired / sold / removed). */
  released: string[];
  acknowledgeReleased: () => void;
  add: (id: string) => AddResult;
  has: (id: string) => boolean;
  remove: (id: string) => void;
  clear: () => void;
  /** Re-checks live stock + holds. Drops anything no longer purchasable. */
  revalidate: () => Revalidation;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "late-edit-bag";

function isPurchasable(p: Product | undefined): boolean {
  return !!p && p.status === "available" && !!p.size;
}


export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [released, setReleased] = useState<string[]>([]);
  const releasedRef = useRef<string[]>([]);

  const pushReleased = useCallback((titles: string[]) => {
    if (titles.length === 0) return;
    releasedRef.current = [...releasedRef.current, ...titles];
    setReleased(releasedRef.current);
  }, []);

  /** Drops orphaned, sold, and lapsed lines from the actual cart state. */
  const prune = useCallback(
    (input: CartLine[], at: number) => {
      const kept: CartLine[] = [];
      const dropped: string[] = [];
      for (const line of input) {
        const product = getProduct(line.id);
        if (!isPurchasable(product)) {
          if (product) dropped.push(product.title);
          continue;
        }
        if (line.holdExpiresAt <= at) {
          if (product) dropped.push(product.title);
          continue;
        }

        kept.push(line);
      }
      return { kept, dropped };
    },
    [],
  );

  useEffect(() => {
    let stored: CartLine[] = [];
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          stored = parsed
            .filter((l): l is Partial<CartLine> => !!l && typeof l.id === "string")
            .map((l) => ({
              id: l.id as string,
              size: typeof l.size === "string" ? l.size : (getProduct(l.id as string)?.size ?? ""),
              addedAt: typeof l.addedAt === "number" ? l.addedAt : Date.now(),
              // Legacy lines (pre-hold) get a fresh hold rather than instantly lapsing.
              holdExpiresAt: typeof l.holdExpiresAt === "number" ? l.holdExpiresAt : Date.now() + HOLD_MS,
            }));
        }
      }
    } catch {}
    const at = Date.now();
    const { kept, dropped } = prune(stored, at);
    // De-duplicate by product id — one unique piece can only appear once.
    const seen = new Set<string>();
    setLines(kept.filter((l) => (seen.has(l.id) ? false : (seen.add(l.id), true))));
    pushReleased(dropped);
    setHydrated(true);
  }, [prune, pushReleased]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  // Drives hold countdowns and auto-releases lapsed pieces.
  useEffect(() => {
    if (!hydrated || lines.length === 0) return;
    const t = setInterval(() => {
      const at = Date.now();
      setNow(at);
      setLines((prev) => {
        const { kept, dropped } = prune(prev, at);
        if (dropped.length === 0 && kept.length === prev.length) return prev;
        pushReleased(dropped);
        return kept;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [hydrated, lines.length, prune, pushReleased]);

  const add = useCallback((id: string): AddResult => {
    const product = getProduct(id);
    if (!product) return { ok: false, reason: "missing" };
    if (!product.size) return { ok: false, reason: "no-size" };
    if (product.status !== "available") return { ok: false, reason: "unavailable" };

    let already = false;
    setLines((prev) => {
      if (prev.some((l) => l.id === id)) {
        already = true;
        return prev; // Max one unit per unique product id.
      }
      const at = Date.now();
      return [...prev, { id, size: product.size, addedAt: at, holdExpiresAt: at + HOLD_MS }];
    });
    return { ok: true, already };
  }, []);

  const remove = useCallback((id: string) => setLines((prev) => prev.filter((l) => l.id !== id)), []);

  const revalidate = useCallback((): Revalidation => {
    const at = Date.now();
    const dropped: Revalidation["dropped"] = [];
    setLines((prev) => {
      const kept: CartLine[] = [];
      for (const line of prev) {
        const product = getProduct(line.id);
        if (!product) {
          dropped.push({ title: line.id, reason: "missing" });
          continue;
        }
        if (product.status !== "available") {
          dropped.push({ title: product.title, reason: "sold" });
          continue;
        }
        if (line.holdExpiresAt <= at) {
          dropped.push({ title: product.title, reason: "expired" });
          continue;
        }
        kept.push(line);
      }
      return dropped.length === 0 ? prev : kept;
    });
    return { ok: dropped.length === 0, dropped };
  }, []);

  const value = useMemo<CartCtx>(() => {
    const detailed = lines.flatMap<DetailedLine>((line) => {
      const product = getProduct(line.id);
      return product ? [{ line, product, msLeft: Math.max(0, line.holdExpiresAt - now) }] : [];
    });
    const soonest = detailed.length
      ? Math.max(0, Math.min(...detailed.map((d) => d.msLeft)))
      : null;
    return {
      lines,
      detailed,
      count: detailed.length,
      subtotal: detailed.reduce((n, d) => n + d.product.price, 0),
      soonestHoldMs: soonest,
      released,
      acknowledgeReleased: () => {
        releasedRef.current = [];
        setReleased([]);
      },
      add,
      has: (id: string) => lines.some((l) => l.id === id),
      remove,
      clear: () => setLines([]),
      revalidate,
    };
  }, [lines, now, released, add, remove, revalidate]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** mm:ss for hold countdowns. */
export function formatHold(ms: number) {
  const total = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

export function useCart() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCart must be used within CartProvider");
  return v;
}
