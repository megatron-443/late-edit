import { createFileRoute } from "@tanstack/react-router";
import { products } from "@/lib/mockData";
import { CategoryPage } from "@/components/category-page";

export const Route = createFileRoute("/bags")({
  head: () => ({
    meta: [
      { title: "Bags — LATE EDIT" },
      { name: "description", content: "Structured carryalls reborn from vintage leather goods. Each one signed and serialised." },
      { property: "og:title", content: "Bags — LATE EDIT" },
      { property: "og:description", content: "Structured carryalls reborn from vintage leather goods. Each one signed and serialised." },
    ],
  }),
  component: () => (
    <CategoryPage
      eyebrow="Atelier Bags"
      title="New Bags"
      intro="Salvaged bridle leather, retained brass, re-lined interiors. One case, one owner."
      items={products.filter((p) => p.category === "Bags")}
    />
  ),
});
