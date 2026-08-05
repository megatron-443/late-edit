import { formatPrice, type Product } from "@/lib/mockData";
import { useSettings } from "@/lib/settings-context";
import { cn } from "@/lib/utils";

/**
 * Centralized price renderer.
 *
 * Enforces the LATE EDIT numeric type system across every pricing surface
 * (PDP, cards, bag, wishlist, search, sticky bar). Numbers ship in the
 * geometric sans stack with tabular + lining figures so currency glyphs
 * (₹ $ € £ ¥) and digits share a stable baseline in both themes.
 */
export function Price({
  product,
  currency,
  className,
  as: Tag = "span",
}: {
  product: Product;
  /** Override the global currency (rare — e.g. compare views). */
  currency?: Parameters<typeof formatPrice>[1];
  className?: string;
  as?: "span" | "div" | "p";
}) {
  const settings = useSettings();
  return (
    <Tag className={cn("price-num", className)}>
      {formatPrice(product, currency ?? settings.currency)}
    </Tag>
  );
}
