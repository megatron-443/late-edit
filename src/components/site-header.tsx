import { Link } from "@tanstack/react-router";
import { useEffect } from "react";

import { Search, ShoppingBag, Menu, Heart, User } from "lucide-react";
import { CartDrawer } from "./cart-drawer";
import { MenuDrawer } from "./menu-drawer";
import { SearchOverlay } from "./search-overlay";
import { WishlistDrawer } from "./wishlist-drawer";
import { AccountDrawer } from "./account-drawer";
import { useWishlist } from "@/lib/wishlist-context";
import { useCart } from "@/lib/cart-context";
import { useOverlay } from "@/lib/overlay-context";
import { LogoLE } from "@/components/logo-le";

export function SiteHeader() {
  const { isOpen, open, close } = useOverlay();
  const { count } = useWishlist();
  const { count: bagCount } = useCart();

  useEffect(() => {
    const openMenu = () => open("menu");
    window.addEventListener("late-edit:open-menu", openMenu);
    return () => window.removeEventListener("late-edit:open-menu", openMenu);
  }, [open]);

  const touch = "inline-flex items-center justify-center min-w-[44px] min-h-[44px] hover:opacity-70 transition-opacity";

  const bagBadge = bagCount > 0 && (
    <span className="absolute top-1.5 right-1.5 min-w-[1rem] h-4 px-1 inline-flex items-center justify-center bg-foreground text-background price-num text-[0.55rem] leading-none">
      {bagCount}
    </span>
  );

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border/60"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        {/* DESKTOP — hamburger left; search / wishlist / account / bag right */}
        <div className="hidden md:grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-10 h-16">
          <div className="flex items-center min-w-0">
            <button
              onClick={() => open("menu")}
              aria-label="Open menu"
              aria-expanded={isOpen("menu")}
              className={touch}
            >
              <Menu size={18} strokeWidth={1.5} />
            </button>
          </div>

          <div className="flex justify-center min-w-0">
            <Link
              to="/"
              aria-label="LATE EDIT — Home"
              className="inline-flex items-center gap-3 text-foreground"
            >
              <LogoLE size={26} title="LATE EDIT monogram" />
              <span className="font-display whitespace-nowrap text-xl tracking-[0.38em] uppercase">
                L A T E&nbsp; E D I T
              </span>
            </Link>
          </div>

          <div className="flex items-center justify-end gap-1 min-w-0">
            <button
              onClick={() => open("search")}
              aria-label="Search"
              aria-expanded={isOpen("search")}
              className={touch}
            >
              <Search size={18} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => open("wishlist")}
              aria-label={`Wishlist${count > 0 ? ` (${count} items)` : ""}`}
              aria-expanded={isOpen("wishlist")}
              className={`${touch} relative`}
            >
              <Heart size={18} strokeWidth={1.5} />
              {count > 0 && (
                <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-foreground" aria-hidden />
              )}
            </button>
            <button
              onClick={() => open("account")}
              aria-label="Account"
              aria-expanded={isOpen("account")}
              className={touch}
            >
              <User size={18} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => open("cart")}
              aria-label={`Atelier Bag${bagCount > 0 ? ` (${bagCount} items)` : ""}`}
              aria-expanded={isOpen("cart")}
              className={`${touch} relative`}
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              {bagBadge}
            </button>
          </div>
        </div>

        {/* MOBILE — same core utilities; wishlist & account live one tap deep in the menu */}
        <div className="md:hidden grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 h-14">
          <div className="flex items-center justify-start min-w-0">
            <button
              onClick={() => open("menu")}
              aria-label="Open menu"
              aria-expanded={isOpen("menu")}
              className={touch}
            >
              <Menu size={20} strokeWidth={1.5} />
            </button>
          </div>
          <div className="flex justify-center min-w-0">
            <Link
              to="/"
              aria-label="LATE EDIT — Home"
              className="inline-flex items-center gap-2 text-foreground"
            >
              <LogoLE size={18} weight={4} title="LATE EDIT monogram" />
              <span className="font-display whitespace-nowrap text-[0.82rem] tracking-[0.28em] uppercase">
                LATE&nbsp;EDIT
              </span>
            </Link>
          </div>
          <div className="flex items-center justify-end min-w-0">
            <button
              onClick={() => open("search")}
              aria-label="Search"
              aria-expanded={isOpen("search")}
              className={touch}
            >
              <Search size={18} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => open("cart")}
              aria-label={`Atelier Bag${bagCount > 0 ? ` (${bagCount} items)` : ""}`}
              aria-expanded={isOpen("cart")}
              className={`${touch} relative`}
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              {bagBadge}
            </button>
          </div>
        </div>
      </header>

      <MenuDrawer
        open={isOpen("menu")}
        onClose={close}
        onOpenWishlist={() => open("wishlist")}
        onOpenAccount={() => open("account")}
      />
      <SearchOverlay open={isOpen("search")} onClose={close} />
      <WishlistDrawer open={isOpen("wishlist")} onClose={close} />
      <AccountDrawer open={isOpen("account")} onClose={close} />
      <CartDrawer open={isOpen("cart")} onClose={close} />
    </>
  );
}
