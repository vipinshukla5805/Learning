# Project Structure

Online Store monorepo — Angular 22 + Native Federation (host + remotes + shared contract libs).

```
angular/
├── angular.json                 # Workspace: shell, remotes, shared libs
├── package.json                 # Scripts: start:all, start:shell, …
├── tsconfig.json                # Path aliases (@store/*)
├── .npmrc                       # legacy-peer-deps (NF peer range)
├── federation (per app)         # See projects/*/federation.config.mjs
├── LEARNING.md                  # Advanced MF + services curriculum
├── AI_TUTOR.md                  # Smart Recipe Box (AI Tutor path)
├── notes/                       # Your learning notes
│   └── service-ownership.md
└── projects/
    ├── shell/                   # HOST — port 4200
    ├── catalog/                 # REMOTE — port 4201
    ├── cart/                    # REMOTE — port 4202
    ├── checkout/                # REMOTE — port 4203
    ├── recipe-box/              # REMOTE — port 4204 (AI Tutor)
    ├── shared-auth/             # Lib → @store/auth
    ├── shared-cart/             # Lib → @store/cart-api
    ├── shared-data-access/      # Lib → @store/data-access
    └── shared-ui/               # Lib → @store/ui
```

---

## Applications

### `projects/shell` — Host (dynamic-host)

| Path | Purpose |
|------|---------|
| `federation.config.mjs` | Shared deps + `sharedMappings` for `@store/*` |
| `public/federation.manifest.json` | Runtime remote URLs (`catalog`/`cart`/`checkout`) |
| `src/main.ts` | `initFederation(manifest)` then bootstrap |
| `src/bootstrap.ts` | Boots Angular with federation result in DI |
| `src/app/app.ts` / `app.html` | Shell chrome (nav, auth, cart badge) |
| `src/app/app.routes.ts` | Host routes → `loadRemoteModule(…, './Routes')` |
| `src/app/app.config.ts` | Provides `AUTH_SESSION`, `CART_STORE`, `API_BASE_URL`, `HttpClient` |
| `src/app/home/` | Landing page inside the shell |
| `src/app/core/shell-auth.session.ts` | Auth implementation (shell-owned) |
| `src/app/core/shell-cart.store.ts` | Cart store implementation (shell-owned) |
| `src/app/core/federation.token.ts` | `FEDERATION` InjectionToken |

**Owns:** layout, route orchestration, auth session, cart store, HTTP setup.

---

### `projects/catalog` — Remote

| Path | Purpose |
|------|---------|
| `federation.config.mjs` | Exposes `./Routes` |
| `src/app/remote-routes.ts` | `CATALOG_ROUTES` loaded by the shell |
| `src/app/catalog-home.ts` | Stub catalog UI (writes to `CART_STORE`) |
| `src/app/dev-providers.ts` | Local stubs for standalone `ng serve` |
| `src/app/app.config.ts` | Standalone-only providers |

**Owns (later):** product API / catalog domain services (private to this remote).

---

### `projects/cart` — Remote

| Path | Purpose |
|------|---------|
| `federation.config.mjs` | Exposes `./Routes` |
| `src/app/remote-routes.ts` | `CART_ROUTES` |
| `src/app/cart-home.ts` | Cart UI over shared `CART_STORE` |
| `src/app/dev-providers.ts` | Standalone stubs |

**Does not own cart state** — injects shell-provided `CART_STORE`.

---

### `projects/checkout` — Remote

| Path | Purpose |
|------|---------|
| `federation.config.mjs` | Exposes `./Routes` |
| `src/app/remote-routes.ts` | `CHECKOUT_ROUTES` |
| `src/app/checkout-home.ts` | Checkout stub (`AUTH_SESSION` + `CART_STORE`) |
| `src/app/dev-providers.ts` | Standalone stubs |

**Depends on:** shell auth + cart contracts.

---

### `projects/recipe-box` — Remote (AI Tutor)

| Path | Purpose |
|------|---------|
| `federation.config.mjs` | Exposes `./Routes` |
| `src/app/remote-routes.ts` | `RECIPE_BOX_ROUTES` |
| `src/app/recipe-box-home.ts` | Smart Recipe Box UI (modules 1+) |

**Curriculum:** [AI_TUTOR.md](./AI_TUTOR.md) — Angular fundamentals → signals → forms.

---

## Shared libraries

Path aliases are defined in root `tsconfig.json` and listed in every app’s `sharedMappings` so token identity stays shared across remotes.

| Folder | Import alias | Contents |
|--------|--------------|----------|
| `shared-auth` | `@store/auth` | `AuthSession` interface, `AUTH_SESSION` token |
| `shared-cart` | `@store/cart-api` | `CartStore` / `CartLine`, `CART_STORE` token |
| `shared-data-access` | `@store/data-access` | `API_BASE_URL` token |
| `shared-ui` | `@store/ui` | Presentational UI (e.g. `PageHeader`) |

Each lib follows:

```
projects/shared-*/src/
├── public-api.ts          # Barrel exports
└── lib/                   # Contracts / components only
```

**Rule:** shared libs hold contracts and tiny UI — not feature HTTP or “god” services.

---

## Config & tooling (root)

| File | Role |
|------|------|
| `angular.json` | Projects, NF builders, ports (`serve-original`) |
| `tsconfig.json` | `@store/*` paths, project references |
| `package.json` | `start:all`, per-app `start:*`, `build:all` |
| `.npmrc` | `legacy-peer-deps=true` (NF ↔ Angular 22.1 peer) |
| `LEARNING.md` | Curriculum after setup |
| `notes/` | Ownership matrix and personal notes |

---

## Runtime topology

```
Browser
   │
   ▼
shell :4200
   ├── provides AUTH_SESSION, CART_STORE, API_BASE_URL
   └── lazy-loads remotes via federation.manifest.json
         ├── catalog     :4201  → ./Routes
         ├── cart        :4202  → ./Routes
         ├── checkout    :4203  → ./Routes
         └── recipe-box  :4204  → ./Routes
```

---

## Scripts cheat sheet

```bash
npm run start:all          # shell + all remotes
npm run start:shell        # :4200
npm run start:catalog      # :4201
npm run start:cart         # :4202
npm run start:checkout     # :4203
npm run start:recipe-box   # :4204
npm run build:all          # libs then remotes then shell
```

See also: [README.md](./README.md) · [LEARNING.md](./LEARNING.md) · [AI_TUTOR.md](./AI_TUTOR.md) · [notes/service-ownership.md](./notes/service-ownership.md)
