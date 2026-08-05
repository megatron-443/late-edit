import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";


export type Theme = "light" | "dark";
export type Currency =
  | "INR" | "USD" | "EUR" | "GBP" | "AED" | "JPY"
  | "AUD" | "CAD" | "CHF" | "CNY" | "HKD" | "SGD"
  | "SEK" | "NOK" | "DKK" | "NZD" | "KRW" | "THB"
  | "MXN" | "BRL" | "ZAR" | "TRY" | "SAR" | "QAR"
  | "KWD" | "IDR" | "MYR" | "PHP" | "VND" | "PLN" | "CZK";

export type Atelier = "Paris Atelier" | "Tokyo Studio" | "New York Flagship";
/** Interface language codes surfaced as compact chips in the drawer. */
export type Language = "EN" | "FR" | "JP" | "TH";
export const LANGUAGES: Language[] = ["EN", "FR", "JP", "TH"];

/**
 * Currency catalogue. Rates are EUR→X (mock, prototype only).
 * `name` powers the luxury selector; `pinned` marks the six majors that
 * always appear at the top of the list.
 */
export const CURRENCY_META: Record<
  Currency,
  { symbol: string; rate: number; locale: string; name: string; pinned?: boolean }
> = {
  INR: { symbol: "₹", rate: 92, locale: "en-IN", name: "Indian Rupee", pinned: true },
  USD: { symbol: "$", rate: 1.08, locale: "en-US", name: "US Dollar", pinned: true },
  EUR: { symbol: "€", rate: 1, locale: "en-IE", name: "Euro", pinned: true },
  GBP: { symbol: "£", rate: 0.85, locale: "en-GB", name: "British Pound", pinned: true },
  AED: { symbol: "د.إ", rate: 3.97, locale: "ar-AE", name: "UAE Dirham", pinned: true },
  JPY: { symbol: "¥", rate: 165, locale: "ja-JP", name: "Japanese Yen", pinned: true },

  AUD: { symbol: "A$", rate: 1.65, locale: "en-AU", name: "Australian Dollar" },
  CAD: { symbol: "C$", rate: 1.48, locale: "en-CA", name: "Canadian Dollar" },
  CHF: { symbol: "CHF", rate: 0.95, locale: "de-CH", name: "Swiss Franc" },
  CNY: { symbol: "¥", rate: 7.85, locale: "zh-CN", name: "Chinese Yuan" },
  HKD: { symbol: "HK$", rate: 8.45, locale: "en-HK", name: "Hong Kong Dollar" },
  SGD: { symbol: "S$", rate: 1.46, locale: "en-SG", name: "Singapore Dollar" },
  SEK: { symbol: "kr", rate: 11.4, locale: "sv-SE", name: "Swedish Krona" },
  NOK: { symbol: "kr", rate: 11.7, locale: "nb-NO", name: "Norwegian Krone" },
  DKK: { symbol: "kr", rate: 7.46, locale: "da-DK", name: "Danish Krone" },
  NZD: { symbol: "NZ$", rate: 1.80, locale: "en-NZ", name: "New Zealand Dollar" },
  KRW: { symbol: "₩", rate: 1470, locale: "ko-KR", name: "South Korean Won" },
  THB: { symbol: "฿", rate: 39, locale: "th-TH", name: "Thai Baht" },
  MXN: { symbol: "Mex$", rate: 20, locale: "es-MX", name: "Mexican Peso" },
  BRL: { symbol: "R$", rate: 5.5, locale: "pt-BR", name: "Brazilian Real" },
  ZAR: { symbol: "R", rate: 20, locale: "en-ZA", name: "South African Rand" },
  TRY: { symbol: "₺", rate: 35, locale: "tr-TR", name: "Turkish Lira" },
  SAR: { symbol: "﷼", rate: 4.05, locale: "ar-SA", name: "Saudi Riyal" },
  QAR: { symbol: "﷼", rate: 3.93, locale: "ar-QA", name: "Qatari Riyal" },
  KWD: { symbol: "د.ك", rate: 0.33, locale: "ar-KW", name: "Kuwaiti Dinar" },
  IDR: { symbol: "Rp", rate: 17000, locale: "id-ID", name: "Indonesian Rupiah" },
  MYR: { symbol: "RM", rate: 5.1, locale: "ms-MY", name: "Malaysian Ringgit" },
  PHP: { symbol: "₱", rate: 62, locale: "en-PH", name: "Philippine Peso" },
  VND: { symbol: "₫", rate: 27000, locale: "vi-VN", name: "Vietnamese Dong" },
  PLN: { symbol: "zł", rate: 4.3, locale: "pl-PL", name: "Polish Złoty" },
  CZK: { symbol: "Kč", rate: 25, locale: "cs-CZ", name: "Czech Koruna" },
};

