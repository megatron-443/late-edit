# LATE EDIT — full audit and fix plan

Audited against both uploaded briefs (Client_Brand_info.md, Design.md) by reading the shell, drawers, settings/theme layer, catalogue, PDP, bag and checkout, and by driving the running site headlessly at 390px, 758px and 1280px across all routes.

Verified in the browser: no route exceeds the viewport width at 390 / 758 / 1280 (`scrollWidth == clientWidth`, `visualViewport.scale == 1` on every page); all five overlays are present in the DOM on every page even when closed; the scroll lock puts `position: fixed` on `<body>` while a drawer is open. Everything below marked "observed" comes from those runs or from the code; the zoom issue is marked unconfirmed because it did not reproduce in headless Chromium.

## 1. The zoom-out-on-navigation problem

I could not reproduce it in Chromium at any of the three widths, so the diagnosis is not yet confirmed. Two suspects, both real defects regardless, and both consistent with "only on some navigations, mostly on phones":

1. **Overflow is masked, not prevented.** `src/styles.css` ends with `html, body { overflow-x: clip; max-width: 100% }` — a global patch over off-canvas content. Every drawer (menu 85vw at `left-0`, bag/wishlist/account at `translate-x-full`, i.e. a full viewport-width past the right edge) stays mounted on every page. `overflow-x: clip` on the root hides the scrollbar but iOS Safari still sizes the *layout viewport* from the widest box and re-fits to width — which reads exactly as "the page is zoomed out", and it re-evaluates per document/route.
2. **Scroll lock leaves the body in a fixed, height-collapsed state.** Observed: opening the menu changes the document height from 4236px to 844px. Navigating from inside a drawer unmounts the panel and can skip the unlock cleanup's scroll restore; combined with router `scrollRestoration` this produces a snap/reflow on arrival at the new page.

Plan: instrument first (log `visualViewport.scale`, `documentElement.clientWidth` and layout width on every route change), then fix the cause rather than the symptom — unmount closed overlays, render them in a single portal container that is `display:none` when idle, drive the lock through one shared owner so it cannot double-lock or fail to restore, and only then remove the global `overflow-x: clip` crutch and re-verify each route.

Related to the same root: five permanently mounted `fixed inset-0` overlays, each with `will-change: transform` and `backdrop-blur`, mean five always-live GPU layers on every page — pure cost on phones.

## 2. Theme switching (choppy on mobile)

The toggle runs the palette swap inside `document.startViewTransition`. On a phone that snapshots the entire 4000px+ document — hero photography, backdrop-blurred overlays, five composited layers — twice, then cross-fades the two bitmaps. That is why it stutters on mobile and looks fine on desktop; mobile Chrome supports View Transitions, so phones take the *most* expensive path.

Fix: keep the cross-fade only where it is cheap (pointer-fine, wide viewports); on touch/narrow viewports do an instant palette swap under a lightweight full-screen colour veil (one compositor-only opacity animation, ~180ms), suppress `backdrop-filter` for the duration, and honour reduced-motion as it does today. Removing the always-mounted overlays (section 1) also cuts the snapshot cost directly.

## 3. Settings, currency and locale (India + international)

- Currency and language resolve only after hydration, so first paint always shows the INR/EN default and then flips — visible on every cold load. Move the resolved currency into the same inline bootstrap script that already prevents the theme flash, and share one storage-key constant.
- Footer "Shipping to" reads `language.includes("India")` against two-letter codes, so it renders "EN" instead of a country (`site-footer.tsx:45`). Split shipping country from interface language and show a real country.
- Three currency formatters exist (`formatPrice`, `formatAmount`, `money`) across two files — consolidate to one.
- India specifics are good (HSN, GST-inclusive, pincode estimator, DDP line) but shipping promises contradict each other: `about.tsx` says 3–5 working days, the PDP says 2–5 business days, `logistics.ts` says 2–3 metro / 3–5 non-metro. One source of truth in `logistics.ts`.
- The region selector sets `document.body.style.overflow` directly instead of the shared lock — same class of bug as section 1.

