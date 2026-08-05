import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Plus, Minus, Truck, ShieldCheck, Headphones, Sparkles, ChevronDown, type LucideIcon } from "lucide-react";
import { footerGroups, vipBanner, trustSignals } from "@/lib/mockData";
import { useSettings } from "@/lib/settings-context";
import { PaymentStrip } from "@/components/payment-strip";
import { RegionSelector } from "@/components/region-selector";

const iconMap: Record<string, LucideIcon> = {
  Truck,
  ShieldCheck,
  Headphones,
  Sparkles,
};

type FooterLink = { label: string; to: string; params?: Record<string, string> };

function FooterLinkItem({ link }: { link: FooterLink }) {
  const AnyLink = Link as unknown as React.ComponentType<Record<string, unknown>>;
  return (
    <AnyLink
      to={link.to}
      params={link.params}
      className="text-sm text-foreground underline underline-offset-4 decoration-foreground/30 hover:decoration-foreground transition-colors"
    >
      {link.label}
    </AnyLink>
  );
}

export function SiteFooter() {
  const { currency, language } = useSettings();
  const [openId, setOpenId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [regionOpen, setRegionOpen] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setEmail("");
  };

  const regionLabel = language.includes("India") ? "India" : language.split(" — ")[1] ?? language;

  return (
    <footer className="border-t border-border mt-8 md:mt-10">
      {/* Trust & Services strip */}
      <div className="border-b border-border">
        <ul className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4">
          {trustSignals.map((signal, i) => {
            const Icon = iconMap[signal.icon] ?? ShieldCheck;
            return (
              <li
                key={signal.id}
                className={`flex items-start gap-3 px-5 py-6 md:px-6 md:py-8 border-border ${
                  i % 2 === 1 ? "border-l" : ""
                } ${i < 2 ? "border-b md:border-b-0" : ""} ${i >= 2 ? "md:border-l" : ""} ${
                  i === 2 ? "border-l-0 md:border-l" : ""
                }`}
              >
                <Icon size={18} strokeWidth={1.25} className="text-foreground shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="text-[0.72rem] tracking-[0.16em] uppercase text-foreground">
                    {signal.title}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{signal.note}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Desktop link columns */}
      <div className="hidden md:block">
        <div className="max-w-6xl mx-auto px-10 py-10 grid grid-cols-4 gap-12">
          <div>
            <Link
              to="/"
              className="font-display text-[0.9rem] tracking-[0.36em] uppercase text-foreground"
            >
              LATE EDIT
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs leading-relaxed">
              Upcycled 1-of-1 luxury. Cut once, released once.
            </p>
            <PaymentStrip className="mt-8" />
          </div>
          {footerGroups.map((group) => (
            <div key={group.id}>
              <div className="text-[0.7rem] tracking-[0.24em] uppercase text-muted-foreground mb-5">{group.title}</div>
              <ul className="space-y-3">
                {group.links.map((l) => (
                  <li key={l.label}>
                    <FooterLinkItem link={l as FooterLink} />
                  </li>
                ))}
              </ul>
              {group.id === "legal" && (
                <form onSubmit={onSubmit} className="mt-8">
                  <div className="text-[0.7rem] tracking-[0.24em] uppercase text-muted-foreground mb-3">{vipBanner.eyebrow}</div>
                  <div className="flex items-center border border-border">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={vipBanner.placeholder}
                      className="flex-1 min-w-0 bg-transparent px-3 h-10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                    <button type="submit" className="h-10 px-3 text-[0.65rem] tracking-widest uppercase text-foreground border-l border-border hover:bg-foreground hover:text-background transition-colors">
                      {vipBanner.cta}
                    </button>
                  </div>
                  <p className="mt-2 text-[0.65rem] text-muted-foreground">
                    {submitted ? "Request received." : vipBanner.note}
                  </p>
                </form>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile accordion */}
      <div className="md:hidden">
        <ul>
          {footerGroups.map((group) => {
            const open = openId === group.id;
            return (
              <li key={group.id} className="border-b border-border">
                <button
                  onClick={() => setOpenId(open ? null : group.id)}
                  aria-expanded={open}
                  className="w-full flex items-center justify-between px-6 py-5 text-[0.72rem] tracking-[0.24em] uppercase text-foreground"
                >
                  <span>{group.title}</span>
                  {open ? <Minus size={16} /> : <Plus size={16} />}
                </button>
                <div className={`overflow-hidden transition-all duration-300 ease-out ${open ? "max-h-96" : "max-h-0"}`}>
                  <ul className="px-6 pb-5 space-y-3">
                    {group.links.map((l) => (
                      <li key={l.label}>
                        <FooterLinkItem link={l as FooterLink} />
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="px-6 py-6 border-b border-border">
          <PaymentStrip />
        </div>
      </div>

      {/* Region + legal strip */}
      <div className="border-t border-border">
        <div
          className="max-w-6xl mx-auto px-6 md:px-10 py-6 flex flex-col md:flex-row gap-4 md:items-center md:justify-between text-xs text-muted-foreground"
          style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRegionOpen(true)}
              aria-label={`Shipping to ${regionLabel} · ${currency} — change region`}
              className="inline-flex items-center gap-2 border border-border px-3 py-2 hover:text-foreground hover:border-foreground/40 transition-colors"
            >
              <span>Shipping to</span>
              <span className="text-foreground">{regionLabel}</span>
              <span className="opacity-40">·</span>
              <span className="price-num text-foreground">{currency}</span>
              <ChevronDown size={14} strokeWidth={1.5} />
            </button>
          </div>
          <span className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link to="/about" className="hover:text-foreground">Company</Link>
            <Link to="/legal/$slug" params={{ slug: "terms" }} className="hover:text-foreground">Terms</Link>
            <Link to="/legal/$slug" params={{ slug: "privacy" }} className="hover:text-foreground">Privacy</Link>
            <Link to="/legal/$slug" params={{ slug: "returns" }} className="hover:text-foreground">Returns</Link>
            <Link to="/legal/$slug" params={{ slug: "grievance" }} className="hover:text-foreground">Grievance</Link>
            <span>© {new Date().getFullYear()} LATE EDIT</span>
          </span>
        </div>
      </div>

      <RegionSelector open={regionOpen} onClose={() => setRegionOpen(false)} />
    </footer>
  );
}
