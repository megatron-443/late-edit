import { createFileRoute } from "@tanstack/react-router";
import { products } from "@/lib/mockData";
import { CategoryPage } from "@/components/category-page";

export const Route = createFileRoute("/men")({
  validateSearch: (search: Record<string, unknown>) => ({
    category: typeof search.category === "string" ? search.category : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Men — LATE EDIT" },
      { name: "description", content: "Menswear from LATE EDIT — reconstructed tailoring, reworked outerwear, and one-of-one silhouettes." },
      { property: "og:title", content: "Men — LATE EDIT" },
      { property: "og:description", content: "Menswear from LATE EDIT — reconstructed tailoring, reworked outerwear, and one-of-one silhouettes." },
    ],
  }),
  component: MenPage,
});

function MenPage() {
  const { category } = Route.useSearch();
  return (
    <CategoryPage
      eyebrow="Men"
      title="Fall–Winter 2026"
      intro="Tailoring cut from the ghost of vintage suiting, cargo and outerwear reworked from surplus lots."
      items={products.filter((p) => p.gender === "men" || p.gender === "unisex")}
      initialCategory={category}
    />
  );
}
