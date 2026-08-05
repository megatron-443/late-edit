import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { searchSuggestions, trendingTags, products } from "@/lib/mockData";
import { Link } from "@tanstack/react-router";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import { useRecentSearches } from "@/lib/recent-searches";

const PLACEHOLDER_DESKTOP = "Search serials, fabrics, silhouettes…";
const PLACEHOLDER_MOBILE = "Search LATE EDIT…";

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  // Server and first client render always use the desktop placeholder so the
  // markup matches; the mobile variant is swapped in after hydration.
  const [placeholder, setPlaceholder] = useState(PLACEHOLDER_DESKTOP);
  const { recent, addRecent, removeRecent, clearRecent } = useRecentSearches();
  useBodyScrollLock(open);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setPlaceholder(mq.matches ? PLACEHOLDER_MOBILE : PLACEHOLDER_DESKTOP);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    setQ("");
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const matches = useMemo(() => {
    if (!q.trim()) return [];
    const needle = q.toLowerCase();
    return products
      .filter((p) =>
        [p.title, p.serial, p.fabricType, p.category].some((f) => f.toLowerCase().includes(needle)),
      )
      .slice(0, 5);
  }, [q]);

  const suggestions = q.trim()
    ? searchSuggestions.filter((s) => s.toLowerCase().includes(q.toLowerCase()))
    : searchSuggestions;

  const commit = (term: string) => {
    setQ(term);
    addRecent(term);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) addRecent(q);
  };

  return (
    <div
      className={`fixed inset-0 z-[80] transition-opacity duration-400 ${
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`absolute left-0 right-0 top-0 bg-background border-b border-border transition-transform duration-[520ms] ease-editorial will-change-transform ${
          open ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        {/* Mobile top bar with dedicated close */}
        <div className="md:hidden flex items-center justify-between px-4 h-14 border-b border-border/60">
          <span className="label-eyebrow">Search</span>
          <button
            onClick={onClose}
            aria-label="Close search"
            className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] -mr-2 opacity-80 hover:opacity-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="max-w-4xl mx-auto px-4 md:px-6 pt-6 md:pt-24 pb-10 md:pb-14">
          <form onSubmit={handleSubmit} className="flex items-center gap-3 md:gap-4 border-b border-border pb-3 md:pb-4">
            <Search size={20} className="shrink-0 opacity-70" />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={placeholder}
              className="flex-1 min-w-0 bg-transparent font-display text-xl md:text-4xl placeholder:text-muted-foreground placeholder:text-base md:placeholder:text-3xl focus:outline-none truncate"
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ("")}
                aria-label="Clear"
                className="shrink-0 p-1 opacity-70 hover:opacity-100 text-xs label-eyebrow"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close search"
              className="hidden md:inline-flex shrink-0 p-1 opacity-70 hover:opacity-100"
            >
              <X size={20} />
            </button>
          </form>

          <div className="mt-8 md:mt-10 grid gap-8 md:gap-10 md:grid-cols-2">
            <div>
              {recent.length > 0 && (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <span className="label-eyebrow">Recent</span>
                    <button
                      onClick={clearRecent}
                      className="label-eyebrow text-muted-foreground hover:!text-foreground"
                    >
                      Clear all
                    </button>
                  </div>
                  <ul className="mb-8 space-y-2">
                    {recent.map((s) => (
                      <li key={s} className="flex items-center justify-between gap-3">
                        <button
                          onClick={() => commit(s)}
                          className="text-sm text-foreground/80 hover:!text-foreground text-left truncate"
                        >
                          {s}
                        </button>
                        <button
                          onClick={() => removeRecent(s)}
                          aria-label={`Remove ${s}`}
                          className="shrink-0 opacity-60 hover:opacity-100"
                        >
                          <X size={14} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <div className="label-eyebrow mb-4">Suggestions</div>
              <ul className="space-y-2">
                {suggestions.map((s) => (
                  <li key={s}>
                    <button
                      onClick={() => commit(s)}
                      className="text-sm text-foreground/80 hover:!text-foreground text-left"
                    >
                      {s}
                    </button>
                  </li>
                ))}
                {suggestions.length === 0 && (
                  <li className="text-sm text-muted-foreground">No suggestions.</li>
                )}
              </ul>

              <div className="label-eyebrow mt-8 md:mt-10 mb-4">Trending</div>
              <div className="flex flex-wrap gap-2">
                {trendingTags.map((t) => (
                  <button
                    key={t}
                    onClick={() => commit(t)}
                    className="label-eyebrow border border-border px-3 py-2 hover:!text-foreground hover:border-foreground transition-colors"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="label-eyebrow mb-4">Pieces</div>
              {matches.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {q ? "No pieces match that cut." : "Start typing to reveal pieces."}
                </p>
              ) : (
                <ul className="space-y-4">
                  {matches.map((p) => (
                    <li key={p.id}>
                      <Link
                        to="/product/$id"
                        params={{ id: p.id }}
                        onClick={() => {
                          addRecent(p.title);
                          onClose();
                        }}
                        className="flex items-center gap-4 group"
                      >
                        <img src={p.images[0]} alt={p.title} className="w-14 h-16 object-cover object-top" />
                        <div className="min-w-0">
                          <div className="label-eyebrow !text-foreground/80">{p.serial}</div>
                          <div className="font-display text-lg group-hover:chrome-text truncate">{p.title}</div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
