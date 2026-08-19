import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Search, X } from "lucide-react";
import {
  CURRENCY_META,
  OTHER_CURRENCIES,
  PINNED_CURRENCIES,
  type Currency,
} from "@/lib/settings-context";
import { Overlay } from "./overlay";

type Props = {
  open: boolean;
  onClose: () => void;
  value: Currency;
  onChange: (c: Currency) => void;
};

export function CurrencyPicker({ open, onClose, value, onChange }: Props) {
  const [q, setQ] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    setQ("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    // Smooth scroll to selected on open.
    const id = window.setTimeout(() => {
      selectedRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 120);
    return () => window.clearTimeout(id);
  }, [open]);

  const needle = q.trim().toLowerCase();
  const match = (c: Currency) => {
    if (!needle) return true;
    const m = CURRENCY_META[c];
    return (
      c.toLowerCase().includes(needle) ||
      m.name.toLowerCase().includes(needle) ||
      m.symbol.toLowerCase().includes(needle)
    );
  };

  const pinned = useMemo(() => PINNED_CURRENCIES.filter(match), [needle]);
  const others = useMemo(() => OTHER_CURRENCIES.filter(match), [needle]);

  const commit = (c: Currency) => {
    onChange(c);
    onClose();
  };

  return (
    <Overlay
      open={open}
      onClose={onClose}
      label="Select currency"
      surface="sheet"
      z={90}
      exitMs={460}
      panelRef={dialogRef}
      panelStyle={{ maxHeight: "min(85dvh, 720px)" }}
      backdropClassName="bg-foreground/40 backdrop-blur-sm"
    >
        <div className="flex items-center justify-between px-5 md:px-6 pt-5 pb-3 border-b border-border">
          <div>
            <div className="label-eyebrow !text-muted-foreground">Region</div>
            <div className="font-display text-lg leading-tight mt-0.5">Currency</div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] -mr-2 opacity-80 hover:opacity-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 md:px-6 py-3 border-b border-border">
          <label className="flex items-center gap-2 border-b border-border pb-2">
            <Search size={14} className="opacity-60" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search currency"
              className="flex-1 min-w-0 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
              autoFocus
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ("")}
                aria-label="Clear"
                className="text-xs opacity-70 hover:opacity-100 label-eyebrow"
              >
                Clear
              </button>
            )}
          </label>
        </div>

        <div
          className="overflow-y-auto overscroll-contain"
          style={{
            maxHeight: "calc(min(85dvh, 720px) - 148px)",
            scrollBehavior: "smooth",
            paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
          }}
        >
          {pinned.length > 0 && (
            <section className="px-5 md:px-6 py-4">
              <div className="label-eyebrow !text-muted-foreground mb-3">Global majors</div>
              <ul className="grid grid-cols-2 gap-1.5">
                {pinned.map((c) => (
                  <li key={c}>
                    <CurrencyRow
                      code={c}
                      selected={value === c}
                      onSelect={commit}
                      innerRef={value === c ? selectedRef : undefined}
                      compact
                    />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {others.length > 0 && (
            <section className="px-5 md:px-6 py-4 border-t border-border">
              <div className="label-eyebrow !text-muted-foreground mb-3">All currencies</div>
              <ul className="divide-y divide-border/60">
                {others.map((c) => (
                  <li key={c}>
                    <CurrencyRow
                      code={c}
                      selected={value === c}
                      onSelect={commit}
                      innerRef={value === c ? selectedRef : undefined}
                    />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {pinned.length === 0 && others.length === 0 && (
            <div className="px-6 py-10 text-center text-sm text-muted-foreground">
              No currency matches “{q}”.
            </div>
          )}
        </div>
    </Overlay>
  );
}

function CurrencyRow({
  code,
  selected,
  onSelect,
  innerRef,
  compact,
}: {
  code: Currency;
  selected: boolean;
  onSelect: (c: Currency) => void;
  innerRef?: React.Ref<HTMLButtonElement>;
  compact?: boolean;
}) {
  const meta = CURRENCY_META[code];
  return (
    <button
      ref={innerRef}
      type="button"
      onClick={() => onSelect(code)}
      aria-pressed={selected}
      className={`press w-full flex items-center gap-3 text-left transition-all duration-300 ease-editorial ${
        compact
          ? `px-3 py-2.5 border ${selected ? "border-foreground bg-secondary/40" : "border-border hover:border-foreground/60 hover:bg-secondary/20"}`
          : `px-1 py-3 ${selected ? "text-foreground" : "text-foreground/85 hover:text-foreground hover:translate-x-0.5"}`
      }`}
    >
      <span
        aria-hidden
        className={`shrink-0 grid place-items-center h-8 w-10 border border-border text-[11px] tracking-wide font-medium ${
          selected ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        {meta.symbol}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm truncate">{meta.name}</span>
        <span className="block text-[11px] tracking-[0.18em] uppercase text-muted-foreground">
          {code}
        </span>
      </span>
      {selected && <Check size={14} className="shrink-0 opacity-80" />}
    </button>
  );
}
