# ZENOS Hobby Store

Storefront + admin dashboard demo for a premium anime-figure / model-kit shop, built with **Next.js 16 (App Router)**, **TypeScript**, and **Tailwind CSS v4**. All data is mock — there is no backend/database; everything renders from static data in `src/lib/data/` plus a thin client-side layer (localStorage) for interactive demos (auth, favorites, admin catalog edits).

## Tech stack

- **Next.js 16** — App Router, Server Components by default, Turbopack
- **TypeScript** — strict types shared between storefront and admin
- **Tailwind CSS v4** — theme tokens (colors, spacing, type scale) defined in `src/app/globals.css` via `@theme`, matching the "Zenith Collector" design system (gallery-style, high-contrast accents, 8px spacing grid)
- **Google Material Symbols** — the only icon set used (loaded as a font, not custom/AI-drawn SVGs)
- No backend, no database, no real authentication or payments — this is a UI/UX prototype

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other scripts:

```bash
npm run build   # production build
npm run start   # run the production build
npm run lint    # ESLint
```

## Project structure

```
src/
  app/
    (store)/              # customer-facing storefront (shares Header/Footer via layout)
      page.tsx             # Home — hero, featured products, universe sections
      products/            # catalog (?q= search) + products/[slug] detail (SSG)
      checkout/            # cart summary, shipping/payment form (mock)
      wishlist/            # favorited products (client, localStorage-backed)
    admin/                 # admin dashboard (shares Sidebar/Topbar via layout)
      page.tsx              # overview
      products/             # product list + /new upload form
      orders/                # order list + /[id] detail (SSG)
      categories/            # category tree management
      customers/             # loyalty/customer management
      promotions/            # pricing & discount codes
      finance/                # revenue/transactions
    sitemap.ts / robots.ts  # SEO: auto-generated sitemap.xml / robots.txt
    layout.tsx              # root layout: fonts, global metadata, providers
  components/
    ui/                    # Icon, Button, Badge — generic, reusable across store + admin
    store/                 # storefront-only components (ProductCard, SiteHeader, EmptyState, Breadcrumbs...)
    admin/                 # admin-only components (ImageDropzone, OrdersTable, StatCard, TabGroup, AdminPageHeader...)
    providers/             # client Context providers (auth, favorites, admin catalog, order status)
  lib/
    data/                  # all mock/seed data (products, orders, customers, ...)
    types.ts                # shared TypeScript types
    format.ts                # formatVnd() currency formatter
```

> Working on this repo? See **[CONTRIBUTING.md](CONTRIBUTING.md)** for the architecture rationale, when-to-extract-a-component rules, the provider pattern, and the full pre-ship checklist.

## Features

### Storefront
- Home page with hero, featured products grid, and per-franchise sections, scroll-reveal animations
- Product catalog (`/products`) with a **functional** filter form (category, brand, scale, price range, stock status, badge) and text search (`/products?q=...`) — plain `<form method="get">`, so every filter combination is a real, shareable, crawlable URL
- Product detail page with image gallery (square aspect ratio), reviews, related products, a **"Sản phẩm bạn đã xem" (recently viewed)** row backed by `localStorage`, a **stock-notify form** on sold-out items, `Product` + `BreadcrumbList` JSON-LD
- Favorites/wishlist — heart button on every product card, persisted in `localStorage`, dedicated `/wishlist` page
- Cart — "Mua ngay" / "Thêm vào giỏ hàng" on the product detail page add real items to a `localStorage`-backed cart (`CartProvider`), with a dedicated `/cart` review page (quantity stepper, remove, subtotal) before checkout — mirrors the wishlist page's layout for a consistent browse → review → act pattern across both
- Mock Google sign-in — header user menu shows a "Đăng nhập với Google" button that simulates an OAuth round-trip and stores a fake session (no real backend)
- **Full checkout → order confirmation flow**: checkout reads live from the cart, shipping/payment method selection, promo code applied against real `src/lib/data/promotions.ts` codes (try `SUMMER24`, `ZENOS_VIP_20`), submitting builds a mock `Order`, clears the cart, and redirects to `/order-confirmation`
- Policy/info pages linked from the footer: `/chinh-sach-giao-hang`, `/cam-ket-chinh-hang`, `/faq` (with `FAQPage` JSON-LD), `/quyen-rieng-tu`, `/dieu-khoan`, `/lien-he` (mock contact form)
- Branded 404 pages (`(store)/not-found.tsx` keeps the header/footer; root `not-found.tsx` covers everything else)

### Admin dashboard (`/admin`)
- **Product upload** (`/admin/products/new`) — compact, single-viewport form:
  - Image upload via drag-and-drop, clipboard paste (Ctrl+V), or file picker — up to 8 small square tiles, first image becomes the cover
  - Highlights: pick from 6 presets or add a custom one, capped at 4 total
  - Three-tier pricing: **giá gốc** (MSRP), **giá bán** (regular price), **giá khuyến mãi** (promo price) — plus a **giá vốn** (cost) field that is admin-only and never rendered on customer-facing pages
  - Category picker references the taxonomy managed on `/admin/categories` (see below) — no inline folder/category creation cluttering the form
  - New products are stored client-side (`localStorage`) via `AdminCatalogProvider` and immediately show up in the product list; drafts aren't statically generated on the storefront, so their "view on store" link is disabled
