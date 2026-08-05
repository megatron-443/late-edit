import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

export type SelectOption = { value: string; label: string };

/**
 * EditorialSelect — the app-wide replacement for the native <select>.
 *
 * Renders a bordered trigger plus a themed panel (design tokens only, no
 * browser chrome), so category / state / country pickers match the house
 * typography in both Atelier Off-White and Chrome Noir.
 */
export function EditorialSelect({
  label,
  value,
  options,
  onChange,
  placeholder = "Select",
  className = "",
  id,
}: {
  label?: string;
  value: string;
  options: SelectOption[];
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = options.find((o) => o.value === value);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {label && <div className="label-eyebrow mb-2">{label}</div>}
      <button
        id={id}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 border border-border bg-transparent px-3 h-11 text-sm text-foreground hover:border-foreground transition-colors"
      >
        <span className={current ? "" : "text-muted-foreground"}>
          {current?.label ?? placeholder}
        </span>
        <ChevronDown
          size={14}
          strokeWidth={1.5}
          className={`shrink-0 transition-transform duration-250 ${open ? "rotate-180" : ""}`}
          style={{ transitionTimingFunction: "var(--ease-editorial)" }}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 w-full max-h-64 overflow-y-auto border border-border bg-background shadow-2xl"
          style={{ animation: "le-fade-scale 200ms var(--ease-editorial) both" }}
        >
          {options.map((o) => {
            const active = o.value === value;
            return (
              <li key={o.value} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => { onChange(o.value); setOpen(false); }}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left text-sm transition-colors duration-200 ${
                    active ? "bg-surface text-foreground" : "text-foreground/85 hover:bg-surface/70"
                  }`}
                >
                  <span>{o.label}</span>
                  {active && <Check size={13} strokeWidth={2} />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
