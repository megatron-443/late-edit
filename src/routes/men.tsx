import { createFileRoute } from "@tanstack/react-router";
import { products } from "@/lib/mockData";
import { CategoryPage } from "@/components/category-page";

export const Route = createFileRoute("/men")({
  head: () => ({
    meta: [
      { title: "Men — LATE EDIT" },
      { name: "description", content: "Menswear from LATE EDIT — reconstructed tailoring, reworked outerwear, and one-of-one silhouettes." },
      { property: "og:title", content: "Men — LATE EDIT" },
      { property: "og:description", content: "Menswear from LATE EDIT — reconstructed tailoring, reworked outerwear, and one-of-one silhouettes." },
    ],
  }),
  component: () => (
    <CategoryPage
      eyebrow="Men"
      title="Fall–Winter 2026"
      intro="Tailoring cut from the ghost of vintage suiting, cargo and outerwear reworked from surplus lots."
      items={products.filter((p) => p.gender === "men" || p.gender === "unisex")}
    />
  ),
});
