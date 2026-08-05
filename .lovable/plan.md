# Full-site audit — findings and fix plan

Audited by driving the running site (desktop 1280 + mobile 390) across all 13 routes and reading the shell, catalogue, product, cart and checkout code. Below is what's broken or unpolished, grouped by section, then a tiered fix plan.

## Findings by section

### Header / global shell
- Desktop and mobile header expose different utilities: desktop has Wishlist + Account + Bag but no Search; mobile has Search + Bag but no Wishlist or Account. Wishlist/Account are only reachable via the drawer on mobile.
- No focus trap, no focus return, and no `role="dialog"` / `aria-modal` on five of seven overlays (menu, search, wishlist, account, cart). Tab escapes behind the open panel.
- Escape-to-close is copy-pasted in five files, and five global keydown listeners stay mounted at once; `site-header.tsx` keeps five independent open flags with no mutual exclusion, so two overlays (and two scroll locks) can be open together.

### Menu drawer
- Escape does not close the menu (verified in the browser: drawer still visible after Escape) even though the handler exists — worth tracing the listener/condition.
- All five Women sub-items link to `/women` and all five Men sub-items link to `/men` (`mockData.ts:277-292`) — the accordions are decorative; no sub-category filtering exists.
- All four Client Services footer links point to `/services` with no anchor, so "Care & Repair" lands at the top of the page.
- Swipe-to-dismiss can leave `dragging` state stuck if `pointerup` is missed.

### Settings
- `currency`/`language` are only resolved from `localStorage`/locale detection after hydration, so there is a first-paint flash of the defaults (INR/EN); `theme` avoids it via the inline script. The inline script duplicates the storage key/shape with no shared constant.
- Footer "Shipping to" label uses dead logic (`site-footer.tsx:45` tests `language.includes("India")` / `" — "` against two-letter codes), so it renders "EN" instead of a country.
- Region selector sets `document.body.style.overflow` directly instead of the shared `useBodyScrollLock`, so it loses the iOS-safe lock and can clobber another drawer's restore.

### Catalogue / filters
- The filter modal does not lock background scroll on mobile (verified: page scrolled 600px while the modal was open).
- "Newest" sort is cosmetic — `Product` has no date field, so it falls back to array order.
- Price bands are hardcoded EUR ranges compared in EUR but labelled with `notation: "compact"` in the display currency, so printed boundaries drift from the real cutoffs.
- No per-option result counts; the footer happily reads "View 0 pieces" with no warning. No `aria-live` on the result count or the empty state.
- Sizes outside the hardcoded `SIZE_GROUPS` are invisible in the filter panel. `activeFilterCount` and the chips array duplicate the same gating logic.

### Product page
- Horizontal overflow: the info column measures 411px at a 390px viewport, so provenance text, the "Size guide" link, the Add-to-Bag row and the payment chips are visually cut off. Cause is the bleed gallery at `product.$id.tsx:130` (`-mx-6 px-6` inside a grid track) widening the grid; the earlier `overflow-x: clip` fix hides the scrollbar but not the clipping.
- Add to Bag works with no size selected, and after adding you can switch size and add again, creating a second line for a one-of-one piece.
- `MAX_QTY = 1` is per `(id, size)`, not per unique piece — both S and M of the same 1-of-1 can sit in the bag.
- Gallery/related/checkout images lack `width`/`height`, `decoding`, and the `onError` fallback that `product-card.tsx` has.
- No `canonical`, no `twitter:card`, and no `Product`/`Offer` JSON-LD despite price and availability already being computed.

### Wishlist
- There is no wishlist route and no "move to bag" action anywhere — saved pieces are a dead end.

### Bag / checkout
- No stock re-validation at confirm: a sold-out or reserved piece can be "confirmed".
- Orphaned cart lines (product removed from data) are dropped from `detailed` but still counted in `count`, so the bag can show a count with an empty item list and no message.
- Step and delivery form are local state only, so a refresh mid-checkout loses everything while the bag persists.
- Validation is loose: email regex accepts `a@b.c..`, phone is length-only, pincode is `length >= 4` and never uses the stricter 6-digit rule the PDP estimator already has.
- "Held for 20 minutes" copy is not backed by any timer.
- Switching country away from India keeps the Indian state pre-filled in the generic Region field.
- Future stepper buttons are focusable no-ops with no `aria-disabled`.

