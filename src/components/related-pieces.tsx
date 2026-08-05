import { Link } from "@tanstack/react-router";
import { products, type Product } from "@/lib/mockData";
import { Price } from "@/components/price";

export function RelatedPieces({ current }: { current: Product }) {
  const related = products
    .filter((p) => p.id !== current.id)
    .sort((a, b) => {
      const sameCat = (p: Product) => (p.category === current.category ? 0 : 1);
      return sameCat(a) - sameCat(b);
    })
    .slice(0, 6);

  if (related.length === 0) return null;

  return (
    <section className="mt-24 border-t border-border pt-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="label-eyebrow">From the same edit</div>
            <h2 className="mt-2 font-display text-2xl md:text-3xl">Related pieces.</h2>
          </div>
          <Link to="/shop" className="hidden md:inline-block label-eyebrow border-b border-foreground/30 hover:border-foreground pb-1">
            View catalogue →
          </Link>
        </div>
        <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory -mx-6 px-6 scrollbar-none pb-2">
          {related.map((p) => (
            <Link
              key={p.id}
              to="/product/$id"
              params={{ id: p.id }}
              className="group snap-start shrink-0 w-[70%] sm:w-[42%] md:w-[28%] lg:w-[22%]"
            >
              <div className="aspect-[3/4] bg-surface overflow-hidden">
                <img
                  src={p.images[0]}
                  alt={p.title}
                  loading="lazy"
                  className="h-full w-full object-cover object-top transition-transform duration-[900ms] ease-out group-hover:scale-[1.03]"
                />
              </div>
              <div className="mt-3">
                <div className="label-eyebrow !text-foreground/60 text-[0.6rem]">{p.serial}</div>
                <div className="mt-1 text-sm text-foreground">{p.title}</div>
                <Price product={p} className="mt-1 block text-xs text-muted-foreground" as="div" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