## 4. Commerce logic

- **One-of-one is contradicted by the UI**: the PDP offers S/M/L on a 1-of-1 piece, Add to Bag works with no size chosen, and the cart is keyed by `(id, size)` so the same unique garment can sit in the bag twice. Enforce one unit per product id in `cart-context.tsx`, require a size, and present size as *the* size of the piece.
- No stock re-validation at Confirm — a reserved or sold-out piece can be confirmed.
- Orphaned cart lines are dropped from `detailed` but still counted, so the bag can show a count with no items.
- Checkout step and delivery form are local state only: a refresh mid-checkout loses everything while the bag persists.
- Validation is loose (email regex accepts `a@b.c..`, pincode is `length >= 4` while the PDP estimator already has a stricter 6-digit rule).
- "Held for 20 minutes" is copy with no timer behind it — add the countdown or drop the claim.
- Wishlist has no route and no "move to bag" — saved pieces are a dead end.

## 5. Catalogue, filters, PDP

- Only 7 pieces exist. A luxury grid needs enough depth that filters mean something; the "View 0 pieces" footer state is reachable today with no warning.
- The filter modal does not lock background scroll on mobile (observed: the page scrolled behind it).
- "Newest" sort is cosmetic — `Product` has no date field. Add `releasedAt`.
- Price bands are hardcoded EUR ranges displayed in the active currency, so the printed cutoffs drift from the real ones.
- No per-option counts, no `aria-live` on the result count.
- PDP has no canonical, no `Product`/`Offer` JSON-LD, no per-product `og:image` — every share preview uses the homepage image.

## 6. Art direction and content (the biggest luxury gap)

- The homepage hero is a saturated teal stock photo — it fights the "Atelier Off-White / Chrome Noir" palette and reads as stock, not campaign.
- The lead PDP image has a visible **ZARA BASIC** label in-frame; another is a suburban denim snapshot and another a generic suit portrait. For a brand whose whole claim is one-of-one reconstruction, borrowed stock with a competitor's label showing is the single most damaging detail on the site. Re-curate to a coherent dark-atelier set (still dynamic URLs via `mockData.ts`, per the brief).
- `/maison` renders "Everything you ownhas already lived." — missing space at the line break.
- The hero header block is duplicated across seven route files with drifted padding (`/shop` is tighter than its siblings) — extract one `PageHeader`.
- `/collections` description and og:description disagree; an empty collection renders a blank grid.

## 7. Accessibility, structure, SEO

- Desktop and mobile expose different utilities (desktop: wishlist + account + bag, no search; mobile: search + bag only). Reconcile per the brief's nav spec.
- Five overlays with no focus trap, no focus return, and no `role="dialog"`/`aria-modal`; Escape handling is copy-pasted in five files and two overlays can be open at once. One shared `useOverlay` hook plus a single `activeOverlay` state in the header.
- Menu drawer: all five Women sub-items link to `/women` and all five Men items to `/men`; all four Client Services links point to `/services` with no anchor. Either make them URL-driven filters or stop presenting them as distinct.
- `robots.txt` and `sitemap.xml` both 404. No canonical tags anywhere; the legal 404 does not set `noindex`.
- Images lack `width`/`height`, `decoding` and the `onError` fallback outside `product-card.tsx` — layout shift on slow Indian mobile connections.

## Suggested order of work

1. Viewport/overlay rebuild (section 1) + scroll-lock ownership — this is the fatal one, and it unblocks 2.
2. Theme transition rework for touch devices (section 2).
3. Currency/locale first-paint + one source of truth for shipping copy (section 3).
4. One-of-one commerce integrity: size required, one unit per piece, confirm-time re-validation, wishlist route (section 4).
5. Art direction pass — hero, the ZARA-labelled PDP shot, and the weakest catalogue images (section 6).
6. Filters, accessibility pass, SEO/canonical/JSON-LD, shared `PageHeader` (sections 5 and 7).

Everything above is frontend-only; no backend work is implied.