export const ALL_CURRENCIES = Object.keys(CURRENCY_META) as Currency[];
export const PINNED_CURRENCIES = ALL_CURRENCIES.filter((c) => CURRENCY_META[c].pinned);
export const OTHER_CURRENCIES = ALL_CURRENCIES.filter((c) => !CURRENCY_META[c].pinned)
  .sort((a, b) => CURRENCY_META[a].name.localeCompare(CURRENCY_META[b].name));

/**
 * Best-effort timezone → currency mapping. Runs client-side only.
 * Falls back to USD when the zone is not in the list.
 */
const TZ_TO_CURRENCY: Record<string, Currency> = {
  "Asia/Kolkata": "INR", "Asia/Calcutta": "INR",
  "Asia/Dubai": "AED", "Asia/Muscat": "AED",
  "Asia/Tokyo": "JPY",
  "Asia/Shanghai": "CNY", "Asia/Chongqing": "CNY", "Asia/Urumqi": "CNY",
  "Asia/Hong_Kong": "HKD",
  "Asia/Singapore": "SGD",
  "Asia/Seoul": "KRW",
  "Asia/Bangkok": "THB",
  "Asia/Jakarta": "IDR", "Asia/Makassar": "IDR",
  "Asia/Kuala_Lumpur": "MYR", "Asia/Kuching": "MYR",
  "Asia/Manila": "PHP",
  "Asia/Ho_Chi_Minh": "VND", "Asia/Saigon": "VND",
  "Asia/Riyadh": "SAR",
  "Asia/Qatar": "QAR",
  "Asia/Kuwait": "KWD",
  "Europe/London": "GBP",
  "Europe/Zurich": "CHF",
  "Europe/Stockholm": "SEK",
  "Europe/Oslo": "NOK",
  "Europe/Copenhagen": "DKK",
  "Europe/Warsaw": "PLN",
  "Europe/Prague": "CZK",
  "Europe/Istanbul": "TRY",
  "America/New_York": "USD", "America/Chicago": "USD", "America/Denver": "USD",
  "America/Los_Angeles": "USD", "America/Phoenix": "USD", "America/Anchorage": "USD",
  "America/Toronto": "CAD", "America/Vancouver": "CAD", "America/Edmonton": "CAD",
  "America/Mexico_City": "MXN", "America/Monterrey": "MXN",
  "America/Sao_Paulo": "BRL", "America/Fortaleza": "BRL",
  "Australia/Sydney": "AUD", "Australia/Melbourne": "AUD", "Australia/Perth": "AUD",
  "Australia/Brisbane": "AUD", "Australia/Adelaide": "AUD",
  "Pacific/Auckland": "NZD",
  "Africa/Johannesburg": "ZAR",
};

function detectCurrencyFromTimezone(): Currency | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && TZ_TO_CURRENCY[tz]) return TZ_TO_CURRENCY[tz];
    if (tz?.startsWith("Europe/")) return "EUR";
    if (tz?.startsWith("Australia/")) return "AUD";
    if (tz?.startsWith("America/")) return "USD";
    if (tz?.startsWith("Africa/")) return "EUR";
    return null;
  } catch {
    return null;
  }
}

/** Region hints from the browser: navigator.languages first, then timezone. */
function detectRegion(): { language: Language; currency: Currency | null } {
  let language: Language = "EN";
  let currency: Currency | null = null;
  try {
    const tags = [
      ...(navigator.languages ?? []),
      navigator.language ?? "",
    ].filter(Boolean).map((t) => t.toLowerCase());

    for (const tag of tags) {
      if (tag.startsWith("fr")) { language = "FR"; break; }
      if (tag.startsWith("ja")) { language = "JP"; break; }
      if (tag.startsWith("th")) { language = "TH"; break; }
      if (tag.startsWith("en") || tag.startsWith("hi")) { language = "EN"; break; }
    }

    const region = tags.find((t) => t.includes("-"))?.split("-")[1]?.toUpperCase();
    const REGION_CURRENCY: Record<string, Currency> = {
      IN: "INR", US: "USD", GB: "GBP", FR: "EUR", DE: "EUR", JP: "JPY",
      TH: "THB", AE: "AED", SG: "SGD", AU: "AUD", CA: "CAD", CH: "CHF",
    };
    if (region && REGION_CURRENCY[region]) currency = REGION_CURRENCY[region];
    if (tags.some((t) => t.startsWith("hi") || t.endsWith("-in"))) currency = "INR";
  } catch {}

  if (!currency) currency = detectCurrencyFromTimezone();
  return { language, currency };
}

