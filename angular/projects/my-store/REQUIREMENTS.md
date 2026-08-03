# My Store — Functional Requirements (1-Day Interview Practice)

Build a small **e-commerce remote** in `projects/my-store` that loads real product data, manages cart state, and covers Angular interview essentials.

| | |
|--|--|
| **Shell URL** | http://localhost:4200/my-store |
| **Standalone** | http://localhost:4205 |
| **API** | [DummyJSON Products](https://dummyjson.com/docs/products) |
| **State** | NgRx `signalStore` |
| **Async** | `HttpClient` + RxJS |

**Run**

```bash
cd angular
npm i @ngrx/signals          # once
npx ng serve my-store        # :4205
npx ng serve shell           # :4200
```

---

## Product vision

A shopper can **browse** DummyJSON products, **search/filter**, open a **product detail**, **add items to a cart**, review the cart, and complete a simple **checkout form**. The feature runs as a Native Federation remote inside the Online Store shell.

---

## Project structure (Angular best practices)

Organize by **feature**, keep **data access** separate from **UI**, and keep **federation bootstrap** files at the app root. Prefer standalone components; one main concern per folder.

```text
projects/my-store/
├── federation.config.mjs          # NF exposes ./Routes + shared deps
├── REQUIREMENTS.md
├── public/
└── src/
    ├── index.html
    ├── main.ts                    # initFederation → bootstrap
    ├── bootstrap.ts
    ├── styles.css
    └── app/
        ├── app.ts                 # Root shell for standalone ng serve only
        ├── app.config.ts          # Standalone providers (HttpClient, etc.)
        ├── app.routes.ts          # Local routes when serving alone (optional)
        ├── remote-routes.ts       # ★ Exposed to host as ./Routes
        ├── dev-providers.ts       # Stubs for standalone serve (auth/cart tokens)
        │
        ├── core/                  # App-wide singletons (one instance per remote)
        │   ├── api/
        │   │   ├── product-api.service.ts
        │   │   └── product-api.types.ts     # ProductsResponse, DummyJSON DTOs
        │   └── constants.ts                 # API base URL
        │
        ├── shared/                # Reused across features (no feature imports upward)
        │   ├── models/
        │   │   ├── product.model.ts
        │   │   └── cart-item.model.ts
        │   ├── pipes/
        │   │   └── stock-label.pipe.ts      # optional
        │   └── ui/
        │       └── cart-summary/
        │           ├── cart-summary.ts
        │           └── cart-summary.html    # or inline template
        │
        ├── features/
        │   ├── catalog/                     # Browse + search
        │   │   ├── catalog.routes.ts        # '' + product/:id (or keep flat in remote-routes)
        │   │   ├── data-access/
        │   │   │   └── products.store.ts    # signalStore + rxMethod
        │   │   ├── product-list/
        │   │   │   ├── product-list.ts
        │   │   │   └── product-list.html
        │   │   ├── product-card/
        │   │   │   └── product-card.ts      # input/output only
        │   │   └── product-detail/
        │   │       └── product-detail.ts
        │   │
        │   ├── cart/
        │   │   ├── data-access/
        │   │   │   └── cart.store.ts        # signalStore
        │   │   └── cart-page/
        │   │       └── cart-page.ts
        │   │
        │   └── checkout/
        │       └── checkout-page/
        │           └── checkout-page.ts     # reactive form
        │
        └── layout/                          # Optional chrome inside the remote
            └── store-nav/
                └── store-nav.ts             # Products | Cart badge
```

### Folder rules

| Folder | Put here | Do not put here |
|--------|----------|-----------------|
| `core/` | Http services, base URL, interceptors (if any in this remote) | Feature UI, cart page templates |
| `shared/models` | Interfaces used by 2+ features | Store implementation |
| `shared/ui` | Dumb/presentational widgets | Calls to HttpClient |
| `features/*/data-access` | `signalStore`, feature facades | Presentational cards |
| `features/*/` pages | Smart components (inject stores) | Unrelated feature code |
| App root | `remote-routes.ts`, bootstrap, `dev-providers` | Business logic |

### Naming conventions

- Components: `product-list.ts` → class `ProductList` (or `ProductListComponent`)
- Stores: `products.store.ts`, `cart.store.ts`
- Services: `product-api.service.ts`
- Routes file exposed to shell: `remote-routes.ts` exporting `MY_STORE_ROUTES`
- Prefer **co-located** template/styles next to the component (inline or `.html` / `.css`)

### Dependency direction (important)

```text
remote-routes / pages
        ↓
   feature stores
        ↓
   core API services
        ↓
     HttpClient

shared/ui  ←  features may import
features must NOT import each other’s pages (only shared models/ui or public store if intentional)
```

### Minimal start (if you scaffold fast today)

Create at least:

```text
app/
  core/api/product-api.service.ts
  shared/models/product.model.ts
  shared/models/cart-item.model.ts
  features/catalog/data-access/products.store.ts
  features/catalog/product-list/product-list.ts
  features/catalog/product-card/product-card.ts
  features/catalog/product-detail/product-detail.ts
  features/cart/data-access/cart.store.ts
  features/cart/cart-page/cart-page.ts
  features/checkout/checkout-page/checkout-page.ts
  remote-routes.ts
```

Wire routes in `remote-routes.ts` → expose `./Routes` in `federation.config.mjs` (already set).

---

## Progress checklist

- [ ] T1 — Product catalog from API
- [ ] T2 — Resilient data layer (RxJS)
- [ ] T3 — Signal stores (catalog + cart)
- [ ] T4 — Storefront UI components
- [ ] T5 — In-store navigation (routes)
- [ ] T6 — Checkout
- [ ] T7 — Live product search
- [ ] T8 — Stretch (pagination / category / shell cart)
- [ ] T9 — Demo & interview talking points

---

## API (DummyJSON)

| Feature | Request |
|---------|---------|
| Product list | `GET https://dummyjson.com/products?limit=12&skip=0` |
| Product detail | `GET https://dummyjson.com/products/:id` |
| Search | `GET https://dummyjson.com/products/search?q=phone` |
| By category | `GET https://dummyjson.com/products/category/:slug` |
| Category names | `GET https://dummyjson.com/products/category-list` |

List/search/category responses include `{ products, total, skip, limit }`.

**App product model** (map from API; don’t scatter raw fields in every template):

```ts
interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand?: string;
  thumbnail: string;
}
```

Treat `stock > 0` as in stock.

---

## T1 — Product catalog from API

**User value:** Shopper sees real products from the network, not fake hard-coded UI strings.

**Functional description**
1. As a shopper, I open My Store and see a grid/list of products (title, price, thumbnail, category).
2. Data comes from DummyJSON `GET /products` with a sensible page size (e.g. `limit=12`).
3. While the request is in flight, I see a loading state.
4. If the request fails, I see an error message and can retry (button is enough).

**Technical focus:** `HttpClient`, typed responses, inject a `ProductApiService`.

**Done when:** Network tab shows DummyJSON; products render under `/my-store`.

---

## T2 — Resilient data layer (RxJS)

**User value:** The store fails gracefully and doesn’t refetch static data endlessly.

**Functional description**
1. API failures do not crash the remote; the shopper sees a friendly error (or empty catalog with message).
2. Category list (if used) is fetched once and reused while the session is active.
3. Service methods return Observables; UI/store consumes them — no hidden subscriptions inside the API service for rendering.

**Technical focus:** `pipe`, `map`, `catchError`, `shareReplay`, optional `retry`.

**Done when:** Forced error (e.g. bad URL once) is handled; categories aren’t re-hit on every navigation.

---

## T3 — Signal stores (catalog + cart)

**User value:** Catalog and cart state stay consistent across pages; totals update immediately when the cart changes.

### Catalog store

**Functional description**
1. Store holds: product list, `total`, `loading`, `error`, optional selected product, optional filters.
2. Shopper actions trigger store methods: load list, load one product, apply search results.
3. Derived state (e.g. `hasProducts`, `isEmpty`) comes from `computed` / `withComputed`.

### Cart store

**Functional description**
1. Shopper can add a product to the cart.
2. Adding the same product again increases quantity instead of duplicating the line.
3. Shopper can change quantity, remove a line, or clear the cart.
4. UI always shows live **item count** and **subtotal**.
5. Out-of-stock products cannot be added (`stock === 0`).

**Technical focus:** `@ngrx/signals` `signalStore`, `withState`, `withComputed`, `withMethods`, prefer `rxMethod` (`@ngrx/signals/rxjs-interop`) to bridge API Observables → store state.

**Done when:** Add/remove/qty updates count and subtotal without page reload.

---

## T4 — Storefront UI components

**User value:** Clear product cards and a visible cart summary; reusable pieces.

**Functional description**
1. **Product card** shows thumbnail, title, price (currency), stock hint; primary action “Add to cart”.
2. Card does not own global cart logic — it emits an event; a parent/smart page calls the cart store.
3. **Cart summary** shows item count and subtotal (header or sidebar).
4. Empty catalog after filter/search shows an empty state (“No products found”).
5. Loading and error UIs use `@if`; list uses `@for` with `track` by `id`.

**Technical focus:** `input()` / `output()`, presentational vs smart components, control flow, `currency` pipe.

**Done when:** List is composed of cards; summary reflects the cart store.

---

## T5 — In-store navigation

**User value:** Shopper can move between browse, detail, cart, and checkout with shareable URLs.

**Functional description**

| Route (under `/my-store`) | Behavior |
|---------------------------|----------|
| `''` | Product catalog |
| `product/:id` | Product detail (description, price, stock, add to cart). Unknown id → not-found message |
| `cart` | Line items, qty controls, remove, link to checkout |
| `checkout` | Checkout form (T6) |

1. Nav links: **Products** | **Cart** (badge = item count).
2. From a card, shopper can open detail.
3. Browser back/forward works.

**Technical focus:** Child routes in exposed `./Routes` (`remote-route.ts`), `routerLink`, route params.

**Done when:** `/my-store/product/1` and `/my-store/cart` work inside the shell.

---

## T6 — Checkout

**User value:** Shopper can place a mock order only with valid contact/shipping info.

**Functional description**
1. Checkout form fields: full name, email, address.
2. Validation: name required (min 3 chars), email required + valid format, address required.
3. Invalid fields show messages after the shopper touches them (or on submit).
4. Submit stays disabled while the form is invalid.
5. If the cart is empty, shopper sees a message (or is sent back to the catalog) — no empty checkout.
6. On successful submit: show confirmation (alert/message is fine), **clear the cart**, navigate to catalog.

**Technical focus:** Reactive forms (`FormBuilder` / `FormGroup`), validators.

**Done when:** Invalid submit blocked; valid submit clears cart.

---

## T7 — Live product search

**User value:** Shopper types a query and the catalog updates to matching DummyJSON products without laggy/stale results.

**Functional description**
1. Search box on the catalog page.
2. Typing triggers search after a short pause (~300ms), not on every keystroke flood.
3. Empty query restores the default product list.
4. Fast typing cancels the previous in-flight search so an older response cannot overwrite a newer query.
5. Loading indicator while search is running.

**API:** `GET /products/search?q=...` when query is non-empty; otherwise `GET /products`.

**Technical focus:** RxJS `debounceTime`, `distinctUntilChanged`, `switchMap`, `catchError` — ideally as `rxMethod` on the products store.

**Done when:** Network tab shows cancelled/superseded searches; UI matches the latest query.

---

## T8 — Stretch features (pick what time allows)

### 8A — Category browsing
- Shopper sees category chips from `category-list`.
- Selecting one loads `GET /products/category/:slug`.
- Clearing category returns to the default list.

### 8B — Pagination
- Shopper can go next/previous using `limit` + `skip`.
- UI shows range vs `total` (e.g. “1–12 of 194”).

### 8C — Shared shell cart
- Adds from My Store update the **shell header** cart count via `@store/cart-api` `CART_STORE`.
- `sharedMappings` + `dev-providers` so standalone serve still works.

---

## T9 — Demo & interview script (end of day)

Walk through:

1. Catalog loads from DummyJSON.
2. Search “phone” — debounce + `switchMap`.
3. Open a product detail by URL.
4. Add items — `signalStore` computeds update.
5. Cart page — change qty / remove.
6. Checkout validation + clear cart.
7. Explain: remote `./Routes`, `signalStore` + `rxMethod`, why `switchMap` for typeahead.

---

## Suggested schedule

| Time | Focus |
|------|--------|
| 0:00–0:15 | Install `@ngrx/signals`, HttpClient |
| 0:15–1:00 | T1 Catalog API |
| 1:00–1:40 | T2 RxJS resilience |
| 1:40–3:00 | T3 Signal stores |
| 3:00–3:40 | T4 UI |
| 3:40–4:20 | T5 Routes |
| 4:20–5:00 | T6 Checkout |
| 5:00–5:40 | T7 Search |
| 5:40–6:30 | T8 stretch or polish + T9 |

**If short on time:** finish **T1 → T3 → T5 → T7** (API + signalStore + routes + RxJS search).

---

## Out of scope

- Full NgRx Store (actions/reducers) — use **signalStore only**
- Real payments / auth provider
- SSR / Pixel-perfect design
- Persisting cart to `localStorage` (optional bonus only)

---

## Acceptance demo

1. Shell → `/my-store` shows DummyJSON products.
2. Search updates the list via `/products/search`.
3. Detail route loads `/products/:id`.
4. Cart count/subtotal track adds and qty changes.
5. Checkout rejects invalid input and clears cart on success.
6. (Optional) Category, pagination, or shell cart badge.
```
