import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { type Product } from "@/lib/mockData";
import { useWishlist } from "@/lib/wishlist-context";
import { Price } from "./price";

const statusLabel: Record<Product["status"], string> = {
  available: "",
  reserved: "Reserved",
  sold_out: "Sold",
};

/**
 * Editorial product card.
 *
 * Visual hierarchy is deliberate and non-negotiable:
 *   1. Metadata eyebrow  — geometric sans, letter-spaced uppercase
 *   2. Title             — editorial serif (font-display)
 *   3. Price             — tabular sans via <Price /> (`price-num`)
 *
 * On hover:
 *   - secondary image cross-fades
 *   - a size availability strip reveals along the bottom of the image
 */
export function ProductCard({ product }: { product: Product }) {
  const { has, toggle } = useWishlist();
  const saved = has(product.id);
  const status = statusLabel[product.status];
  const eyebrow = [product.tags[0]?.label ?? "1-of-1", product.fabricType].filter(Boolean).join(" · ");
  const primary = product.images[0];
  const secondary = product.images[1];

  return (
    <div className="group block">
      <Link to="/product/$id" params={{ id: product.id }} className="block">
        <div className="relative overflow-hidden bg-[oklch(0.96_0.003_85)] dark:bg-surface-elevated aspect-[3/4]">
          <img
            src={primary}
            alt={product.title}
            loading="lazy"
            decoding="async"
            width={900}
            height={1200}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
            }}
            className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
          />
          {secondary && (
            <img
              src={secondary}
              alt=""
              aria-hidden
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover object-center opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100 motion-reduce:hidden"
            />
          )}

          {/* Size availability preview — desktop hover only */}
          {product.status === "available" && product.size && (
            <div
              className="hidden md:flex absolute inset-x-0 bottom-0 items-center justify-center gap-4 bg-background/90 backdrop-blur-sm py-3 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:hidden"
              aria-hidden
            >
              <span className="price-num text-[0.7rem] tracking-[0.18em] uppercase text-foreground/80">
                Size {product.size}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(product.id); }}
            aria-label={saved ? `Remove ${product.title} from wishlist` : `Save ${product.title} to wishlist`}
            aria-pressed={saved}
            className={`absolute top-3 right-3 p-2 text-foreground/80 hover:text-foreground transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 ${
              saved ? "md:!opacity-100" : ""
            }`}
          >
            <Heart size={18} fill={saved ? "currentColor" : "none"} strokeWidth={1.5} />
          </button>
        </div>
      </Link>

      <Link to="/product/$id" params={{ id: product.id }} className="mt-4 block">
        {/* 1. Eyebrow — metadata */}
        {eyebrow && (
          <div className="text-[0.6rem] tracking-[0.24em] uppercase text-muted-foreground">
            {eyebrow}
          </div>
        )}
        {/* 2. Title — editorial serif */}
        <div className="mt-2 font-display text-[15px] md:text-base leading-snug text-foreground group-hover:underline underline-offset-4 decoration-foreground/30">
          {product.title}
        </div>
        {/* 3. Price — tabular sans */}
        <div className="mt-1.5 flex items-baseline gap-2">
          <Price product={product} className="text-sm text-foreground" />
          {status && (
            <span className="text-[0.6rem] tracking-[0.24em] uppercase text-muted-foreground">
              · {status}
            </span>
          )}
        </div>
      </Link>
    </div>
  );
}
