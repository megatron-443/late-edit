import { CatalogueGrid } from "@/components/catalogue-grid";
import type { Product } from "@/lib/mockData";

type Props = {
  eyebrow: string;
  title: string;
  intro?: string;
  items: Product[];
};

export function CategoryPage({ eyebrow, title, intro, items }: Props) {
  return (
    <div className="pt-24 pb-24">
      <div className="max-w-3xl mx-auto text-center px-6 py-16 md:py-24">
        <div className="text-[0.7rem] tracking-[0.24em] uppercase text-muted-foreground">{eyebrow}</div>
        <h1 className="mt-4 font-display text-4xl md:text-6xl text-foreground">{title}</h1>
        {intro && <p className="mt-6 max-w-xl mx-auto text-sm text-muted-foreground">{intro}</p>}
      </div>

      {items.length === 0 ? (
        <div className="py-24 text-center text-sm text-muted-foreground">
          The atelier is preparing the next release. Return soon.
        </div>
      ) : (
        <CatalogueGrid items={items} />
      )}
    </div>
  );
}
