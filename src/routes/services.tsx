import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — LATE EDIT" },
      { name: "description", content: "Care, repair, serial authentication, and private atelier appointments." },
      { property: "og:title", content: "Services — LATE EDIT" },
      { property: "og:description", content: "Care, repair, serial authentication, and private atelier appointments." },
    ],
  }),
  component: ServicesPage,
});

const items = [
  { title: "Care & Repair", body: "In-atelier repair for every LATE EDIT piece, indefinitely." },
  { title: "Serial Authentication", body: "Verify chain-of-custody by serial before any resale." },
  { title: "Private Appointments", body: "By-invitation viewings at the Mumbai and Paris ateliers." },
  { title: "Shipping & Returns", body: "White-glove delivery worldwide. 14-day return on unworn pieces." },
  { title: "Contact the Atelier", body: "concierge@lateedit.studio · WhatsApp +91 98100 12345 · Instagram @lateedit.official" },
];

function ServicesPage() {
  return (
    <div className="pt-24 pb-24">
      <div className="max-w-3xl mx-auto text-center px-6 py-16 md:py-24">
        <div className="text-[0.7rem] tracking-[0.24em] uppercase text-muted-foreground">Client Services</div>
        <h1 className="mt-4 font-display text-4xl md:text-6xl text-foreground">At the atelier's service.</h1>
      </div>
      <div className="max-w-3xl mx-auto px-6 divide-y divide-border border-y border-border">
        {items.map((it) => (
          <div key={it.title} className="grid md:grid-cols-[220px_1fr] gap-6 py-8">
            <div className="font-display text-lg text-foreground">{it.title}</div>
            <div className="text-sm text-muted-foreground leading-relaxed">{it.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
