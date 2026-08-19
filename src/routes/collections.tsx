import { createFileRoute, Link } from "@tanstack/react-router";
import { collections, getProduct } from "@/lib/mockData";

export const Route = createFileRoute("/collections")({
  head: () => ({
    meta: [
      { title: "Collections — LATE EDIT" },
      { name: "description", content: "Explore LATE EDIT's seasonal collections — from The Reclamation Edit to the Null Series." },
      { property: "og:title", content: "Collections — LATE EDIT" },
      { property: "og:description", content: "Seasonal edits of one-of-one avant-garde streetwear." },
    ],
  }),
  component: CollectionsPage,
});

function CollectionsPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="max-w-3xl mx-auto text-center px-6 py-16 md:py-24">
        <div className="text-[0.7rem] tracking-[0.24em] uppercase text-muted-foreground">Archive</div>
        <h1 className="mt-4 font-display text-4xl md:text-6xl text-foreground">Collections.</h1>
        <p className="mt-6 max-w-xl mx-auto text-sm text-muted-foreground">
          Each edit is a chapter — a fabric investigation released in a single run.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-8 space-y-32">
        {collections.map((c, idx) => {
          const pieces = c.productIds.map(getProduct).filter(Boolean);
          return (
            <article key={c.id} className="grid md:grid-cols-[1fr_2fr] gap-12 items-start">
              <div className={idx % 2 === 0 ? "" : "md:order-2"}>
                <div className="text-[0.7rem] tracking-[0.24em] uppercase text-muted-foreground">{c.season}</div>
                <h2 className="mt-3 font-display text-3xl md:text-4xl text-foreground">{c.title}</h2>
                <p className="mt-5 text-sm text-muted-foreground">{c.description}</p>
                <div className="mt-6 text-[0.7rem] tracking-[0.24em] uppercase text-muted-foreground">{pieces.length} pieces</div>
              </div>
              <div className={`grid grid-cols-2 gap-4 ${idx % 2 === 0 ? "" : "md:order-1"}`}>
                {pieces.map((p) => p && (
                  <Link key={p.id} to="/product/$id" params={{ id: p.id }} className="block bg-[oklch(0.96_0.003_85)] dark:bg-surface-elevated aspect-[3/4] overflow-hidden group">
                    <SmartImage src={p.images[0]} alt={p.title} ratio="3/4" className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.03]" />
                  </Link>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
