import { createFileRoute } from "@tanstack/react-router";
import { products } from "@/lib/mockData";
import { CatalogueGrid } from "@/components/catalogue-grid";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop — LATE EDIT" },
      { name: "description", content: "Browse the current LATE EDIT catalogue of 1-of-1 upcycled luxury pieces." },
      { property: "og:title", content: "Shop — LATE EDIT" },
      { property: "og:description", content: "Browse the current LATE EDIT catalogue of 1-of-1 upcycled luxury pieces." },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  return (
    <div className="pt-24 pb-24">
      <div className="max-w-4xl mx-auto text-center px-6 py-16">
        <div className="text-[0.7rem] tracking-[0.24em] uppercase text-muted-foreground">Catalogue — AW26</div>
        <h1 className="mt-4 font-display text-4xl md:text-6xl text-foreground">The full edit.</h1>
        <p className="mt-6 max-w-xl mx-auto text-sm text-muted-foreground">
          Every piece is serialised, one-of-one, and released once. When the tag turns, it's gone.
        </p>
      </div>

      <CatalogueGrid items={products} />
    </div>
  );
}
