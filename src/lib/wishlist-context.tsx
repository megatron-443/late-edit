import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type WishlistCtx = {
  ids: string[];
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  remove: (id: string) => void;
  count: number;
};

const Ctx = createContext<WishlistCtx | null>(null);
const KEY = "late-edit-wishlist";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setIds(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(KEY, JSON.stringify(ids));
  }, [ids, hydrated]);

  const has = (id: string) => ids.includes(id);
  const toggle = (id: string) => setIds((p) => (p.includes(id) ? p.filter((i) => i !== id) : [...p, id]));
  const remove = (id: string) => setIds((p) => p.filter((i) => i !== id));

  return (
    <Ctx.Provider value={{ ids, has, toggle, remove, count: ids.length }}>
      {children}
    </Ctx.Provider>
  );
}

export function useWishlist() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useWishlist must be used within WishlistProvider");
  return v;
}
