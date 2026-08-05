import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/stores")({
  head: () => ({
    meta: [
      { title: "Find a Store — LATE EDIT" },
      { name: "description", content: "LATE EDIT ateliers and stockists worldwide — Paris, Tokyo, New York, Mumbai." },
      { property: "og:title", content: "Find a Store — LATE EDIT" },
      { property: "og:description", content: "LATE EDIT ateliers and stockists worldwide — Paris, Tokyo, New York, Mumbai." },
    ],
  }),
  component: StoresPage,
});

const stores = [
  { city: "Mumbai", role: "Atelier & Flagship", address: "Colaba Causeway, Mumbai 400005, India" },
  { city: "Paris", role: "Studio", address: "3ᵉ Arrondissement, 75003 Paris, France" },
  { city: "Tokyo", role: "By appointment", address: "Jingumae, Shibuya, Tokyo 150-0001" },
  { city: "New York", role: "By appointment", address: "SoHo, New York, NY 10013" },
];

function StoresPage() {
  return (
    <div className="pt-24 pb-24">
      <div className="max-w-3xl mx-auto text-center px-6 py-16 md:py-24">
        <div className="text-[0.7rem] tracking-[0.24em] uppercase text-muted-foreground">Find a Store</div>
        <h1 className="mt-4 font-display text-4xl md:text-6xl text-foreground">Ateliers.</h1>
      </div>
      <div className="max-w-4xl mx-auto px-6 grid sm:grid-cols-2 gap-8">
        {stores.map((s) => (
          <div key={s.city} className="border border-border p-8">
            <div className="text-[0.7rem] tracking-[0.24em] uppercase text-muted-foreground">{s.role}</div>
            <div className="mt-3 font-display text-2xl text-foreground">{s.city}</div>
            <div className="mt-3 text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {s.address}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
