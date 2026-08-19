import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { accountTabs } from "@/lib/mockData";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import { OverlayPortal, useOverlayPresence } from "./overlay-portal";


export function AccountDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<(typeof accountTabs)[number]["id"]>(accountTabs[0].id);
  const active = accountTabs.find((t) => t.id === tab) ?? accountTabs[0];
  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const { mounted, shown } = useOverlayPresence(open, 560);

  if (!mounted) return null;

  return (
    <OverlayPortal>
    <div
      className={`fixed inset-0 z-[70] transition-opacity duration-500 ${
        shown ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      aria-hidden={!shown}
    >
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={onClose} />
      <aside
        className={`absolute right-0 top-0 h-dvh w-full max-w-md bg-surface border-l border-border transition-transform duration-[520ms] ease-editorial will-change-transform ${
          shown ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-6 md:px-8 py-4 md:py-6 border-b border-border">
            <span className="label-eyebrow !text-foreground">Account</span>
            <button
              onClick={onClose}
              aria-label="Close account"
              className="press inline-flex items-center justify-center min-w-[44px] min-h-[44px] -mr-2 opacity-80 hover:opacity-100 hover:rotate-90"
            >
              <X size={20} />
            </button>
          </div>


          <div className="border-b border-border">
            <div className="relative flex">
              {accountTabs.map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`relative flex-1 label-eyebrow py-4 px-3 transition-colors duration-300 ease-editorial press ${
                    tab === t.id ? "!text-foreground" : "hover:!text-foreground"
                  }`}
                  style={{ ["--i" as string]: i } as React.CSSProperties}
                >
                  {t.label}
                  <span
                    className={`pointer-events-none absolute left-0 right-0 bottom-0 h-[2px] bg-foreground origin-center transition-transform duration-[420ms] ease-editorial ${
                      tab === t.id ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div key={active.id} className="flex-1 overflow-y-auto px-8 py-10 space-y-6 fade-scale-in">
            <h2 className="font-display text-3xl leading-tight">{active.heading}</h2>
            <p className="text-sm text-muted-foreground max-w-sm">{active.body}</p>

            {active.id === "signin" && (
              <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                <input type="email" placeholder="Email" className="w-full bg-transparent border-b border-border py-3 text-sm focus:outline-none focus:border-foreground" />
                <input type="password" placeholder="Password" className="w-full bg-transparent border-b border-border py-3 text-sm focus:outline-none focus:border-foreground" />
              </form>
            )}
            {active.id === "track" && (
              <form onSubmit={(e) => e.preventDefault()}>
                <input placeholder="LE//___" className="w-full bg-transparent border-b border-border py-3 text-sm focus:outline-none focus:border-foreground" />
              </form>
            )}
            {active.id === "pass" && (
              <form onSubmit={(e) => e.preventDefault()}>
                <input placeholder="Referral code or email" className="w-full bg-transparent border-b border-border py-3 text-sm focus:outline-none focus:border-foreground" />
              </form>
            )}
          </div>

          <div
            className="px-8 py-6 border-t border-border"
            style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
          >
            <button className="press w-full label-eyebrow !text-background bg-foreground py-4 hover:bg-chrome transition-colors duration-300 ease-editorial">
              {active.cta}
            </button>
          </div>
        </div>
      </aside>
    </div>
    </OverlayPortal>
  );
}