type SettingsCtx = {
  theme: Theme; setTheme: (t: Theme) => void;
  currency: Currency; setCurrency: (c: Currency) => void;
  atelier: Atelier; setAtelier: (a: Atelier) => void;
  language: Language; setLanguage: (l: Language) => void;
  notifications: boolean; setNotifications: (v: boolean) => void;
};

const Ctx = createContext<SettingsCtx | null>(null);
const KEY = "late-edit-settings";
const CURRENCY_TOUCHED_KEY = "late-edit-currency-touched";

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [currency, setCurrencyStateRaw] = useState<Currency>("INR");
  const [atelier, setAtelierState] = useState<Atelier>("Paris Atelier");
  const [language, setLanguageState] = useState<Language>("EN");
  const [notifications, setNotificationsState] = useState<boolean>(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let touched = false;
    let storedLanguage: Language | null = null;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (s.theme) setThemeState(s.theme);
        if (s.currency && CURRENCY_META[s.currency as Currency]) {
          setCurrencyStateRaw(s.currency);
        }
        if (s.atelier) setAtelierState(s.atelier);
        if (LANGUAGES.includes(s.language)) {
          storedLanguage = s.language as Language;
          setLanguageState(storedLanguage);
        }
        if (typeof s.notifications === "boolean") setNotificationsState(s.notifications);
      }
      touched = localStorage.getItem(CURRENCY_TOUCHED_KEY) === "1";
    } catch {}

    // Auto-detect on first visit only. Never override an explicit choice.
    const detected = detectRegion();
    if (!touched && detected.currency) setCurrencyStateRaw(detected.currency);
    if (!storedLanguage) setLanguageState(detected.language);

    setHydrated(true);
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyStateRaw(c);
    try { localStorage.setItem(CURRENCY_TOUCHED_KEY, "1"); } catch {}
  };

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(KEY, JSON.stringify({ theme, currency, atelier, language, notifications }));
  }, [theme, currency, atelier, language, notifications, hydrated]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  /**
   * Explicit toggle only. Primary path: the View Transitions API snapshots the
   * current paint, swaps the palette synchronously, then cross-fades old → new
   * as two flat images over 260ms — surfaces, text, icons, images and gradient
   * scrims all move together, and no real element gets a transition, so hover
   * and press timing stay completely independent.
   *
   * Fallback (no view-transition support): the scoped `.theme-transition` class
   * fades background/border colours on structural surfaces only; text and icons
   * swap instantly rather than passing through a muddy midpoint.
   *
   * Reduced motion, first load, navigation and storage restoration all swap
   * instantly — none of them route through here.
   */
  const setTheme = (t: Theme) => {
    if (t === theme) return;
    const root = document.documentElement;

    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setThemeState(t);
      return;
    }

    const startViewTransition = (
      document as Document & {
        startViewTransition?: (cb: () => void) => { finished: Promise<void> };
      }
    ).startViewTransition;

    if (typeof startViewTransition === "function") {
      // `theme-vt` scopes the cross-fade keyframes to palette changes, so any
      // other view transition on the site is unaffected.
      root.classList.add("theme-vt");
      const transition = startViewTransition.call(document, () => {
        flushSync(() => setThemeState(t));
      });
      transition.finished
        .catch(() => {})
        .finally(() => root.classList.remove("theme-vt"));
      return;
    }

    root.classList.add("theme-transition");
    window.setTimeout(() => root.classList.remove("theme-transition"), 320);
    setThemeState(t);
  };


  return (
    <Ctx.Provider value={{
      theme, setTheme,
      currency, setCurrency,
      atelier, setAtelier: setAtelierState,
      language, setLanguage: setLanguageState,
      notifications, setNotifications: setNotificationsState,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useSettings() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSettings must be used within SettingsProvider");
  return v;
}
