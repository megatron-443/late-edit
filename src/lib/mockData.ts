export type ProductStatus = "available" | "sold_out" | "reserved";
export type ProductGender = "women" | "men" | "unisex";
export type ProductCategory =
  | "Outerwear"
  | "Trousers"
  | "Knitwear"
  | "Womenswear"
  | "Bags";

/**
 * Layer classification — drives the "Layer" catalogue filter
 * (Outer / Mid / Base / Lower / Accessory).
 */
export type ProductLayer = "Outer" | "Mid" | "Base" | "Lower" | "Accessory";
export const LAYERS: ProductLayer[] = ["Outer", "Mid", "Base", "Lower", "Accessory"];

/**
 * Tag taxonomy. Every product carries at most one tag per category, so the
 * four slots never repeat each other. A future admin listing form is simply
 * four dropdowns fed from TAG_OPTIONS.
 */
export type ProductTagCategory = "rarity" | "material" | "craft" | "status";
export type ProductTag = { category: ProductTagCategory; label: string };

export const TAG_CATEGORY_ORDER: ProductTagCategory[] = ["rarity", "material", "craft", "status"];

export const TAG_CATEGORY_LABELS: Record<ProductTagCategory, string> = {
  rarity: "Rarity",
  material: "Material",
  craft: "Craft",
  status: "Availability",
};

export const TAG_OPTIONS: Record<ProductTagCategory, string[]> = {
  rarity: ["1-of-1", "Limited Run", "Archive Piece", "Made to Order"],
  material: ["Upcycled", "Deadstock", "Reclaimed Leather", "Reclaimed Wool", "Vintage Silk", "Deadstock Denim"],
  craft: ["Hand-Finished", "Atelier Cut", "Hand-Dyed", "Reconstructed"],
  status: ["Ships in 48h", "Last Piece", "Reserved", "Final Sale"],
};

export interface Product {
  id: string;
  serial: string;
  title: string;
  category: ProductCategory;
  layer: ProductLayer;
  gender: ProductGender;
  fabricType: string;
  fabricProvenance: string;
  price: number; // base EUR
  currency: string;
  images: string[];
  /** One-of-one: a single unique unit ships in exactly one fixed size. */
  size: string;
  /** Max 4 — one per tag category. Rendered via <ProductTags />. */
  tags: ProductTag[];
  status: ProductStatus;
  description: string;
}

/** Normalises any tag list: one per category, taxonomy order, max 4. */
export function normaliseTags(tags: ProductTag[]): ProductTag[] {
  const seen = new Set<ProductTagCategory>();
  return TAG_CATEGORY_ORDER.flatMap((cat) => {
    const hit = tags.find((t) => t.category === cat && t.label.trim().length > 0);
    if (!hit || seen.has(cat)) return [];
    seen.add(cat);
    return [hit];
  }).slice(0, 4);
}


