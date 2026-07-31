# Contributing / Architecture guide

This doc is for anyone (human or AI) picking up this codebase after the initial build. It explains **how the project is organized, why it's organized that way, and the conventions to follow when adding to it** — so the code stays easy to navigate as more people touch it.

For feature list, tech stack, and setup, see [README.md](README.md). This file is about *how to work in the repo*, not what it does.

## Mental model

There is no backend. "Data" is one of two things:

1. **Static seed data** — plain arrays/objects in `src/lib/data/*.ts`, imported directly into Server Components. This is the source of truth for everything that ships in the initial page load (products, orders, customers, promotions...).
2. **Client-side mock state** — a React Context provider that hydrates from `localStorage` on mount and persists on every change (see [Providers](#providers-mock-client-state) below). This is only used for things a real backend would own: auth session, favorites, admin edits, order status overrides.

When adding a feature, decide which bucket it belongs to *first*. If it never needs to change at runtime, it's seed data. If a user action needs to mutate it and survive a refresh, it's a provider.

## Folder map

```
src/
  app/
    (store)/        # storefront routes — route group so they share one layout (header+footer) without adding "/store" to the URL
    admin/           # admin routes — separate layout (sidebar+topbar), all noindex
    sitemap.ts       # SEO file conventions — update when you add/remove a public route
    robots.ts
    layout.tsx       # root layout: fonts, <html>, global providers
  components/
    ui/              # generic, app-agnostic primitives — Icon, Button, Badge. No business logic, no data imports.
    store/            # storefront-specific components. Can import from ui/ and lib/, never from admin/.
    admin/             # admin-specific components. Can import from ui/ and lib/, never from store/.
    providers/          # client Context providers (the "mock backend" layer)
  lib/
    data/              # static seed data — one file per entity
    types.ts            # shared TypeScript types, used by both data/ and components
    format.ts            # small pure formatting helpers (formatVnd, ...)
```

**Rule of thumb for where a component goes**: if you'd ever plausibly use it on both a storefront page and an admin page, it goes in `ui/`. If it's tied to storefront layout/copy/data shape, it's `store/`. If it's tied to the admin dashboard, it's `admin/`. `store/` and `admin/` should never import from each other — that's a sign something belongs in `ui/` instead.

## When to extract a shared component

Don't extract on the first duplication — two similar-looking blocks in different contexts are often fine left inline. Extract when you notice **the same visual pattern repeated 3+ times** with only prop-level differences (icon, label, color), or when a fix/tweak would otherwise need to be copy-pasted to multiple files.

Existing examples of this pattern, all in `components/admin/` or `components/store/`:

| Component | Replaces | Variants |
|---|---|---|
| `StatCard` | Ad-hoc "icon + label + value" cards on Orders/Customers/Promotions/Finance | `filled`, `compact`, default |
| `TabGroup<K>` | Repeated pill/tab switchers (order status filters, category tabs, etc.) | `sm`, `md` sizes, generic over the tab-key union type |
| `StatusDot` | Colored status dots with a label (order status, customer status) | `tone` prop (`success`/`warning`/`danger`/`neutral`/...) |
| `EmptyState` | "Nothing here yet" blocks (wishlist, product filters, 404) | `size`, `tone` |
| `Breadcrumbs` | Nav breadcrumb trails on policy pages and product detail | — |
| `AdminPageHeader` | Title + description + optional action button, top of every admin page | — |
| `CartLineItem` | One product row (image, qty stepper, remove, line total) — shared by `/cart` and the checkout order summary so the two never drift apart | `sm`, `md` |

When a page's header/empty-state/etc. diverges structurally from these (e.g. the root `not-found.tsx`'s big-numeral treatment, or the Promotions/Finance hero sections that mix stats into a custom layout), it's fine to leave it bespoke rather than forcing it into the shared component. Don't add props to a shared component to support one page's edge case if that page's shape is genuinely different — just don't use the shared component there.

## Providers (mock client state)

Every provider in `src/components/providers/` follows the same shape:

```tsx
const [state, setState] = useState<T>(initialValue);

useEffect(() => {
  const stored = localStorage.getItem(KEY);
  if (stored) setState(JSON.parse(stored));
  // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage, see favorites-provider for rationale
}, []);

useEffect(() => {
  localStorage.setItem(KEY, JSON.stringify(state));
}, [state]);
```

All `localStorage` keys are prefixed `zenos.` (see the table in the README) so they're easy to spot in DevTools and won't collide with anything else. If you add a new provider, follow this exact hydrate-then-persist shape and add it to `app-providers.tsx` and to the README's persistence table.

Wrap the new provider around only the part of the tree that needs it if it's admin-only or store-only (see how `OrderStatusProvider` and `AdminCatalogProvider` are scoped) — don't add every provider to the global root if only one route tree uses it.

## Adding a new storefront page

1. Create the route under `src/app/(store)/your-route/page.tsx` — it automatically inherits the shared header/footer from the route group's layout.
2. Add `metadata` (or `generateMetadata` for dynamic routes) — title, description, canonical.
3. If the page should be publicly indexable, add it to `src/app/sitemap.ts`. If it's transactional/personal (like checkout), add it to the `disallow` list in `src/app/robots.ts` and set `robots: { index: false }` in its metadata.
4. Reuse `EmptyState`, `Breadcrumbs`, `Button`, `Icon` etc. from `ui/`/`store/` before writing new markup.

## Adding a new admin page

1. Create the route under `src/app/admin/your-route/page.tsx`. The sidebar + topbar shell lives once in `src/app/admin/layout.tsx` — a page just returns its own content (start with `<AdminPageHeader title=... description=... action={...} />`), it does **not** wrap itself in any shell component. This is what makes the shell persist across admin navigation instead of remounting on every page (the Next.js layout is the "outlet": only `{children}` swaps on navigation).
2. Add the route's link to `NAV_ITEMS` in `src/components/admin/admin-sidebar.tsx` if it should appear in the sidebar. Active-state highlighting is automatic — `AdminSidebar` reads the current route via `usePathname()`, so no `active` prop to pass anywhere.
3. Admin pages are all `noindex` automatically via `src/app/admin/layout.tsx` — no per-page SEO work needed.
4. If the page needs mutable state beyond what's on the page (i.e. other pages need to see the change), that's a new provider, not local `useState` — see [Providers](#providers-mock-client-state).

## Conventions checklist

- **Inputs**: every `input[type=number]` must render without native browser spin buttons, and `input[type=search]` without the native clear button — this is enforced globally by the "Input rule" block in `src/app/globals.css`. Don't add per-component overrides; if a new input type needs the same treatment, extend that global rule instead.
- **Tailwind spacing gotcha**: this project's `@theme` in `globals.css` defines custom spacing tokens named `xs`/`sm`/`md`/`lg`/`xl`. Tailwind v4 resolves `max-w-*`/`w-*`/`min-w-*` against that *same* `--spacing-*` namespace, so `max-w-md`, `max-w-xl`, etc. silently resolve to the wrong (tiny) value instead of Tailwind's built-in container scale. **Always use numeric spacing (`max-w-144`, `max-w-112`, `max-w-96`) or a bracket value (`max-w-[36rem]`) instead.** Before submitting a change, sanity-check with:
  ```bash
  grep -rn "max-w-\(xs\|sm\|md\|lg\|xl\)\b" src/ --include="*.tsx" | grep -v "max-w-\["
  ```
  Any hit is a bug.
- **Icons**: Material Symbols only, via the `Icon` component (`src/components/ui/icon.tsx`). Never hand-draw or generate custom SVG icons.
- **No `window.confirm`/`window.alert`**: they render as an ugly native browser dialog that doesn't match the app's UI (and can't be styled, tested, or localized consistently). Use `useConfirm()` from `src/components/ui/confirm-dialog.tsx` instead — it's promise-based (`const ok = await confirm({ title, description, tone: "danger" })`) so call sites read almost the same as the old `if (!window.confirm(...)) return;`. For one-off notifications (success/error after an action), use `useToast()` from `src/components/ui/toast.tsx` rather than `window.alert` or an inline banner. Both are mounted once in `app-providers.tsx` and available anywhere in the tree. Before submitting a change:
  ```bash
  grep -rn "window\.\(confirm\|alert\)" src/
  ```
  Any hit outside `confirm-dialog.tsx`'s own doc comment is a bug.
- **Currency**: always format VND with `formatVnd()` from `src/lib/format.ts`, never inline `.toLocaleString()`.
- **Draft/local-only data**: anything created client-side in the admin (e.g. a new product via `AdminCatalogProvider`) isn't part of `generateStaticParams`, so its storefront link won't resolve. Disable/hide "view on store" for such items rather than linking to a 404 (see `AdminProductsTable`'s `isDraft` handling).

## Verification before shipping a change

```bash
npx tsc --noEmit     # type-check
npx eslint .          # lint
rm -rf .next && npx next build   # full production build — catches SSG/route errors tsc/eslint miss
```

Run all three. A change that passes `tsc` and `eslint` can still fail `next build` (e.g. a `generateStaticParams` mismatch), so don't skip the build step.
