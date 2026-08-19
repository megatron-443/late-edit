import { X, Check } from "lucide-react";
import { Overlay } from "./overlay";

/** Single-choice chip row (category, price band, sort). */
export type SingleGroup = {
  kind: "single";
  key: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
};

/** Multi-choice chip row, optionally split into sub-rows (sizes). */
export type MultiGroup = {
  kind: "multi";
  key: string;
  label: string;
  values: string[];
  rows: { label?: string; options: string[] }[];
  onToggle: (v: string) => void;
};

/** Boolean switch row (e.g. include sold-out pieces). */
export type ToggleGroup = {
  kind: "toggle";
  key: string;
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
};

export type FilterGroup = SingleGroup | MultiGroup | ToggleGroup;

type Props = {
  open: boolean;
  onClose: () => void;
  groups: FilterGroup[];
  onReset?: () => void;
  resultCount?: number;
};

/**
 * Editorial filter modal — replaces native <select> chevrons.
 * Bottom-sheet on mobile, centered card on desktop; smooth-eased reveal.
 */
export function FilterModal({ open, onClose, groups, onReset, resultCount }: Props) {
  return (
    <Overlay
      open={open}
      onClose={onClose}
      label="Filter catalogue"
      surface="sheet"
      z={75}
      exitMs={460}
      panelClassName="flex flex-col"
      panelStyle={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      backdropClassName="bg-foreground/40 backdrop-blur-sm"
    >
        <header className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-border">
          <div>
            <div className="label-eyebrow">Refine</div>
            <h2 className="mt-1 font-display text-2xl">Filter the edit.</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-2 hover:rotate-90 transition-transform duration-500 ease-out"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto divide-y divide-border scrollbar-luxury">
          {groups.map((g) => (
            <section key={g.key} className="px-6 py-5">
              {g.kind === "toggle" ? (
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="label-eyebrow">{g.label}</div>
                    {g.hint && <div className="mt-1 text-xs text-muted-foreground">{g.hint}</div>}
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={g.value}
                    onClick={() => g.onChange(!g.value)}
                    className={`relative h-6 w-11 border transition-colors duration-200 ${
                      g.value ? "bg-foreground border-foreground" : "bg-transparent border-border"
                    }`}
                  >
                    <span
                      className={`absolute top-[3px] h-4 w-4 transition-transform duration-200 ${
                        g.value ? "translate-x-[26px] bg-background" : "translate-x-[3px] bg-foreground"
                      }`}
                      style={{ transitionTimingFunction: "var(--ease-editorial)" }}
                    />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="label-eyebrow">{g.label}</div>
                    <div className="text-[0.65rem] tracking-[0.2em] uppercase text-muted-foreground">
                      {g.kind === "single"
                        ? (g.options.find((o) => o.value === g.value)?.label ?? "")
                        : g.values.length > 0
                          ? g.values.join(" · ")
                          : "Any"}
                    </div>
                  </div>

                  {g.kind === "single" ? (
                    <ChipRow
                      options={g.options}
                      isActive={(v) => v === g.value}
                      onSelect={g.onChange}
                    />
                  ) : (
                    <div className="space-y-3 mt-3">
                      {g.rows.map((row, i) => (
                        <div key={row.label ?? i}>
                          {row.label && (
                            <div className="text-[0.6rem] tracking-[0.2em] uppercase text-muted-foreground/70 mb-1.5">
                              {row.label}
                            </div>
                          )}
                          <ChipRow
                            className="mt-0"
                            options={row.options.map((o) => ({ value: o, label: o }))}
                            isActive={(v) => g.values.includes(v)}
                            onSelect={g.onToggle}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </section>
          ))}
        </div>

        <footer className="flex items-center justify-between gap-4 px-6 py-4 border-t border-border">
          {onReset ? (
            <button
              type="button"
              onClick={onReset}
              className="label-eyebrow border-b border-foreground/30 hover:border-foreground pb-0.5"
            >
              Reset all
            </button>
          ) : <span />}
          <button
            type="button"
            onClick={onClose}
            className="label-eyebrow !text-background bg-foreground px-6 py-3 hover:bg-chrome transition-colors press"
          >
            {typeof resultCount === "number" ? `View ${resultCount} pieces` : "View pieces"}
          </button>
        </footer>
    </Overlay>
  );
}

function ChipRow({
  options,
  isActive,
  onSelect,
  className = "mt-3",
}: {
  options: { value: string; label: string }[];
  isActive: (v: string) => boolean;
  onSelect: (v: string) => void;
  className?: string;
}) {
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`}>
      {options.map((opt) => {
        const active = isActive(opt.value);
        return (
          <li key={opt.value}>
            <button
              type="button"
              onClick={() => onSelect(opt.value)}
              aria-pressed={active}
              className={`inline-flex items-center gap-2 px-3.5 h-9 border text-xs transition-colors duration-200 press ${
                active
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-foreground hover:border-foreground"
              }`}
              style={{ transitionTimingFunction: "var(--ease-editorial)" }}
            >
              {active && <Check size={12} strokeWidth={2} />}
              <span>{opt.label}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
