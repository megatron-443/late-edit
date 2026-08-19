import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useWishlist } from "@/lib/wishlist-context";
import { products } from "@/lib/mockData";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import { OverlayPortal, useOverlayPresence } from "./overlay-portal";
import { Price } from "./price";

export function WishlistDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { ids, remove } = useWishlist();
  const items = products.filter((p) => ids.includes(p.id));
  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const { mounted, shown } = useOverlayPresence(open, 560);

  if (!mounted) return null;

  return (
    <OverlayPortal>
    <div
      className={`fixed inset-0 z-[70] transition-opacity duration-500 ${
        shown ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      aria-hidden={!shown}
    >
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={onClose} />
      <aside
        className={`absolute right-0 top-0 h-dvh w-full max-w-md bg-surface border-l border-border transition-transform duration-[520ms] ease-editorial will-change-transform ${
          shown ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-6 md:px-8 py-4 md:py-6 border-b border-border">
            <span className="label-eyebrow !text-foreground">Wishlist — {items.length}</span>
            <button
              onClick={onClose}
              aria-label="Close wishlist"
              className="press inline-flex items-center justify-center min-w-[44px] min-h-[44px] -mr-2 opacity-80 hover:opacity-100 hover:rotate-90"
            >
              <X size={20} />
            </button>
          </div>


          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
              <p className="font-display text-3xl leading-tight max-w-xs">No saved pieces yet.</p>
              <p className="mt-4 text-sm text-muted-foreground max-w-xs">
                Tap the heart on any 1-of-1 to hold it here.
              </p>
            </div>
          ) : (
            <ul className="flex-1 overflow-y-auto divide-y divide-border">
              {items.map((p, i) => (
                <li
                  key={p.id}
                  className="flex gap-4 px-8 py-6 reveal-up"
                  style={{ ["--i" as string]: i } as React.CSSProperties}
                >
                  <Link to="/product/$id" params={{ id: p.id }} onClick={onClose} className="shrink-0">
                    <img src={p.images[0]} alt={p.title} className="w-20 h-24 object-cover object-top transition-transform duration-500 ease-editorial hover:scale-[1.02]" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="label-eyebrow !text-foreground/80">{p.serial}</div>
                    <Link to="/product/$id" params={{ id: p.id }} onClick={onClose} className="font-display text-lg block truncate">
                      {p.title}
                    </Link>
                    <div className="mt-1 text-xs text-muted-foreground">{p.fabricType}</div>
                    <Price product={p} className="mt-2 block text-sm chrome-text" as="div" />
                  </div>
                  <button
                    onClick={() => remove(p.id)}
                    aria-label={`Remove ${p.title}`}
                    className="press text-muted-foreground hover:!text-foreground self-start p-1"
                  >
                    <X size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div
            className="px-8 py-6 border-t border-border"
            style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
          >
            <p className="text-xs text-muted-foreground">Wishlist saved locally to this device.</p>
          </div>
        </div>
      </aside>
    </div>
    </OverlayPortal>
  );
}
