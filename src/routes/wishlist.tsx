import { SmartImage } from "@/components/smart-image";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, X } from "lucide-react";
import { products } from "@/lib/mockData";
import { useWishlist } from "@/lib/wishlist-context";
import { useCart } from "@/lib/cart-context";
import { Price } from "@/components/price";
import { ProductTags } from "@/components/product-tags";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Saved Pieces — LATE EDIT" },
      {
        name: "description",
        content:
          "Your saved one-of-one pieces. Move a serial to the Atelier Bag before it is claimed — every LATE EDIT piece exists once.",
      },
      { property: "og:title", content: "Saved Pieces — LATE EDIT" },
      {
        property: "og:description",
        content: "Your saved one-of-one pieces, ready to move to the Atelier Bag.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { ids, remove } = useWishlist();
  const { add, has: inBag } = useCart();
  const items = products.filter((p) => ids.includes(p.id));

  if (items.length === 0) {
    return (
      <div className="pt-32 pb-32 px-6 text-center">
        <div className="label-eyebrow">Wishlist</div>
        <h1 className="mt-4 font-display text-4xl md:text-5xl">No saved pieces yet.</h1>
        <p className="mt-5 text-sm text-muted-foreground">
          Tap the heart on any 1-of-1 and it will wait for you here.
        </p>
        <Link
          to="/shop"
          className="mt-10 inline-block label-eyebrow !text-background bg-foreground px-8 py-4 hover:bg-chrome transition-colors press"
        >
          Browse the edit
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-24">
      <div className="max-w-5xl mx-auto px-6">
        <div className="label-eyebrow">Wishlist</div>
        <h1 className="mt-3 font-display text-4xl md:text-5xl">Saved pieces.</h1>
        <p className="mt-4 text-sm text-muted-foreground max-w-md leading-relaxed">
          Saving a piece does not hold it. A 20-minute hold begins only once it is moved to your
          Atelier Bag.
        </p>

        <ul className="mt-12 divide-y divide-border border-y border-border">
          {items.map((p) => {
            const held = inBag(p.id);
            const available = p.status === "available";
            return (
              <li key={p.id} className="flex flex-col sm:flex-row gap-5 py-6">
                <Link to="/product/$id" params={{ id: p.id }} className="shrink-0">
                  <SmartImage
                    src={p.images[0]}
                    alt={p.title}
                    ratio="3/4"
                    className="w-28 h-36 object-cover object-top"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <ProductTags tags={p.tags} className="mb-3" />
                  <div className="label-eyebrow !text-foreground/70">
                    {p.serial} · Size {p.size}
                  </div>
                  <Link
                    to="/product/$id"
                    params={{ id: p.id }}
                    className="font-display text-2xl block hover:chrome-text"
                  >
                    {p.title}
                  </Link>
                  <div className="mt-1 text-xs text-muted-foreground">{p.fabricType}</div>
                  <Price product={p} className="mt-3 block text-base chrome-text" as="div" />

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      disabled={!available || held}
                      onClick={() => {
                        const r = add(p.id);
                        if (r.ok) remove(p.id);
                      }}
                      className="label-eyebrow !text-background bg-foreground px-6 py-4 hover:bg-chrome transition-colors disabled:bg-muted disabled:!text-chrome-muted disabled:cursor-not-allowed press"
                    >
                      {!available ? "Unavailable" : held ? "Held in your bag" : "Move to bag"}
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(p.id)}
                      className="inline-flex items-center gap-2 label-eyebrow border border-border px-5 py-4 hover:border-foreground transition-colors press"
                    >
                      <X size={13} /> Remove
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <p className="mt-8 inline-flex items-center gap-2 text-xs text-muted-foreground">
          <Heart size={13} strokeWidth={1.6} /> Wishlist saved locally to this device.
        </p>
      </div>
    </div>
  );
}
