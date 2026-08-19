import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { X, Trash2, Timer } from "lucide-react";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import { OverlayPortal, useOverlayPresence } from "./overlay-portal";
import { products } from "@/lib/mockData";
import { formatHold, useCart } from "@/lib/cart-context";
import { useSettings } from "@/lib/settings-context";
import { formatAmount } from "@/lib/catalogue";
import { Price } from "./price";

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  useBodyScrollLock(open);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const { detailed, count, subtotal, remove, released, acknowledgeReleased } = useCart();
  const { currency } = useSettings();
  const highlights = products.filter((p) => p.status === "available").slice(0, 3);
  const empty = detailed.length === 0;

  const { mounted, shown } = useOverlayPresence(open, 560);

  if (!mounted) return null;

  return (
    <OverlayPortal>
    <div
      className={`fixed inset-0 z-[60] transition-opacity duration-500 ${
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
            <span className="label-eyebrow !text-foreground">
              Your Atelier Bag — {count} {count === 1 ? "item" : "items"}
            </span>
            <button
              onClick={onClose}
              aria-label="Close bag"
              className="press inline-flex items-center justify-center min-w-[44px] min-h-[44px] -mr-2 opacity-80 hover:opacity-100 hover:rotate-90"
            >
              <X size={20} />
            </button>
          </div>

          {released.length > 0 && (
            <div className="px-6 md:px-8 py-3 border-b border-border bg-surface">
              <p className="text-[0.7rem] text-muted-foreground leading-relaxed">
                {released.join(", ")} {released.length === 1 ? "was" : "were"} released back to the floor — the 20-minute hold lapsed or the piece sold.
              </p>
              <button type="button" onClick={acknowledgeReleased} className="mt-1 label-eyebrow text-muted-foreground hover:!text-foreground">
                Dismiss
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto scrollbar-luxury">
            {empty ? (
              <>
                <div className="px-6 md:px-8 pt-8 pb-6 text-center">
                  <p className="font-display text-2xl md:text-3xl leading-tight max-w-xs mx-auto">
                    Your bag is quiet.
                  </p>
                  <p className="mt-3 text-sm text-muted-foreground max-w-xs mx-auto">
                    Every LATE EDIT piece is one-of-one. When it's gone, it's gone.
                  </p>
                </div>

                <div className="px-6 md:px-8 pb-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="label-eyebrow">Curated Serials</span>
                    <Link to="/shop" onClick={onClose} className="label-eyebrow text-muted-foreground hover:!text-foreground">
                      View all
                    </Link>
                  </div>
                  <ul className="space-y-4">
                    {highlights.map((p) => (
                      <li key={p.id}>
                        <Link
                          to="/product/$id"
                          params={{ id: p.id }}
                          onClick={onClose}
                          className="flex items-center gap-4 group"
                        >
                          <img src={p.images[0]} alt={p.title} className="w-16 h-20 object-cover object-top shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="label-eyebrow !text-foreground/70">{p.serial}</div>
                            <div className="font-display text-base truncate group-hover:chrome-text">{p.title}</div>
                            <div className="mt-1 text-xs text-muted-foreground truncate">{p.fabricType}</div>
                          </div>
                          <Price product={p} className="text-sm chrome-text shrink-0" as="div" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <ul className="divide-y divide-border">
                {detailed.map(({ line, product, msLeft }) => (
                  <li key={line.id} className="flex gap-4 px-6 md:px-8 py-5">
                    <Link to="/product/$id" params={{ id: product.id }} onClick={onClose} className="shrink-0">
                      <img src={product.images[0]} alt={product.title} className="w-20 h-24 object-cover object-top" />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="label-eyebrow !text-foreground/70">{product.serial} · Size {line.size}</div>
                      <Link
                        to="/product/$id"
                        params={{ id: product.id }}
                        onClick={onClose}
                        className="font-display text-base block truncate hover:chrome-text"
                      >
                        {product.title}
                      </Link>
                      <Price product={product} className="mt-1 block text-sm" as="div" />

                      <div className="mt-3 flex items-center gap-4">
                        <span className="inline-flex items-center gap-1.5 text-[0.65rem] tracking-[0.14em] uppercase text-muted-foreground">
                          <Timer size={12} strokeWidth={1.6} />
                          Held <span className="price-num">{formatHold(msLeft)}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => remove(line.id)}
                          className="inline-flex items-center gap-1.5 text-[0.65rem] tracking-[0.16em] uppercase text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div
            className="px-6 md:px-8 py-4 md:py-6 border-t border-border"
            style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
          >
            {!empty && (
              <div className="mb-4 flex items-center justify-between">
                <span className="label-eyebrow">Subtotal</span>
                <span className="price-num text-sm">{formatAmount(subtotal, currency)}</span>
              </div>
            )}
            {empty ? (
              <button disabled className="w-full label-eyebrow border border-border py-4 !text-chrome-muted">
                Checkout
              </button>
            ) : (
              <Link
                to="/checkout"
                onClick={onClose}
                className="block w-full text-center label-eyebrow !text-background bg-foreground py-4 hover:bg-chrome transition-colors press"
              >
                Checkout
              </Link>
            )}
            <p className="mt-3 text-[0.65rem] text-muted-foreground text-center">
              {empty ? "Duties settled at checkout · Insured worldwide shipping" : "Each piece is held for 20 minutes · Stock is re-checked before payment"}
            </p>
          </div>
        </div>
      </aside>
    </div>
    </OverlayPortal>
  );
}
