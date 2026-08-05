import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Heart, RotateCcw, MapPin } from "lucide-react";
import { getProduct, products, type Product } from "@/lib/mockData";
import { ProductCard } from "@/components/product-card";

import { Price } from "@/components/price";
import { getTaxInfo } from "@/lib/logistics";
import { PincodeEstimator } from "@/components/pincode-estimator";
import { PaymentStrip } from "@/components/payment-strip";
import { RelatedPieces } from "@/components/related-pieces";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { useWishlist } from "@/lib/wishlist-context";
import { useCart } from "@/lib/cart-context";
import { ProductTags } from "@/components/product-tags";

export const Route = createFileRoute("/product/$id")({
  loader: ({ params }): { product: Product } => {
    const product = getProduct(params.id);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Unavailable — LATE EDIT" }, { name: "robots", content: "noindex" }] };
    }
    const { product } = loaderData;
    return {
      meta: [
        { title: `${product.title} — LATE EDIT` },
        { name: "description", content: product.description },
        { property: "og:title", content: `${product.title} — LATE EDIT` },
        { property: "og:description", content: product.description },
        { property: "og:image", content: product.images[0] },
        { name: "twitter:image", content: product.images[0] },
      ],
    };
  },
  component: ProductPage,
  notFoundComponent: ProductNotFound,
});