- **Orders** (`/admin/orders`) — spreadsheet-style table with status tabs, and a detail page per order with a **working status editor** (`OrderStatusProvider`, persisted to `localStorage`, overrides reflected instantly in both the list and detail view)
- **Categories** (`/admin/categories`) — two tabs: **Danh mục** (category tree, parent/child grouping, quick-edit panel) and **Thư mục** (folders; a category can belong to several folders at once, e.g. "Pokemon" under both "Anime" and "Thẻ bài"). Both are created here, not in the product form.
- **Customers** — loyalty tiers, stats, member table
- **Promotions** — campaign banner, coupon generator, discount table
- **Finance** — compact spreadsheet-style stat cards, CSS bar chart, transaction table

### System-wide conventions
- Every `input[type=number]` has its native spin buttons stripped (see the "Input rule" comment block in `globals.css`) — all number fields render as plain, unstyled-by-the-browser inputs across storefront and admin.

## Design system

Tokens live in `src/app/globals.css` under `@theme`, mirroring the Figma design spec:

| Token group | Examples |
|---|---|
| Colors | `primary` (#0041C8 electric blue), `tertiary` (#A40007 red — sale/urgent), `surface-container-*` |
| Spacing (8px grid) | `xs`(4) `base`(8) `sm`(12) `md`(24) `gutter`(24) `lg`(48) `xl`(80) `margin-mobile`(16) `margin-desktop`(64) |
| Typography | `display-lg`, `headline-md/sm`, `body-lg/md`, `label-md/sm` (Montserrat for display/headline, Inter for body/label) |
| Radius | default 4px, `lg` 8px, `xl` 12px, `full` pill |

> ⚠️ Gotcha: because Tailwind v4 resolves `max-w-*` / `w-*` / etc. against the same `--spacing-*` namespace, custom spacing keys named `xs`/`sm`/`md`/`lg`/`xl` will shadow Tailwind's built-in container-width scale. Use bracket values (`max-w-[36rem]`) or numeric spacing (`max-w-144`) instead of `max-w-xl`/`max-w-sm`/etc. anywhere in this codebase.

## Mock data & persistence model

Everything under `src/lib/data/*.ts` is static seed data (no fetch, no DB). A few features layer client-side state on top, all scoped with a `zenos.*` `localStorage` key prefix so it's easy to find in DevTools:

| Provider | Key(s) | What it stores |
|---|---|---|
| `AuthProvider` | `zenos.auth-user` | Fake logged-in user (from the mock Google login) |
| `FavoritesProvider` | `zenos.favorites` | Wishlist product IDs |
| `CartProvider` | `zenos.cart` | Cart line items (product ID + quantity) |
| `RecentlyViewedProvider` | `zenos.recently-viewed` | Last 8 product slugs viewed |
| `AdminCatalogProvider` (admin only) | `zenos.admin-folders`, `zenos.admin-categories`, `zenos.admin-products` | Folders/categories/products created from the admin UI |
| `OrderStatusProvider` (admin only) | `zenos.order-status-overrides` | Per-order status overrides set from the order detail page |
| Checkout → confirmation | `zenos.last-order` | The most recently placed mock order, read by `/order-confirmation` |

To reset all demo state, clear `localStorage` for the site (or run `localStorage.clear()` in DevTools).

## SEO

- Per-page `generateMetadata`/`metadata` with canonical URLs, Open Graph, and Twitter card data
- `Product` + `BreadcrumbList` JSON-LD on product pages, `Store` JSON-LD on the homepage
- `sitemap.ts` — auto-generates `/sitemap.xml` for the homepage, catalog, every product, and every policy page
- `robots.ts` — auto-generates `/robots.txt`, disallowing `/admin`, `/checkout`, `/cart`, `/wishlist`, `/order-confirmation`
- Semantic HTML throughout (single `<h1>` per page, `<nav>`/`<main>`/`<aside>` landmarks, labeled form inputs, `aria-label`s on icon-only buttons)
- `/checkout`, `/cart`, `/wishlist`, `/order-confirmation` are marked `noindex` (transactional/personal pages, no SEO value); all `/admin/*` pages are `noindex` via `src/app/admin/layout.tsx`

## Known limitations (by design — this is a mock)

- No backend: nothing here is persisted server-side or shared across browsers/devices
- Google sign-in is fully simulated — no real OAuth, no real session/cookies
- Products created from `/admin/products/new` use `blob:` object URLs for images, which only live in the browser tab that created them, and are not included in the storefront's static generation (`generateStaticParams`), so their "view on store" link is intentionally disabled
- Checkout does not process real payments or persist real orders
