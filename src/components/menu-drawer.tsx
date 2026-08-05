import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, ChevronRight, Heart, Mail, MessageCircle, Moon, Search, Sun, User, X } from "lucide-react";

import { menuSections, concierge, type MenuNode } from "@/lib/mockData";
import { CURRENCY_META, LANGUAGES, useSettings, type Language } from "@/lib/settings-context";
import { useWishlist } from "@/lib/wishlist-context";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import { CurrencyPicker } from "./currency-picker";


/** Flag shown next to the settings summary — derived from the active currency. */
const CURRENCY_FLAGS: Partial<Record<string, string>> = {
  INR: "🇮🇳", USD: "🇺🇸", EUR: "🇪🇺", GBP: "🇬🇧", JPY: "🇯🇵", THB: "🇹🇭",
  AED: "🇦🇪", SGD: "🇸🇬", AUD: "🇦🇺", CAD: "🇨🇦", CHF: "🇨🇭", HKD: "🇭🇰",
};

const LANGUAGE_LABELS: Record<Language, string> = {
  EN: "English",
  FR: "Français",
  JP: "日本語",
  TH: "ไทย",
};

/** Inline brand glyphs — kept minimal & currentColor for a refined feel. */
function ChannelIcon({ name, size = 14 }: { name: string; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": true } as const;
  switch (name) {
    case "whatsapp":
      return (
        <svg {...common}>
          <path d="M17.5 14.4c-.3-.15-1.7-.83-2-.93-.27-.1-.47-.15-.66.15-.2.29-.76.93-.93 1.12-.17.2-.34.22-.63.07-.3-.15-1.24-.46-2.36-1.46-.87-.78-1.46-1.73-1.63-2.03-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.51.15-.17.2-.29.29-.49.1-.2.05-.37-.02-.51-.07-.15-.66-1.6-.9-2.19-.24-.57-.48-.5-.66-.5h-.56c-.2 0-.51.07-.78.37-.27.29-1.02.99-1.02 2.42s1.05 2.8 1.2 3c.15.2 2.06 3.15 5 4.42.7.3 1.25.48 1.68.62.7.22 1.34.19 1.85.12.56-.08 1.7-.69 1.95-1.36.24-.66.24-1.23.17-1.36-.07-.12-.27-.19-.56-.34zM12 2.05c-5.5 0-9.95 4.44-9.95 9.93 0 1.75.46 3.46 1.34 4.98L2 22l5.18-1.36a9.95 9.95 0 0 0 4.82 1.23h.01c5.49 0 9.94-4.45 9.94-9.94 0-2.65-1.03-5.15-2.9-7.03A9.9 9.9 0 0 0 12 2.05z" />
        </svg>
      );
    case "instagram":
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case "email":
      return <Mail size={size} strokeWidth={1.5} />;
    default:
      return null;
  }
}

type Props = {
  open: boolean;
  onClose: () => void;
  onOpenWishlist?: () => void;
  onOpenAccount?: () => void;
  onOpenSearch?: () => void;
};

export function MenuDrawer({ open, onClose, onOpenWishlist, onOpenAccount, onOpenSearch }: Props) {

  const { count } = useWishlist();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [careOpen, setCareOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  useBodyScrollLock(open);

  // Swipe-to-dismiss (mobile). Continuous drag; commit close on release.
  const asideRef = useRef<HTMLElement>(null);
  const [drag, setDrag] = useState<number | null>(null);
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const activePointer = useRef<number | null>(null);
  const decided = useRef<"h" | "v" | null>(null);

  const onPointerDown = (e: ReactPointerEvent<HTMLElement>) => {
    if (e.pointerType === "mouse") return;
    activePointer.current = e.pointerId;
    startX.current = e.clientX;
    startY.current = e.clientY;
    decided.current = null;
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLElement>) => {
    if (activePointer.current !== e.pointerId || startX.current == null || startY.current == null) return;
    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;
    if (decided.current == null) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      decided.current = Math.abs(dx) > Math.abs(dy) ? "h" : "v";
    }
    if (decided.current !== "h") return;
    setDrag(Math.min(0, dx)); // only left swipe
  };
  const endDrag = () => {
    const width = asideRef.current?.offsetWidth ?? 320;
    const d = drag ?? 0;
    if (d < -Math.min(96, width * 0.28)) onClose();
    setDrag(null);
    startX.current = null;
    startY.current = null;
    activePointer.current = null;
    decided.current = null;
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setDrag(null);
      setCareOpen(false);
      setSettingsOpen(false);
    }
  }, [open]);

  const toggle = (label: string) =>
    setExpanded((cur) => (cur === label ? null : label));

  const renderNode = (item: MenuNode) => {
    const hasChildren = !!item.children?.length;
    const isOpen = expanded === item.label;

    if (!hasChildren) {
      return (
        <li key={item.label}>
          <Link
            to={item.to as string}
            onClick={onClose}
            className="block font-display text-xl text-foreground hover:opacity-70 transition-opacity"
          >
            {item.label}
          </Link>
        </li>
      );
    }

    return (
      <li key={item.label}>
        <button
          onClick={() => toggle(item.label)}
          aria-expanded={isOpen}
          className="w-full flex items-center justify-between gap-4 text-left font-display text-xl text-foreground hover:opacity-70 transition-opacity"
        >
          <span>{item.label}</span>
          <ChevronDown
            size={16}
            strokeWidth={1.5}
            className={`transition-transform duration-[250ms] ease-spring ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
        <div
          className={`grid transition-[grid-template-rows,opacity] duration-[250ms] ease-spring ${
            isOpen ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <ul className="pl-1 space-y-3 border-l border-border/60 ml-1">
              {item.children!.map((child) => (
                <li key={child.label} className="pl-4">
                  <Link
                    to={child.to as string}
                    onClick={onClose}
                    className="block text-sm tracking-wide text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {child.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </li>
    );
  };

  const dragging = drag != null;
  const translate = open ? `translateX(${drag ?? 0}px)` : "translateX(-100%)";

  return (
    <div
      className={`fixed inset-0 z-[70] transition-opacity duration-500 ${
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <aside
        ref={asideRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        style={{
          transform: translate,
          transition: dragging ? "none" : undefined,
          touchAction: "pan-y",
        }}
        className={`absolute left-0 top-0 h-dvh w-[85vw] max-w-[380px] md:max-w-md bg-background border-r border-border transition-transform duration-[520ms] ease-editorial will-change-transform`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-6 md:px-8 py-4 md:py-5 border-b border-border">
            <span className="label-eyebrow !text-foreground">Menu</span>
            <button
              onClick={onClose}
              aria-label="Close menu"
              className="press inline-flex items-center justify-center min-w-[44px] min-h-[44px] -mr-2 opacity-80 hover:opacity-100 hover:rotate-90"
            >
              <X size={20} />
            </button>
          </div>

          <div className={`flex-1 min-h-0 overflow-y-auto scrollbar-luxury px-6 md:px-8 py-8 space-y-10 ${open ? "stagger-children" : ""}`}>
            {onOpenSearch && (
              <button
                type="button"
                onClick={onOpenSearch}
                className="hidden md:flex w-full items-center gap-3 px-4 h-11 border border-border hover:border-foreground transition-colors text-sm text-muted-foreground"
              >
                <Search size={14} strokeWidth={1.5} />
                <span>Search the archive</span>
              </button>
            )}
            {menuSections.map((section, i) => (
              <section
                key={section.eyebrow}
                style={{ ["--i" as string]: i } as React.CSSProperties}
              >
                <div className="label-eyebrow mb-4 text-muted-foreground">{section.eyebrow}</div>
                <ul className="space-y-4">
                  {section.items.map(renderNode)}
                </ul>
              </section>
            ))}

            {/* Mobile-only quick actions */}
            <section className="md:hidden pt-2 border-t border-border">
              <div className="pt-6 grid grid-cols-2 gap-2">
                <button
                  onClick={onOpenWishlist}
                  className="flex items-center justify-center gap-2 text-sm py-3 border border-border hover:border-foreground transition-colors"
                >
                  <Heart size={14} strokeWidth={1.5} />
                  <span>Wishlist{count > 0 ? ` (${count})` : ""}</span>
                </button>
                <button
                  onClick={onOpenAccount}
                  className="flex items-center justify-center gap-2 text-sm py-3 border border-border hover:border-foreground transition-colors"
                >
                  <User size={14} strokeWidth={1.5} />
                  <span>Account</span>
                </button>
              </div>
            </section>

            {/* Client Care — accordion */}
            <section className="pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setCareOpen((v) => !v)}
                aria-expanded={careOpen}
                className="w-full flex items-center justify-between pt-6"
              >
                <span className="inline-flex items-center gap-2">
                  <MessageCircle size={14} strokeWidth={1.5} className="text-muted-foreground" />
                  <span className="label-eyebrow !text-foreground">{concierge.eyebrow}</span>
                </span>
                <ChevronDown
                  size={14}
                  strokeWidth={1.5}
                  className={`text-muted-foreground transition-transform duration-300 ease-out ${careOpen ? "rotate-180" : ""}`}
                />
              </button>
              <div
                className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                  careOpen ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="text-sm text-muted-foreground mb-4">{concierge.message}</p>
                  <ul className="flex flex-wrap gap-2">
                    {concierge.channels.map((c) => (
                      <li key={c.label}>
                        <a
                          href={c.href}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={c.label}
                          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 border border-border text-foreground/80 hover:text-foreground hover:border-foreground transition-colors"
                        >
                          <ChannelIcon name={c.icon} />
                          <span>{c.label}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          </div>

          {/* Compact settings accordion */}
          <SettingsAccordion open={settingsOpen} onToggle={() => setSettingsOpen((v) => !v)} />
        </div>
      </aside>
    </div>
  );
}

function SettingsAccordion({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const s = useSettings();
  const isDark = s.theme === "dark";
  const currencyMeta = CURRENCY_META[s.currency];
  const flag = CURRENCY_FLAGS[s.currency] ?? "🌐";
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div
      className="shrink-0 border-t border-border bg-background"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-6 md:px-8 py-4 text-xs"
      >
        <span className="label-eyebrow !text-muted-foreground">Settings</span>
        <span className="inline-flex items-center gap-2 text-foreground/80">
          <span aria-hidden>{flag}</span>
          <span className="tracking-wide">
            {s.language} · {currencyMeta.symbol} {s.currency}
          </span>
          <ChevronDown
            size={12}
            strokeWidth={1.5}
            className={`transition-transform duration-[250ms] ease-spring ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-[250ms] ease-spring ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div
            className={`px-6 md:px-8 pb-4 space-y-4 max-h-[45vh] overflow-y-auto scrollbar-luxury transition-[opacity,transform] duration-[250ms] ease-spring ${
              open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
            }`}
          >
            {/* Theme */}
            <div className="flex items-center justify-between gap-3">
              <span className="label-eyebrow !text-muted-foreground">Theme</span>
              <button
                type="button"
                onClick={() => s.setTheme(isDark ? "light" : "dark")}
                aria-label={`Switch to ${isDark ? "Atelier Off-White" : "Chrome Noir"} theme`}
                className="group inline-flex items-center gap-2 px-3 h-8 border border-border rounded-full text-xs text-foreground hover:border-foreground transition-colors duration-300"
              >
                <span
                  className={`inline-flex transition-transform duration-300 ease-spring ${
                    isDark ? "rotate-180" : "rotate-0"
                  }`}
                >
                  {isDark ? <Sun size={12} strokeWidth={1.5} /> : <Moon size={12} strokeWidth={1.5} />}
                </span>
                <span className="tracking-wide">{isDark ? "Chrome Noir" : "Atelier Off-White"}</span>
              </button>
            </div>

            {/* Language chips */}
            <div>
              <div className="label-eyebrow mb-2 !text-muted-foreground">Language</div>
              <div className="flex flex-wrap gap-1.5">
                {LANGUAGES.map((l) => (
                  <button
                    key={l}
                    onClick={() => s.setLanguage(l)}
                    aria-pressed={s.language === l}
                    title={LANGUAGE_LABELS[l]}
                    className={`inline-flex items-center justify-center min-w-[42px] px-2.5 py-1 rounded-full text-[11px] tracking-[0.14em] border transition-[background-color,color,border-color,transform] duration-200 ease-spring active:scale-[0.96] ${
                      s.language === l
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/60"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Currency */}
            <div>
              <div className="label-eyebrow mb-2 !text-muted-foreground">Currency</div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {(["INR", "USD", "EUR"] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => s.setCurrency(c)}
                    aria-pressed={s.currency === c}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] tracking-[0.14em] border transition-[background-color,color,border-color,transform] duration-200 ease-spring active:scale-[0.96] ${
                      s.currency === c
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/60"
                    }`}
                  >
                    <span aria-hidden>{CURRENCY_META[c].symbol}</span>
                    <span>{c}</span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="w-full flex items-center justify-between gap-3 px-3 h-11 border border-border hover:border-foreground transition-colors duration-200 text-sm text-foreground"
              >
                <span className="inline-flex items-center gap-3 min-w-0">
                  <span
                    aria-hidden
                    className="grid place-items-center h-7 w-9 border border-border text-[11px]"
                  >
                    {currencyMeta.symbol}
                  </span>
                  <span className="flex flex-col items-start min-w-0">
                    <span className="text-sm truncate">{currencyMeta.name}</span>
                    <span className="text-[10px] tracking-[0.18em] uppercase text-muted-foreground">
                      {s.currency}
                    </span>
                  </span>
                </span>
                <ChevronRight size={14} strokeWidth={1.5} className="opacity-60" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <CurrencyPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        value={s.currency}
        onChange={s.setCurrency}
      />
    </div>
  );
}

