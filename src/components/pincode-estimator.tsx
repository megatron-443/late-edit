import { useState } from "react";
import { Truck } from "lucide-react";
import { estimateDelivery } from "@/lib/logistics";

export function PincodeEstimator() {
  const [pincode, setPincode] = useState("");
  const [result, setResult] = useState<ReturnType<typeof estimateDelivery> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const check = (e: React.FormEvent) => {
    e.preventDefault();
    const r = estimateDelivery(pincode);
    if (!r) {
      setError("Enter a valid 6-digit Indian pincode.");
      setResult(null);
      return;
    }
    setError(null);
    setResult(r);
  };

  return (
    <div className="border border-border p-5">
      <div className="flex items-center gap-2 text-[0.68rem] tracking-[0.24em] uppercase text-foreground">
        <Truck size={14} strokeWidth={1.5} />
        <span>Delivery Estimate</span>
      </div>
      <form onSubmit={check} className="mt-3 flex items-stretch border border-border">
        <input
          inputMode="numeric"
          maxLength={6}
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
          placeholder="Enter pincode (e.g. 400005)"
          aria-label="Delivery pincode"
          className="price-num flex-1 min-w-0 bg-transparent px-3 h-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <button
          type="submit"
          className="label-eyebrow px-4 border-l border-border hover:bg-foreground hover:!text-background transition-colors"
        >
          Check
        </button>
      </form>
      {error && <p className="mt-3 text-xs text-muted-foreground">{error}</p>}
      {result && result.serviceable && (
        <div className="mt-4 text-xs text-foreground leading-relaxed">
          Delivers to <span className="price-num">{pincode}</span> in{" "}
          <span className="text-foreground">{result.days}</span> via{" "}
          <span className="text-foreground">{result.courier}</span>.
          <div className="mt-1 text-muted-foreground">
            {result.zone} zone · Ships from {result.origin} · Insured & signature-on-delivery.
          </div>
        </div>
      )}
      {result && !result.serviceable && (
        <p className="mt-3 text-xs text-muted-foreground">
          Not serviced by domestic express — our concierge will arrange a private courier. Contact
          the atelier for a bespoke quote.
        </p>
      )}
    </div>
  );
}