// Unsplash stock photography helper (editorial, license-free).
const stock = (id: string, w = 900, h = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

export const heroImage = stock("1509631179647-0177331693ae", 1800, 1200);

// Full-bleed editorial band above the MEN grid — dark atelier menswear.
export const menBannerImage = stock("1520975954732-35dd22299614", 1800, 900);

// Closing editorial plate.
export const editorialPlateImage = stock("1509631179647-0177331693ae", 1800, 900);

export const products: Product[] = [
  {
    id: "le-001",
    serial: "LE//001",
    title: "Fractured Bomber",
    category: "Outerwear",
    layer: "Outer",
    gender: "unisex",
    fabricType: "Reclaimed Leather",
    fabricProvenance: "Salvaged from a 1978 aviator jacket lot, Milan.",
    price: 2450,
    currency: "EUR",
    images: [stock("1551028719-00167b16eac5"), stock("1490481651871-ab68de25d43d"), stock("1520975916090-3105956dac38")],
    size: "M",
    tags: [{ category: "rarity", label: "1-of-1" }, { category: "material", label: "Reclaimed Leather" }, { category: "craft", label: "Hand-Finished" }, { category: "status", label: "Ships in 48h" }],
    status: "available",
    description:
      "A deconstructed aviator silhouette rebuilt from reclaimed calfskin panels. Hand-finished with oxidised chrome hardware and exposed lockstitch.",
  },
  {
    id: "le-002",
    serial: "LE//002",
    title: "Patchwork Denim Suite",
    category: "Trousers",
    layer: "Lower",
    gender: "unisex",
    fabricType: "Vintage Denim Composite",
    fabricProvenance: "Assembled from twelve pairs of dead-stock selvedge denim.",
    price: 1180,
    currency: "EUR",
    images: [stock("1541099649105-f69ad21f3246"), stock("1542272604-787c3835535d"), stock("1475178626620-a4d074967452")],
    size: "32",
    tags: [{ category: "rarity", label: "1-of-1" }, { category: "material", label: "Deadstock Denim" }, { category: "craft", label: "Reconstructed" }, { category: "status", label: "Last Piece" }],
    status: "available",
    description:
      "A cartographic study in indigo. Twelve provenances stitched into a single silhouette, each panel logged and numbered on the interior tag.",
  },
  {
    id: "le-003",
    serial: "LE//003",
    title: "Null Hoodie",
    category: "Knitwear",
    layer: "Mid",
    gender: "unisex",
    fabricType: "Reworked French Terry",
    fabricProvenance: "Sourced from unsold 1990s European workwear stock.",
    price: 890,
    currency: "EUR",
    images: [stock("1556821840-3a63f95609a7"), stock("1620799140408-edc6dcb6d633"), stock("1620799139652-715e4d5b0e46")],
    size: "One Size",
    tags: [{ category: "rarity", label: "Archive Piece" }, { category: "material", label: "Upcycled" }, { category: "craft", label: "Atelier Cut" }, { category: "status", label: "Reserved" }],
    status: "reserved",
    description:
      "An oversized meditation on the hood. Raw-edge seams, industrial YKK chrome zips, and a weight that settles like architecture.",
  },
  {
    id: "le-004",
    serial: "LE//004",
    title: "Atelier Blazer, No.4",
    category: "Outerwear",
    layer: "Outer",
    gender: "men",
    fabricType: "Reconstructed Wool",
    fabricProvenance: "Cut from three vintage Savile Row suit jackets.",
    price: 3200,
    currency: "EUR",
    images: [stock("1594938298603-c8148c4dae35"), stock("1507003211169-0a1dd7228f2d"), stock("1617137968427-85924c800a22")],
    size: "48",
    tags: [{ category: "rarity", label: "1-of-1" }, { category: "material", label: "Reclaimed Wool" }, { category: "craft", label: "Hand-Finished" }, { category: "status", label: "Ships in 48h" }],
    status: "available",
    description:
      "Tailored from the ghost of three Savile Row suits. Interior lining is left exposed, an archive of previous lives worn on the shoulder.",
  },
  {
    id: "le-005",
    serial: "LE//005",
    title: "Cargo Study, Khaki",
    category: "Trousers",
    layer: "Lower",
    gender: "men",
    fabricType: "Reworked Military Twill",
    fabricProvenance: "Ex-military duffle lot, Belgian surplus, 1982.",
    price: 1450,
    currency: "EUR",
    images: [stock("1622445275463-afa2ab738c34"), stock("1548883354-94bcfe321cbb"), stock("1584865288642-42078afe6942")],
    size: "32",
    tags: [{ category: "rarity", label: "Limited Run" }, { category: "material", label: "Deadstock" }, { category: "craft", label: "Reconstructed" }, { category: "status", label: "Final Sale" }],
    status: "sold_out",
    description:
      "A layered cargo silhouette assembled from decommissioned military twill. Chrome D-rings and hand-punched grommets throughout.",
  },
  {
    id: "le-006",
    serial: "LE//006",
    title: "Silk Fringe Draping",
    category: "Womenswear",
    layer: "Base",
    gender: "women",
    fabricType: "Vintage Silk & Wool",
    fabricProvenance: "Assembled from heirloom scarves, private collection Kyoto.",
    price: 2780,
    currency: "EUR",
    images: [stock("1595777457583-95e059d581b8"), stock("1571908599407-cdb918ed83bf"), stock("1583744946564-b52ac1c389c8")],
    size: "S",
    tags: [{ category: "rarity", label: "1-of-1" }, { category: "material", label: "Vintage Silk" }, { category: "craft", label: "Hand-Dyed" }, { category: "status", label: "Ships in 48h" }],
    status: "available",
    description:
      "A liquid fall of hand-dyed silk over a reclaimed wool base. Every fringe hand-knotted; every seam a signature.",
  },
  {
    id: "le-007",
    serial: "LE//007",
    title: "Reworked Doctor Bag",
    category: "Bags",
    layer: "Accessory",
    gender: "women",
    fabricType: "Salvaged Bridle Leather",
    fabricProvenance: "Two vintage physician cases, London, c.1960.",
    price: 1980,
    currency: "EUR",
    images: [stock("1584917865442-de89df76afd3"), stock("1548036328-c9fa89d128fa"), stock("1590874103328-eac38a683ce7")],
    size: "One Size",
    tags: [{ category: "rarity", label: "Archive Piece" }, { category: "material", label: "Reclaimed Leather" }, { category: "craft", label: "Hand-Finished" }, { category: "status", label: "Last Piece" }],
    status: "available",
    description:
      "A structured carryall reborn from two century-old physician cases. Brass hardware retained, interior re-lined in raw silk.",
  },
];

export const navigation = [
  { label: "Women", to: "/women" as const },
  { label: "Men", to: "/men" as const },
  { label: "Atelier Bags", to: "/bags" as const },
  { label: "The Maison", to: "/maison" as const },
];

export const heroContent = {
  eyebrow: "AW26 — The Reclamation Edit",
  title: "Forgotten fabrics, rewritten.",
  body:
    "One-of-one avant-garde pieces reconstructed from archive material. Each garment carries a serial, a provenance, and a single owner.",
  ctaLabel: "Discover the Selection",
  ctaTo: "/shop" as const,
};


export const missionBanner = {
  eyebrow: "The LATE EDIT Ethos",
  title:
    "Giving forgotten fabrics and materials a second life as one-of-a-kind avant-garde pieces.",
  body:
    "We source from dead stock, ateliers, and archive lots — then tear it down and rebuild it into single-run garments. No restocks. No duplicates. Every piece signed, serialised, and released once.",
};

export const collections = [
  {
    id: "reclamation",
    title: "The Reclamation Edit",
    season: "AW26",
    description: "Salvage tailoring and reconstructed outerwear.",
    productIds: ["le-001", "le-004", "le-005"],
  },
  {
    id: "null-series",
    title: "Null Series",
    season: "SS26",
    description: "A study in monochrome and negative space.",
    productIds: ["le-003", "le-006"],
  },
  {
    id: "cartograph",
    title: "Cartograph",
    season: "AW25",
    description: "Denim mapped across twelve provenances.",
    productIds: ["le-002"],
  },
];

// Editorial menu — expandable categories with optional sub-items.
export type MenuLeaf = { label: string; to: string };
export type MenuNode = { label: string; to?: string; children?: MenuLeaf[] };
export type MenuSection = { eyebrow: string; items: MenuNode[] };

export const menuSections: MenuSection[] = [
  {
    eyebrow: "Discover",
    items: [
      { label: "New Arrivals", to: "/shop" },
      { label: "1-of-1 Archive", to: "/collections" },
      {
        label: "Women",
        to: "/women",
        children: [
          { label: "Jackets & Outerwear", to: "/women" },
          { label: "Tops & Shirts", to: "/women" },
          { label: "Dresses & Sets", to: "/women" },
          { label: "Trousers & Denim", to: "/women" },
          { label: "Accessories", to: "/women" },
        ],
      },
      {
        label: "Men",
        to: "/men",
        children: [
          { label: "Jackets & Outerwear", to: "/men" },
          { label: "Hoodies & Sweatshirts", to: "/men" },
          { label: "T-Shirts & Tops", to: "/men" },
          { label: "Trousers & Denim", to: "/men" },
          { label: "Accessories", to: "/men" },
        ],
      },
      { label: "Atelier Bags", to: "/bags" },
    ],
  },
  {
    eyebrow: "The Maison",
    items: [
      { label: "The Manifesto", to: "/maison" },
      { label: "Client Services", to: "/services" },
    ],
  },
];

export const concierge = {
  eyebrow: "Client Care",
  message: "Speak with a private advisor.",
  channels: [
    { label: "WhatsApp", href: "https://wa.me/919810012345", icon: "whatsapp" as const },
    { label: "Instagram", href: "https://instagram.com/lateedit.official", icon: "instagram" as const },
    { label: "Email", href: "mailto:concierge@lateedit.studio", icon: "email" as const },
  ],
};



export const searchSuggestions = [
  "Serial #001 — Fractured Bomber",
  "Serial #002 — Patchwork Denim Suite",
  "Serial #004 — Atelier Blazer, No.4",
  "Reclaimed Leather",
  "Reworked French Terry",
];

export const trendingTags = [
  "Serial #001",
  "Raw Denim",
  "Leather Jacket",
  "AW26",
  "Reconstructed Outerwear",
  "Silk Fringe",
];

export const accountTabs = [
  {
    id: "signin",
    label: "Sign In / Register",
    heading: "Enter the atelier.",
    body: "Access reserved releases, private previews, and your serialised order history.",
    cta: "Sign In",
  },
  {
    id: "track",
    label: "Track Order by Serial #",
    heading: "Follow a serial.",
    body: "Each LATE EDIT piece ships with a chain-of-custody record. Enter its serial to trace it.",
    cta: "Track Serial",
  },
  {
    id: "pass",
    label: "Atelier Access Pass",
    heading: "The private pass.",
    body: "Invitation-only entry to drop previews, atelier appointments, and archive requests.",
    cta: "Request Invitation",
  },
] as const;

export const languages = ["EN", "FR", "JP", "TH"] as const;

export const filters = {
  category: ["All", "Outerwear", "Trousers", "Knitwear", "Womenswear", "Bags"],
  availability: ["All", "Available", "Reserved", "Sold Out"],
};

export const footerGroups = [
  {
    id: "care",
    title: "Client Care",
    links: [
      { label: "Contact the Atelier", to: "/services" as const },
      { label: "Shipping & Returns", to: "/services" as const },
      { label: "Serial Authentication", to: "/services" as const },
      { label: "Care & Repair", to: "/services" as const },
    ],
  },
  {
    id: "story",
    title: "The Maison",
    links: [
      { label: "The Manifesto", to: "/maison" as const },
      { label: "Collections", to: "/collections" as const },
      { label: "Ateliers", to: "/stores" as const },
    ],
  },
  {
    id: "legal",
    title: "Legal",
    links: [
      { label: "Company Information", to: "/about" as const },
      { label: "Terms of Sale", to: "/legal/$slug" as const, params: { slug: "terms" } },
      { label: "Privacy Policy", to: "/legal/$slug" as const, params: { slug: "privacy" } },
      { label: "Returns & Refunds", to: "/legal/$slug" as const, params: { slug: "returns" } },
      { label: "Grievance Officer", to: "/legal/$slug" as const, params: { slug: "grievance" } },
    ],
  },
];

export const vipBanner = {
  eyebrow: "VIP Drop Access",
  title: "Never miss a single release.",
  placeholder: "your@address.com",
  cta: "Request Access",
  note: "Invitation-only previews. One email per drop. Unsubscribe anytime.",
};

export const trustSignals = [
  {
    id: "shipping",
    icon: "Truck",
    title: "Pan-India Express Shipping",
    note: "Insured, signed, tracked from atelier to door.",
  },
  {
    id: "authenticity",
    icon: "ShieldCheck",
    title: "1-of-1 Authenticity Guaranteed",
    note: "Each piece serialised and provenance-stamped.",
  },
  {
    id: "support",
    icon: "Headphones",
    title: "Dedicated Client Advisor",
    note: "Private support, 7 days a week.",
  },
  {
    id: "care",
    icon: "Sparkles",
    title: "Lifetime Care & Repair",
    note: "Complimentary conditioning for every serial.",
  },
] as const;


import { CURRENCY_META, type Currency } from "./settings-context";

export function formatPrice(p: Product, currency: Currency = "INR") {
  const meta = CURRENCY_META[currency];
  const converted = p.price * meta.rate;
  return new Intl.NumberFormat(meta.locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(converted);
}

export function getProduct(id: string) {
  return products.find((p) => p.id === id);
}
