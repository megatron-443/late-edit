import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useSettings, type Currency, type Language } from "@/lib/settings-context";
import { Overlay } from "./overlay";

type Region = {
  country: string;
  language: Language;
  currency: Currency;
};

/**
 * Country → Language → Currency coupling. Keeps the region selector honest:
 * a user picking "India" implicitly gets EN — India / INR.
 */
const REGIONS: Region[] = [
  { country: "India",          language: "EN", currency: "INR" },
  { country: "United States",  language: "EN", currency: "USD" },
  { country: "United Kingdom", language: "EN", currency: "GBP" },
  { country: "France",         language: "FR", currency: "EUR" },
  { country: "Japan",          language: "JP", currency: "JPY" },
  { country: "Thailand",       language: "TH", currency: "THB" },
  { country: "United Arab Emirates", language: "EN", currency: "AED" },
  { country: "Singapore",      language: "EN", currency: "SGD" },
  { country: "Australia",      language: "EN", currency: "AUD" },
  { country: "Canada",         language: "EN", currency: "CAD" },
  { country: "Germany",        language: "EN", currency: "EUR" },
  { country: "Switzerland",    language: "EN", currency: "CHF" },
  { country: "Hong Kong",      language: "EN", currency: "HKD" },
  { country: "International",  language: "EN", currency: "EUR" },
];

type Props = {
  open: boolean;
  onClose: () => void;
};

export function RegionSelector({ open, onClose }: Props) {
  const { currency, language, setCurrency, setLanguage } = useSettings();
  const [selected, setSelected] = useState<Region>(() =>
    REGIONS.find((r) => r.currency === currency && r.language === language) ?? REGIONS[0],
  );

  useEffect(() => {
    if (!open) return;
    const match = REGIONS.find((r) => r.currency === currency && r.language === language);
    if (match) setSelected(match);
  }, [open, currency, language]);

  const confirm = () => {
    setCurrency(selected.currency);
    setLanguage(selected.language);
    onClose();
  };

  return (
    <Overlay
      open={open}
      onClose={onClose}
      label="Region, language and currency"
      surface="center"
      z={70}
      exitMs={420}
      panelClassName="flex flex-col"
      backdropClassName="bg-foreground/40 backdrop-blur-sm"
    >
        <header className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-border">
          <div>
            <div className="label-eyebrow">Region</div>
            <h2 className="mt-1 font-display text-2xl">Shipping destination.</h2>
            <p className="mt-2 text-xs text-muted-foreground max-w-sm">
              Choose your country — language and currency update together.
            </p>
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

        <div className="flex-1 overflow-y-auto">
          <ul className="divide-y divide-border">
            {REGIONS.map((r) => {
              const active = r.country === selected.country;
              return (
                <li key={r.country}>
                  <button
                    type="button"
                    onClick={() => setSelected(r)}
                    aria-pressed={active}
                    className={`w-full grid grid-cols-[1fr_auto] items-center gap-4 px-6 py-4 text-left transition-colors ${
                      active ? "bg-surface" : "hover:bg-surface/60"
                    }`}
                  >
                    <div>
                      <div className="text-sm text-foreground">{r.country}</div>
                      <div className="mt-0.5 text-[0.65rem] tracking-[0.18em] uppercase text-muted-foreground">
                        {r.language}
                      </div>
                    </div>
                    <div className="price-num text-xs text-foreground/80">{r.currency}</div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <footer className="flex items-center justify-between gap-4 px-6 py-4 border-t border-border">
          <div className="text-[0.65rem] tracking-[0.18em] uppercase text-muted-foreground">
            {selected.country} · {selected.language} · <span className="price-num">{selected.currency}</span>
          </div>
          <button
            type="button"
            onClick={confirm}
            className="label-eyebrow !text-background bg-foreground px-6 py-3 hover:bg-chrome transition-colors press"
          >
            Confirm
          </button>
        </footer>
    </Overlay>
  );
}
