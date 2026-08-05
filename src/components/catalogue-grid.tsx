import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { FilterModal, type FilterGroup } from "@/components/filter-modal";
import { filters, type Product } from "@/lib/mockData";
import { useSettings } from "@/lib/settings-context";
import {
  DEFAULT_FILTERS,
  LAYER_OPTIONS,
  PRICE_BANDS,
  SIZE_GROUPS,
  SORTS,
  activeFilterCount,
  applyFilters,
  priceBandLabel,
  type CatalogueFilters,
} from "@/lib/catalogue";

/**
 * Shared catalogue surface: sticky filter bar + responsive grid.
 * Used by /shop and by every category page so filtering behaves identically.
 */
export function CatalogueGrid({
  items,
  showCategoryFilter = true,
}: {
  items: Product[];
  showCategoryFilter?: boolean;
}) {
  const { currency } = useSettings();
  const [state, setState] = useState<CatalogueFilters>(DEFAULT_FILTERS);
  const [open, setOpen] = useState(false);

  const patch = (p: Partial<CatalogueFilters>) => setState((s) => ({ ...s, ...p }));
  const toggleIn = (list: string[], v: string) =>
    list.includes(v) ? list.filter((x) => x !== v) : [...list, v];

  const filtered = useMemo(() => applyFilters(items, state), [items, state]);

  const availableSizes = useMemo(
    () => new Set(items.flatMap((p) => p.sizes)),
    [items],
  );

  const groups: FilterGroup[] = useMemo(() => {
    const g: FilterGroup[] = [];

    if (showCategoryFilter) {
      g.push({
        kind: "single",
        key: "category",
        label: "Category",
        value: state.category,
        options: filters.category.map((c) => ({ value: c, label: c })),
        onChange: (v) => patch({ category: v }),
      });
    }

    g.push({
      kind: "multi",
      key: "layer",
      label: "Layer",
      values: state.layers,
      rows: [{ options: [...LAYER_OPTIONS] }],
      onToggle: (v) => patch({ layers: toggleIn(state.layers, v) }),
    });

    const sizeRows = SIZE_GROUPS.map((grp) => ({
      label: grp.label,
      options: grp.sizes.filter((s) => availableSizes.has(s)),
    })).filter((r) => r.options.length > 0);

    if (sizeRows.length > 0) {
      g.push({
        kind: "multi",
        key: "size",
        label: "Size",
        values: state.sizes,
        rows: sizeRows,
        onToggle: (v) => patch({ sizes: toggleIn(state.sizes, v) }),
      });
    }

    g.push({
      kind: "single",
      key: "price",
      label: "Price",
      value: state.priceBand,
      options: PRICE_BANDS.map((b) => ({ value: b.id, label: priceBandLabel(b, currency) })),
      onChange: (v) => patch({ priceBand: v }),
    });

    g.push({
      kind: "single",
      key: "sort",
      label: "Sort",
      value: state.sort,
      options: SORTS.map((s) => ({ value: s, label: s })),
      onChange: (v) => patch({ sort: v as CatalogueFilters["sort"] }),
    });

    g.push({
      kind: "toggle",
      key: "soldout",
      label: "Include sold out",
      value: state.includeSoldOut,
      hint: "Archive pieces stay visible for reference.",
      onChange: (v) => patch({ includeSoldOut: v }),
    });

    return g;
  }, [state, currency, availableSizes, showCategoryFilter]);

  const activeCount = activeFilterCount({
    ...state,
    category: showCategoryFilter ? state.category : "All",
  });

  const chips: { label: string; clear: () => void }[] = [
    ...(showCategoryFilter && state.category !== "All"
      ? [{ label: state.category, clear: () => patch({ category: "All" }) }]
      : []),
    ...state.layers.map((l) => ({ label: l, clear: () => patch({ layers: toggleIn(state.layers, l) }) })),
    ...state.sizes.map((s) => ({ label: `Size ${s}`, clear: () => patch({ sizes: toggleIn(state.sizes, s) }) })),
    ...(state.priceBand !== "all"
      ? [{
          label: priceBandLabel(PRICE_BANDS.find((b) => b.id === state.priceBand)!, currency),
          clear: () => patch({ priceBand: "all" }),
        }]
      : []),
    ...(state.sort !== "Newest" ? [{ label: state.sort, clear: () => patch({ sort: "Newest" as const }) }] : []),
    ...(!state.includeSoldOut ? [{ label: "In stock only", clear: () => patch({ includeSoldOut: true }) }] : []),
  ];

  return (
    <>
      {/* DESKTOP — sticky refine bar sits flush under the 4rem header */}
      <div className="hidden md:block border-y border-border sticky top-16 z-30 bg-background">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap text-[0.65rem] tracking-[0.2em] uppercase text-muted-foreground">
            {chips.length === 0 ? (
              <span>All pieces · {filtered.length}</span>
            ) : (
              chips.map((c) => <ActiveChip key={c.label} label={c.label} onClear={c.clear} />)
            )}
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="shrink-0 inline-flex items-center gap-2 border border-foreground/50 px-4 h-9 text-[0.7rem] tracking-[0.24em] uppercase text-foreground hover:bg-foreground hover:!text-background transition-colors press"
          >
            <SlidersHorizontal size={14} strokeWidth={1.5} />
            <span>Filter{activeCount > 0 ? ` · ${activeCount}` : ""}</span>
          </button>
        </div>
      </div>

      {/* MOBILE — static count line; filtering lives in the floating pill below */}
      <div className="md:hidden border-y border-border">
        <div className="px-4 py-3 flex items-center gap-2 overflow-x-auto scrollbar-luxury text-[0.65rem] tracking-[0.2em] uppercase text-muted-foreground">
          {chips.length === 0 ? (
            <span className="whitespace-nowrap">{filtered.length} pieces</span>
          ) : (
            chips.map((c) => <ActiveChip key={c.label} label={c.label} onClear={c.clear} />)
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="md:hidden fixed left-1/2 -translate-x-1/2 z-40 inline-flex items-center gap-2 rounded-full bg-foreground !text-background px-6 h-11 text-[0.7rem] tracking-[0.24em] uppercase shadow-2xl press"
        style={{ bottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}
      >
        <SlidersHorizontal size={14} strokeWidth={1.5} />
        <span>Filter{activeCount > 0 ? ` · ${activeCount}` : ""}</span>
      </button>


      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-10 md:mt-16 pb-24 md:pb-0">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-12">
          {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
        {filtered.length === 0 && (
          <div className="py-32 text-center text-[0.7rem] tracking-[0.24em] uppercase text-muted-foreground">
            Nothing matches this cut.
          </div>
        )}
      </div>

      <FilterModal
        open={open}
        onClose={() => setOpen(false)}
        groups={groups}
        onReset={() => setState(DEFAULT_FILTERS)}
        resultCount={filtered.length}
      />
    </>
  );
}

function ActiveChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <button
      type="button"
      onClick={onClear}
      className="inline-flex items-center gap-2 border border-border px-2.5 h-7 text-foreground hover:border-foreground transition-colors"
    >
      <span>{label}</span>
      <span aria-hidden>×</span>
    </button>
  );
}
