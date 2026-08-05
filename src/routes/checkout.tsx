import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, Lock, ShieldCheck, Truck } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useSettings } from "@/lib/settings-context";
import { formatAmount } from "@/lib/catalogue";
import { EditorialSelect } from "@/components/editorial-select";
import { Price } from "@/components/price";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — LATE EDIT" },
      { name: "description", content: "Review your Atelier Bag, confirm delivery details, and choose a payment method." },
      { property: "og:title", content: "Checkout — LATE EDIT" },
      { property: "og:description", content: "Review your Atelier Bag, confirm delivery details, and choose a payment method." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

const STEPS = ["Bag", "Delivery", "Payment"] as const;

const COUNTRIES = [
  { value: "IN", label: "India" },
  { value: "AE", label: "United Arab Emirates" },
  { value: "GB", label: "United Kingdom" },
  { value: "US", label: "United States" },
  { value: "FR", label: "France" },
  { value: "JP", label: "Japan" },
];

const STATES_IN = [
  "Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Telangana",
  "Gujarat", "West Bengal", "Rajasthan", "Kerala", "Punjab",
].map((s) => ({ value: s, label: s }));

const SHIPPING = [
  { value: "standard", label: "Insured Standard · 2–5 days", cost: 0 },
  { value: "express", label: "Atelier Express · 1–2 days", cost: 25 },
];

const PAYMENTS = [
  { value: "upi", label: "UPI" },
  { value: "card", label: "Card" },
  { value: "netbanking", label: "Net Banking" },
  { value: "cod", label: "Cash on Delivery" },
];

function CheckoutPage() {
  const { detailed, subtotal, count, remove, clear } = useCart();
  const { currency } = useSettings();

  const [step, setStep] = useState(0);
  const [placed, setPlaced] = useState(false);

  const [country, setCountry] = useState("IN");
  const [state, setState] = useState("Maharashtra");
  const [shipping, setShipping] = useState("standard");
  const [payment, setPayment] = useState("upi");
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", city: "", pincode: "" });

  const shipCost = SHIPPING.find((s) => s.value === shipping)?.cost ?? 0;
  const total = subtotal + shipCost;

  const deliveryValid = useMemo(
    () =>
      form.name.trim().length > 1 &&
      /.+@.+\..+/.test(form.email) &&
      form.phone.trim().length >= 7 &&
      form.address.trim().length > 4 &&
      form.city.trim().length > 1 &&
      form.pincode.trim().length >= 4,
    [form],
  );

  if (placed) {
    return (
      <div className="pt-32 pb-32 px-6">
        <div className="max-w-xl mx-auto text-center">
          <div className="mx-auto h-12 w-12 border border-foreground inline-flex items-center justify-center">
            <Check size={20} strokeWidth={1.5} />
          </div>
          <h1 className="mt-8 font-display text-4xl md:text-5xl">Order held for you.</h1>
          <p className="mt-5 text-sm text-muted-foreground leading-relaxed">
            This is a front-end preview — no payment was taken and no order was recorded.
            Once the atelier's order backend is connected, this step will capture payment
            and issue a serialised confirmation.
          </p>
          <Link
            to="/shop"
            className="mt-10 inline-block label-eyebrow !text-background bg-foreground px-8 py-4 hover:bg-chrome transition-colors press"
          >
            Back to the catalogue
          </Link>
        </div>
      </div>
    );
  }

  if (count === 0) {
    return (
      <div className="pt-32 pb-32 px-6 text-center">
        <div className="label-eyebrow">Checkout</div>
        <h1 className="mt-4 font-display text-4xl md:text-5xl">Your bag is quiet.</h1>
        <p className="mt-5 text-sm text-muted-foreground">Add a piece to begin checkout.</p>
        <Link
          to="/shop"
          className="mt-10 inline-block label-eyebrow !text-background bg-foreground px-8 py-4 hover:bg-chrome transition-colors press"
        >
          Browse the edit
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="label-eyebrow">Checkout</div>
        <h1 className="mt-3 font-display text-4xl md:text-5xl">Secure the piece.</h1>

        {/* Stepper */}
        <ol className="mt-10 flex items-center gap-4 border-b border-border pb-4">
          {STEPS.map((label, i) => (
            <li key={label} className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => i < step && setStep(i)}
                className={`label-eyebrow flex items-center gap-2 transition-colors duration-200 ${
                  i === step ? "!text-foreground" : i < step ? "text-muted-foreground hover:!text-foreground" : "text-muted-foreground/50"
                }`}
              >
                <span className="price-num">{String(i + 1).padStart(2, "0")}</span>
                {label}
              </button>
              {i < STEPS.length - 1 && <span className="w-8 h-px bg-border" />}
            </li>
          ))}
        </ol>

        <div className="mt-12 grid lg:grid-cols-[1.5fr_1fr] gap-12 lg:gap-16">
          <div style={{ animation: "le-fade-scale 260ms var(--ease-editorial) both" }} key={step}>
            {step === 0 && (
              <ul className="divide-y divide-border border-y border-border">
                {detailed.map(({ line, product }) => (
                  <li key={`${line.id}-${line.size}`} className="flex gap-5 py-5">
                    <img src={product.images[0]} alt={product.title} className="w-20 h-24 object-cover object-top shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="label-eyebrow !text-foreground/70">{product.serial} · Size {line.size}</div>
                      <div className="font-display text-lg">{product.title}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{product.fabricType}</div>
                      <button
                        type="button"
                        onClick={() => remove(line.id, line.size)}
                        className="mt-3 text-[0.65rem] tracking-[0.16em] uppercase text-muted-foreground hover:text-foreground"
                      >
                        Remove
                      </button>
                    </div>
                    <Price product={product} className="text-sm shrink-0" as="div" />
                  </li>
                ))}
              </ul>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
                  <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
                  <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
                  <EditorialSelect
                    label="Country"
                    value={country}
                    options={COUNTRIES}
                    onChange={(v) => setCountry(v)}
                  />
                </div>
                <Field label="Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
                <div className="grid sm:grid-cols-3 gap-5">
                  <Field label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
                  {country === "IN" ? (
                    <EditorialSelect label="State" value={state} options={STATES_IN} onChange={setState} />
                  ) : (
                    <Field label="Region" value={state} onChange={setState} />
                  )}
                  <Field label="Postal code" value={form.pincode} onChange={(v) => setForm({ ...form, pincode: v })} />
                </div>

                <div className="pt-4">
                  <EditorialSelect
                    label="Shipping method"
                    value={shipping}
                    options={SHIPPING.map((s) => ({
                      value: s.value,
                      label: `${s.label} · ${s.cost === 0 ? "Complimentary" : formatAmount(s.cost, currency)}`,
                    }))}
                    onChange={setShipping}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <EditorialSelect label="Payment method" value={payment} options={PAYMENTS} onChange={setPayment} />
                <div className="border border-border p-5 text-sm text-muted-foreground leading-relaxed">
                  <div className="flex items-center gap-2 label-eyebrow !text-foreground">
                    <Lock size={13} strokeWidth={1.6} /> Preview mode
                  </div>
                  <p className="mt-3">
                    Payment capture is not connected yet. Confirming will complete the flow
                    without charging a card or recording an order.
                  </p>
                </div>
                <ul className="grid sm:grid-cols-2 gap-3 text-[0.7rem] text-muted-foreground">
                  <li className="flex items-center gap-2"><ShieldCheck size={13} strokeWidth={1.6} /> Insured, signature-on-delivery</li>
                  <li className="flex items-center gap-2"><Truck size={13} strokeWidth={1.6} /> DDP — duties settled at checkout</li>
                </ul>
              </div>
            )}

            <div className="mt-10 flex items-center gap-4">
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="label-eyebrow border border-border px-6 py-4 hover:border-foreground transition-colors press"
                >
                  Back
                </button>
              )}
              {step < 2 ? (
                <button
                  type="button"
                  disabled={step === 1 && !deliveryValid}
                  onClick={() => setStep(step + 1)}
                  className="label-eyebrow !text-background bg-foreground px-8 py-4 hover:bg-chrome transition-colors disabled:bg-muted disabled:!text-chrome-muted disabled:cursor-not-allowed press"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => { clear(); setPlaced(true); }}
                  className="label-eyebrow !text-background bg-foreground px-8 py-4 hover:bg-chrome transition-colors press"
                >
                  Confirm order
                </button>
              )}
            </div>
            {step === 1 && !deliveryValid && (
              <p className="mt-3 text-[0.7rem] text-muted-foreground">Complete every delivery field to continue.</p>
            )}
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-28 lg:self-start border border-border p-6">
            <div className="label-eyebrow">Order summary</div>
            <dl className="mt-5 space-y-3 text-sm">
              <Row label={`Subtotal · ${count} ${count === 1 ? "piece" : "pieces"}`} value={formatAmount(subtotal, currency)} />
              <Row label="Shipping" value={shipCost === 0 ? "Complimentary" : formatAmount(shipCost, currency)} />
              <Row label="Duties & GST" value="Included" />
            </dl>
            <div className="mt-5 pt-5 border-t border-border flex items-baseline justify-between">
              <span className="label-eyebrow !text-foreground">Total</span>
              <span className="price-num text-lg">{formatAmount(total, currency)}</span>
            </div>
            <p className="mt-5 text-[0.65rem] text-muted-foreground leading-relaxed">
              One-of-one pieces are held for 20 minutes while you complete checkout.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="price-num text-sm">{value}</dd>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="label-eyebrow mb-2 block">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-border bg-transparent px-3 h-11 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none transition-colors"
      />
    </label>
  );
}
