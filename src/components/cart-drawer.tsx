import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import { products } from "@/lib/mockData";
import { useCart } from "@/lib/cart-context";
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

  const { detailed, count, subtotal, setQty, remove } = useCart();
  const { currency } = useSettings();
  const highlights = products.filter((p) => p.status === "available").slice(0, 3);
  const empty = detailed.length === 0;

  return (
    <div
      className={`fixed inset-0 z-[60] transition-opacity duration-500 ${
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={onClose} />
      <aside
        className={`absolute right-0 top-0 h-dvh w-full max-w-md bg-surface border-l border-border transition-transform duration-[520ms] ease-editorial will-change-transform ${
          open ? "translate-x-0" : "translate-x-full"
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
                {detailed.map(({ line, product }) => (
                  <li key={`${line.id}-${line.size}`} className="flex gap-4 px-6 md:px-8 py-5">
                    <Link to="/product/$id" params={{ id: product.id }} onClick={onClose} className="shrink-0">
                      <img src={product.images[0]} alt={product.title} className="w-20 h-24 object-cover object-top" />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="label-eyebrow !text-foreground/70">{product.serial} · {line.size}</div>
                      <Link
                        to="/product/$id"
                        params={{ id: product.id }}
                        onClick={onClose}
                        className="font-display text-base block truncate hover:chrome-text"
                      >
                        {product.title}
                      </Link>
                      <Price product={product} className="mt-1 block text-sm" as="div" />

                      <div className="mt-3 flex items-center gap-3">
                        <div className="inline-flex items-center border border-border">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() => setQty(line.id, line.size, line.qty - 1)}
                            className="h-8 w-8 inline-flex items-center justify-center hover:bg-background transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="price-num w-8 text-center text-xs">{line.qty}</span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            disabled
                            title="One-of-one — single unit only"
                            className="h-8 w-8 inline-flex items-center justify-center opacity-30 cursor-not-allowed"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(line.id, line.size)}
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
              Duties settled at checkout · Insured worldwide shipping
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
