import { createFileRoute } from "@tanstack/react-router";
import { products } from "@/lib/mockData";
import { CategoryPage } from "@/components/category-page";

export const Route = createFileRoute("/women")({
  validateSearch: (search: Record<string, unknown>) => ({
    category: typeof search.category === "string" ? search.category : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Women — LATE EDIT" },
      { name: "description", content: "Womenswear from LATE EDIT — 1-of-1 upcycled silhouettes reconstructed from archive fabric." },
      { property: "og:title", content: "Women — LATE EDIT" },
      { property: "og:description", content: "Womenswear from LATE EDIT — 1-of-1 upcycled silhouettes reconstructed from archive fabric." },
    ],
  }),
  component: WomenPage,
});

function WomenPage() {
  const { category } = Route.useSearch();
  return (
    <CategoryPage
      eyebrow="Women"
      title="New Arrivals"
      intro="A womenswear edit of reworked silks, salvaged leathers, and reconstructed tailoring — every piece released once."
      items={products.filter((p) => p.gender === "women" || p.gender === "unisex")}
      initialCategory={category}
    />
  );
}
