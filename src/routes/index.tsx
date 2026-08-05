import { createFileRoute } from "@tanstack/react-router";
import { heroContent, missionBanner, products, heroImage, menBannerImage, editorialPlateImage } from "@/lib/mockData";
import { ProductCard } from "@/components/product-card";
import { PillCTA } from "@/components/pill-cta";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LATE EDIT — 1-of-1 Upcycled Luxury" },
      { name: "description", content: "One-of-one avant-garde garments reconstructed from archive fabric. Explore the current LATE EDIT drop." },
      { property: "og:title", content: "LATE EDIT — 1-of-1 Upcycled Luxury" },
      { property: "og:description", content: "One-of-one avant-garde garments reconstructed from archive fabric. Explore the current LATE EDIT drop." },
    ],
    links: [
      { rel: "preload", as: "image", href: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1800&h=1200&q=80" },
    ],
  }),
  component: HomePage,
});


function HomePage() {
  const women = products.filter((p) => p.gender === "women" || p.gender === "unisex").slice(0, 4);
  const men = products.filter((p) => p.gender === "men" || p.gender === "unisex").slice(0, 4);

  return (
    <div className="pt-16">
      {/* HERO — full-bleed image with editorial statement overlaid */}
      <section className="relative w-full">
        <div className="w-full aspect-[4/5] sm:aspect-[16/10] md:aspect-[16/8] overflow-hidden bg-[oklch(0.96_0.003_85)] dark:bg-surface-elevated">
          <img
            src={heroImage}
            alt="LATE EDIT — AW26 editorial"
            className="h-full w-full object-cover object-[center_35%]"
            width={1800}
            height={1200}
          />
        </div>

        {/* legibility scrim */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-black/60"
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <div className="text-[0.7rem] tracking-[0.24em] uppercase text-white/80">
            {heroContent.eyebrow}
          </div>
          <h1 className="mt-5 max-w-3xl font-display text-3xl md:text-5xl lg:text-6xl leading-tight text-white [text-wrap:balance] drop-shadow-[0_1px_20px_rgba(0,0,0,0.35)]">
            {heroContent.title}
          </h1>
          <PillCTA to={heroContent.ctaTo} className="mt-10" overlay>
            {heroContent.ctaLabel}
          </PillCTA>
        </div>
      </section>

      {/* WOMEN */}
      <SectionGrid eyebrow="Women" title="New Arrivals" items={women} ctaTo="/women" />

      {/* EDITORIAL BAND — dark atelier menswear */}
      <section className="w-full mt-8">
        <div className="w-full aspect-[21/9] overflow-hidden bg-[oklch(0.96_0.003_85)] dark:bg-surface-elevated">
          <img
            src={menBannerImage}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover object-center"
          />
        </div>
      </section>

      {/* MEN */}
      <SectionGrid eyebrow="Men" title="Fall–Winter 2026" items={men} ctaTo="/men" />


      {/* EDITORIAL PLATE — full-bleed, image-only pacing */}
      <section className="w-full">
        <figure className="relative w-full aspect-[21/9] overflow-hidden bg-[oklch(0.94_0.004_85)] dark:bg-surface-elevated">
          <img
            src={editorialPlateImage}
            alt=""
            aria-hidden
            loading="lazy"
            className="h-full w-full object-cover object-center"
          />
          <figcaption className="absolute inset-x-0 bottom-6 md:bottom-10 flex justify-center pointer-events-none">
            <span className="text-[0.6rem] tracking-[0.32em] uppercase text-background/90 mix-blend-difference">
              AW26 · Plate No. 04 · Reclamation
            </span>
          </figcaption>
        </figure>
      </section>

      {/* MISSION BANNER — quiet, no chrome-text */}
      <section className="border-t border-border">
        <div className="max-w-4xl mx-auto px-6 pt-16 pb-12 md:pt-20 md:pb-16 text-center">
          <div className="text-[0.7rem] tracking-[0.24em] uppercase text-muted-foreground">
            {missionBanner.eyebrow}
          </div>
          <p className="mt-8 font-display text-2xl md:text-4xl leading-snug text-foreground [text-wrap:balance] hyphens-none">
            {missionBanner.title}
          </p>
          <p className="mt-8 max-w-2xl mx-auto text-sm text-muted-foreground leading-relaxed [text-wrap:pretty] hyphens-none">
            {missionBanner.body}
          </p>
        </div>
      </section>

    </div>
  );
}

function SectionGrid({
  eyebrow, title, items, ctaTo,
}: { eyebrow: string; title: string; items: typeof products; ctaTo: string }) {
  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
      <div className="text-center mb-12 md:mb-16">
        <div className="text-[0.7rem] tracking-[0.24em] uppercase text-muted-foreground">{eyebrow}</div>
        <h2 className="mt-4 font-display text-3xl md:text-5xl leading-tight text-foreground">{title}</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-12">
        {items.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
      <PillCTA to={ctaTo} className="mt-16">Discover the Selection</PillCTA>
    </section>
  );
}
