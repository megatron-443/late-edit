import { PAYMENT_METHODS } from "@/lib/logistics";

type Props = {
  className?: string;
  label?: string;
  align?: "left" | "center";
};

export function PaymentStrip({ className = "", label = "Accepted Payments", align = "left" }: Props) {
  return (
    <div className={className}>
      {label && (
        <div
          className={`text-[0.62rem] tracking-[0.28em] uppercase text-muted-foreground mb-3 ${
            align === "center" ? "text-center" : ""
          }`}
        >
          {label}
        </div>
      )}
      <ul
        className={`flex flex-wrap gap-1.5 ${align === "center" ? "justify-center" : ""}`}
        aria-label="Accepted payment methods"
      >
        {PAYMENT_METHODS.map((m) => (
          <li
            key={m.id}
            className="price-num text-[0.62rem] tracking-[0.18em] uppercase text-foreground/80 border border-border/80 px-2.5 py-1.5 leading-none"
          >
            {m.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
