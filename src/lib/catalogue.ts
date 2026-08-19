import { LAYERS, type Product } from "./mockData";
import { CURRENCY_META, type Currency } from "./settings-context";

/** Sort options for the catalogue. */
export const SORTS = ["Newest", "Price · Low to High", "Price · High to Low", "Title A–Z"] as const;
export type Sort = (typeof SORTS)[number];

/** Price bands are declared in the base currency (EUR) and rendered per-currency. */
export type PriceBand = { id: string; min: number; max: number | null };
export const PRICE_BANDS: PriceBand[] = [
  { id: "all", min: 0, max: null },
  { id: "b1", min: 0, max: 1200 },
  { id: "b2", min: 1200, max: 2000 },
  { id: "b3", min: 2000, max: 3000 },
  { id: "b4", min: 3000, max: null },
];

function money(base: number, currency: Currency) {
  const meta = CURRENCY_META[currency];
  return new Intl.NumberFormat(meta.locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
    notation: "compact",
  }).format(base * meta.rate);
}

export function priceBandLabel(band: PriceBand, currency: Currency) {
  if (band.id === "all") return "All";
  if (band.max === null) return `${money(band.min, currency)} +`;
  if (band.min === 0) return `Under ${money(band.max, currency)}`;
  return `${money(band.min, currency)} – ${money(band.max, currency)}`;
}

/** Size chips, grouped so alpha / waist / jacket sizes never mix in one row. */
export const SIZE_GROUPS: { label: string; sizes: string[] }[] = [
  { label: "Alpha", sizes: ["XS", "S", "M", "L", "XL"] },
  { label: "Waist", sizes: ["28", "30", "32", "34"] },
  { label: "Jacket", sizes: ["44", "46", "48", "50"] },
  { label: "One", sizes: ["One Size"] },
];

export const ALL_SIZES = SIZE_GROUPS.flatMap((g) => g.sizes);

export type CatalogueFilters = {
  category: string;
  sizes: string[];
  layers: string[];
  priceBand: string;
  includeSoldOut: boolean;
  sort: Sort;
};

export const DEFAULT_FILTERS: CatalogueFilters = {
  category: "All",
  sizes: [],
  layers: [],
  priceBand: "all",
  includeSoldOut: true,
  sort: "Newest",
};

export const LAYER_OPTIONS = LAYERS as readonly string[];

export function activeFilterCount(f: CatalogueFilters) {
  return (
    (f.category !== "All" ? 1 : 0) +
    f.sizes.length +
    f.layers.length +
    (f.priceBand !== "all" ? 1 : 0) +
    (f.includeSoldOut ? 0 : 1) +
    (f.sort !== "Newest" ? 1 : 0)
  );
}

export function applyFilters(items: Product[], f: CatalogueFilters): Product[] {
  const band = PRICE_BANDS.find((b) => b.id === f.priceBand) ?? PRICE_BANDS[0];

  const out = items.filter((p) => {
    if (f.category !== "All" && p.category !== f.category) return false;
    if (f.layers.length > 0 && !f.layers.includes(p.layer)) return false;
    if (f.sizes.length > 0 && !f.sizes.includes(p.size)) return false;
    if (p.price < band.min) return false;
    if (band.max !== null && p.price > band.max) return false;
    if (!f.includeSoldOut && p.status === "sold_out") return false;
    return true;
  });

  switch (f.sort) {
    case "Price · Low to High":
      return [...out].sort((a, b) => a.price - b.price);
    case "Price · High to Low":
      return [...out].sort((a, b) => b.price - a.price);
    case "Title A–Z":
      return [...out].sort((a, b) => a.title.localeCompare(b.title));
    default:
      return out;
  }
}

/** Formats a base-currency (EUR) amount into the active display currency. */
export function formatAmount(base: number, currency: Currency) {
  const meta = CURRENCY_META[currency];
  return new Intl.NumberFormat(meta.locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(base * meta.rate);
}