function ProductNotFound() {
  const suggestions = products.filter((p) => p.status === "available").slice(0, 4);
  return (
    <div className="pt-32 pb-24">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <div className="label-eyebrow">Archive · Unavailable</div>
        <h1 className="mt-5 font-display text-4xl md:text-5xl leading-tight text-balance">
          This piece is no longer on the rail.
        </h1>
        <p className="mt-6 text-sm md:text-base text-muted-foreground leading-relaxed text-balance max-w-[52ch] mx-auto">
          The serial you followed has either been claimed, retired from the
          archive, or never existed. Because every LATE EDIT garment is
          one-of-one, it will not be restocked — but the current edit is open.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-3">
          <Link
            to="/shop"
            className="label-eyebrow !text-background bg-foreground px-8 py-4 hover:bg-chrome transition-colors press"
          >
            Browse the Selection →
          </Link>
          <Link
            to="/"
            className="label-eyebrow border border-border px-8 py-4 hover:border-foreground transition-colors press"
          >
            Back to Homepage
          </Link>
        </div>
      </div>

      {suggestions.length > 0 && (
        <section className="mt-20 border-t border-border pt-14">
          <div className="max-w-7xl mx-auto px-6">
            <div className="label-eyebrow">Still available</div>
            <h2 className="mt-2 font-display text-2xl md:text-3xl">Other one-of-ones.</h2>
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-5">
              {suggestions.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}


function ProductPage() {
  const { product } = Route.useLoaderData() as { product: Product };
  const tax = getTaxInfo(product);

  const { has, toggle } = useWishlist();
  const { add } = useCart();
  const saved = has(product.id);
  const [size, setSize] = useState(product.sizes[0]);
  const [added, setAdded] = useState(false);

  // Single smart CTA: the sticky bar only appears once the inline button
  // has scrolled out of view, so two "Add to bag" buttons are never visible.
  const ctaRef = useRef<HTMLDivElement>(null);
  const [ctaVisible, setCtaVisible] = useState(true);
  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setCtaVisible(entry.isIntersecting), {
      rootMargin: "-80px 0px -80px 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const addToBag = () => {
    add(product.id, size);
    setAdded(true);
  };

  return (
    <div className="pt-28 pb-24 md:pb-0">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-[1.4fr_1fr] gap-16">
        {/* Gallery — vertical stack on desktop, snap-scroll carousel on mobile */}
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory lg:flex-col lg:overflow-visible -mx-6 px-6 lg:mx-0 lg:px-0 scrollbar-none">
          {product.images.map((src, i) => (
            <div
              key={i}
              className="bg-surface aspect-[3/4] overflow-hidden shrink-0 w-[85%] snap-center lg:w-full"
            >
              <img
                src={src}
                alt={`${product.title} — view ${i + 1}`}
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
                className="h-full w-full object-cover object-top"
              />
            </div>
          ))}
        </div>

        {/* Details */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <ProductTags tags={product.tags} className="mb-6" />


          <div className="label-eyebrow">{product.serial}</div>
          <h1 className="mt-3 font-display text-5xl leading-tight">{product.title}</h1>
          <Price product={product} className="mt-4 block text-2xl chrome-text" as="div" />

          {/* Tax + origin line — India compliance */}
          <div className="mt-3 text-[0.7rem] tracking-[0.04em] text-muted-foreground leading-relaxed">
            <span className="price-num">HSN {tax.hsn}</span>
            <span className="mx-2 opacity-40">·</span>
            <span>Inclusive of <span className="price-num">{tax.gst}%</span> GST</span>
            <span className="mx-2 opacity-40">·</span>
            <span className="inline-flex items-center gap-1">
              <MapPin size={11} strokeWidth={1.6} /> Ships from Mumbai atelier
            </span>
            <div className="mt-1">International orders shipped DDP — duties settled at checkout.</div>
          </div>

          <p className="mt-8 text-sm text-muted-foreground leading-relaxed">
            {product.description}
          </p>

          {/* Provenance */}
          <div className="mt-10 border-t border-border pt-8 space-y-5">
            <DetailRow label="Category" value={product.category} />
            <DetailRow label="Fabric" value={product.fabricType} />
            <DetailRow label="Provenance" value={product.fabricProvenance} />
            <DetailRow label="Status" value={
              product.status === "available" ? "Available" :
              product.status === "reserved" ? "Reserved" : "Sold Out"
            } />
          </div>

          {/* Size — compact, uniform 44px chips */}
          <div className="mt-10">
            <div className="flex items-baseline justify-between mb-3">
              <div className="label-eyebrow">Size</div>
              <Link to="/services" className="text-[0.65rem] tracking-[0.16em] uppercase text-muted-foreground hover:text-foreground">
                Size guide
              </Link>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  aria-pressed={size === s}
                  className={`label-eyebrow min-w-[3rem] h-11 px-3 border text-[0.65rem] transition-colors duration-200 press ${
                    size === s
                      ? "border-foreground bg-foreground !text-background"
                      : "border-border hover:border-foreground"
                  }`}
                  style={{ transitionTimingFunction: "var(--ease-editorial)" }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div ref={ctaRef} className="mt-10 flex gap-3">
            <button
              type="button"
              onClick={addToBag}
              disabled={product.status !== "available"}
              className="flex-1 label-eyebrow !text-background bg-foreground py-5 hover:bg-chrome transition-colors disabled:bg-muted disabled:!text-chrome-muted disabled:cursor-not-allowed press"
            >
              {product.status === "available"
                ? added ? "Added · In your bag" : "Add to Atelier Bag"
                : "Unavailable"}
            </button>
            <button
              type="button"
              onClick={() => toggle(product.id)}
              aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
              aria-pressed={saved}
              className="px-5 border border-border hover:border-foreground transition-colors"
            >
              <Heart size={18} fill={saved ? "currentColor" : "none"} />
            </button>
          </div>

          {added && (
            <Link
              to="/checkout"
              className="mt-3 inline-flex items-center gap-2 label-eyebrow border-b border-foreground/40 hover:border-foreground pb-0.5"
              style={{ animation: "le-fade-scale 240ms var(--ease-editorial) both" }}
            >
              Proceed to checkout →
            </Link>
          )}


          {/* Returns summary next to CTA */}
          <div className="mt-4 flex items-start gap-2 text-[0.72rem] text-muted-foreground leading-relaxed">
            <RotateCcw size={13} strokeWidth={1.5} className="mt-0.5 shrink-0" />
            <span>
              14-day return on unworn stock pieces. Reserved &amp; made-to-order are final sale.{" "}
              <Link to="/legal/$slug" params={{ slug: "returns" }} className="underline underline-offset-4 hover:text-foreground">
                Full policy
              </Link>
              .
            </span>
          </div>

          {/* Pincode + payments */}
          <div className="mt-6 space-y-5">
            <PincodeEstimator />
            <PaymentStrip />
          </div>

          {/* Structured accordions */}
          <div className="mt-10 border-t border-border">
            <Accordion type="single" collapsible defaultValue="fit">
              <AccordionItem value="fit">
                <AccordionTrigger className="label-eyebrow !no-underline hover:!no-underline">
                  Fit &amp; Measurements
                </AccordionTrigger>
                <AccordionContent className="text-sm text-foreground/85 leading-relaxed space-y-2">
                  <p>Cut to a considered, contemporary fit. Detailed flat measurements are logged on the provenance card that ships with the piece.</p>
                  <ul className="mt-3 grid grid-cols-2 gap-y-1.5 text-[0.72rem] text-muted-foreground price-num">
                    <li>Chest · 52 cm</li>
                    <li>Length · 68 cm</li>
                    <li>Shoulder · 46 cm</li>
                    <li>Sleeve · 62 cm</li>
                  </ul>
                  <p className="text-xs text-muted-foreground pt-2">Model wears size M. If between sizes, size down for a closer silhouette.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="fabric">
                <AccordionTrigger className="label-eyebrow !no-underline hover:!no-underline">
                  Fabric &amp; Care
                </AccordionTrigger>
                <AccordionContent className="text-sm text-foreground/85 leading-relaxed space-y-2">
                  <p>{product.fabricType}. {product.fabricProvenance}</p>
                  <p className="text-xs text-muted-foreground">Specialist dry-clean only. Store on a padded hanger, away from direct sunlight. Every LATE EDIT piece includes complimentary lifetime conditioning at our Mumbai atelier.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="shipping">
                <AccordionTrigger className="label-eyebrow !no-underline hover:!no-underline">
                  Shipping &amp; Returns
                </AccordionTrigger>
                <AccordionContent className="text-sm text-foreground/85 leading-relaxed space-y-2">
                  <p>Insured, signature-on-delivery. Pan-India 2–5 business days via Bluedart / Delhivery. International 5–9 business days via DHL Express on a duties-paid basis.</p>
                  <p>14-day return on unworn stock pieces with the provenance card intact. Reserved and made-to-order pieces are final sale.</p>
                  <div className="flex gap-4 pt-1">
                    <Link to="/legal/$slug" params={{ slug: "returns" }} className="text-xs underline underline-offset-4 hover:text-foreground">Returns policy</Link>
                    <Link to="/legal/$slug" params={{ slug: "terms" }} className="text-xs underline underline-offset-4 hover:text-foreground">Terms of Sale</Link>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <Link to="/shop" className="mt-8 inline-block label-eyebrow hover:!text-foreground">
            ← Back to catalogue
          </Link>
        </div>
      </div>

      {/* Related pieces */}
      <RelatedPieces current={product} />

      {/* Mobile sticky action bar — only while the inline CTA is off-screen */}
      <div
        aria-hidden={ctaVisible}
        className={`md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur border-t border-border transition-all duration-300 ${
          ctaVisible ? "translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
        }`}
        style={{
          paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
          transitionTimingFunction: "var(--ease-editorial)",
        }}
      >
        <div className="flex items-center gap-3 px-4 pt-3">
          <div className="min-w-0 flex-1">
            <div className="label-eyebrow !text-foreground/70 text-[0.6rem]">{product.serial} · {size}</div>
            <Price product={product} className="block text-base text-foreground truncate" as="div" />
          </div>
          {added ? (
            <Link
              to="/checkout"
              className="label-eyebrow !text-background bg-foreground px-6 py-4 hover:bg-chrome transition-colors press"
            >
              Checkout
            </Link>
          ) : (
            <button
              type="button"
              onClick={addToBag}
              disabled={product.status !== "available"}
              className="label-eyebrow !text-background bg-foreground px-6 py-4 hover:bg-chrome transition-colors disabled:bg-muted disabled:!text-chrome-muted disabled:cursor-not-allowed press"
            >
              {product.status === "available" ? "Add to Bag" : "Unavailable"}
            </button>
          )}
        </div>
      </div>

    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[1fr_2fr] gap-6">
      <div className="label-eyebrow !text-foreground/70">{label}</div>
      <div className="text-sm text-foreground">{value}</div>
    </div>
  );
}
