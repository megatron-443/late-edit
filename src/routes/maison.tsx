import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/maison")({
  head: () => ({
    meta: [
      { title: "The Maison — LATE EDIT" },
      { name: "description", content: "The Paris atelier turning forgotten fabric into one-of-one avant-garde luxury." },
      { property: "og:title", content: "The Maison — LATE EDIT" },
      { property: "og:description", content: "The Paris atelier turning forgotten fabric into one-of-one avant-garde luxury." },
    ],
  }),
  component: MaisonPage,
});

function MaisonPage() {
  return (
    <div className="pt-24 pb-24">
      <div className="max-w-3xl mx-auto text-center px-6 py-16 md:py-24">
        <div className="text-[0.7rem] tracking-[0.24em] uppercase text-muted-foreground">The Maison</div>
        <h1 className="mt-4 font-display text-4xl md:text-6xl leading-tight text-foreground">
          Everything you own<br />has already lived.
        </h1>
      </div>

      <div className="max-w-6xl mx-auto px-6">
        <div className="aspect-[16/9] overflow-hidden bg-[oklch(0.96_0.003_85)] dark:bg-surface-elevated">
          <img
            src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1600&h=900&q=80"
            alt="Atelier"
            loading="lazy"
            className="h-full w-full object-cover object-center"
          />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-20 md:py-32 space-y-16">
        <Block eyebrow="Origin">
          LATE EDIT began in a Parisian basement in 2023, sorting through eight tonnes of
          dead-stock fabric a bankrupt Milanese atelier had left behind. What started as
          triage became a thesis: the most luxurious material in the world is the one that
          has already lived.
        </Block>
        <Block eyebrow="Method">
          Every piece is cut in-house from reclaimed, salvaged, or dead-stock material.
          No pattern is used twice. Every garment carries a serial and a provenance card —
          a paper trail of what it used to be before it became something else.
        </Block>
        <Block eyebrow="Rules">
          One of one. Zero virgin synthetics. Every fabric documented. We do not restock — we move on.
        </Block>
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-16 text-center">
        <Link
          to="/stores"
          className="inline-flex items-center gap-3 border border-foreground/60 px-8 py-3.5 text-[0.7rem] tracking-[0.28em] uppercase text-foreground hover:bg-foreground hover:!text-background transition-colors press"
        >
          <span>Visit the atelier</span>
          <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
}

function Block({ eyebrow, children }: { eyebrow: string; children: React.ReactNode }) {
  return (
    <section className="grid md:grid-cols-[180px_1fr] gap-8">
      <div className="text-[0.7rem] tracking-[0.24em] uppercase text-muted-foreground pt-1">{eyebrow}</div>
      <div className="text-base text-foreground/85 leading-relaxed">{children}</div>
    </section>
  );
}