### Editorial pages / content
- `/maison` h1 renders as "Everything you ownhas already lived." — missing space at the line break.
- Shipping times contradict across `about.tsx` (3–5 working days), the PDP (2–5 business days) and `logistics.ts` (2–3 metro / 3–5 non-metro); refund wording differs between `about.tsx` and `/legal/returns`.
- Hero header block is duplicated in seven files with drifted padding (`/shop` is tighter on desktop than its siblings).
- `/collections` `description` and `og:description` disagree; an empty collection renders a blank grid with no message.
- `/maison` desktop has a very large label-to-text gutter and heavy whitespace before the image.

### Site-wide / SEO / assets
- `robots.txt` and `sitemap.xml` both 404.
- No canonical tags and no per-page `og:image` — every share preview uses the homepage image.
- `/legal/$slug` not-found does not set `noindex` (the product 404 does).
- Catalogue photography is mixed-quality stock (suburban denim, generic suit portrait) and reads inconsistently against the luxury art direction.
- Three near-identical currency formatters (`formatPrice`, `formatAmount`, `money`) across two files.

## Fix plan (tiered)

### Tier 1 — demo blockers
1. Fix product-page overflow: move the mobile bleed gallery out of the grid track (or wrap it in a `min-w-0` overflow container) so nothing exceeds the viewport, and verify no element's `right` exceeds the viewport at 390px.
2. Restore background scroll lock in the filter modal via the shared `useBodyScrollLock`, and make Escape actually close the menu drawer.
3. Require a size before Add to Bag; make the bag enforce one physical unit per product (replace it rather than adding a second size line) and surface the change.
4. Re-validate item status at Confirm order; block and explain if any line is sold out or reserved. Handle `count > 0 && detailed.length === 0` with a message and self-heal the stored lines.
5. Fix `/maison` "ownhas", the footer "Shipping to EN" label, and add `robots.txt` + `sitemap.xml`.

### Tier 2 — polish and trust
6. Overlay accessibility pass: shared `useOverlay` hook (Escape + scroll lock + focus trap + focus return), `role="dialog" aria-modal aria-labelledby` on all panels, single `activeOverlay` state in the header so only one can be open.
7. Wishlist: add a "Move to bag" action in the drawer and a real `/wishlist` route.
8. Checkout: persist step + form to `sessionStorage`, tighten email/phone/pincode validation (reuse the logistics pincode rule), clear `state` on country change, `aria-disabled` on future steps, and either back the 20-minute hold with a visible countdown or drop the claim.
9. Filters: add a real `releasedAt` field so "Newest" sorts truthfully, derive price bands from the catalogue in the active currency, add per-option counts, disable the "View 0 pieces" action, and add an `aria-live` result announcement.
10. Reconcile shipping/returns copy to one source in `logistics.ts` and reference it from `about`, PDP and legal.

### Tier 3 — depth
11. SEO: per-route `canonical`, per-page `og:image` (product photo on PDP), `twitter:card`, `noindex` on the legal 404, and `Product`/`Offer` + `Organization`/`LocalBusiness` JSON-LD.
12. Extract shared `PageHeader` and label/value `Row` components; consolidate the three currency formatters into one.
13. Image hygiene: `width`/`height` + `decoding="async"` + shared `onError` fallback on every `<img>`; `eager` only for the first above-fold image per page.
14. Real Women/Men sub-categories (URL-driven filters) so the drawer accordions and footer service anchors lead somewhere distinct.
15. Re-shoot/replace the weakest catalogue images for a coherent dark-atelier art direction.

### Technical notes
- Overflow verification: measure `getBoundingClientRect().right` per element at 390px rather than `scrollWidth`, since `overflow-x: clip` on `html, body` masks the symptom.
- One-of-one enforcement belongs in `cart-context.tsx` keyed by product id, not `(id, size)`.
- Everything stays frontend-only; no backend work is implied by any item above.
