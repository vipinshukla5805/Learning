# Learn Angular Enterprise — Native Federation Online Store

Advanced track. Assumes you already know components, DI, routing, and signals.

**Full advanced map (from [angular.dev/overview](https://angular.dev/overview) → every nested guide topic):** [ADVANCED_PATH.md](./ADVANCED_PATH.md)

Official docs: [angular.dev](https://angular.dev) · NF: [@angular-architects/native-federation](https://www.npmjs.com/package/@angular-architects/native-federation)

## How to run this workspace

```bash
cd angular
npm run start:all
```

Shell: http://localhost:4200 · remotes on 4201–4203.

## Mental model (read first)

| Concept | In this repo |
|---------|----------------|
| **Host / shell** | `projects/shell` — owns chrome, route orchestration, platform providers |
| **Remote** | `catalog` / `cart` / `checkout` — separately built apps exposing `./Routes` |
| **Shared dependency** | Angular + RxJS via `shareAll({ singleton: true })` |
| **Shared mapping** | `@store/*` path aliases listed in `sharedMappings` so tokens stay identity-equal |
| **Contract lib** | Interfaces + `InjectionToken` only — no feature UI, no HTTP calls to domain APIs |

**Rule:** share **contracts + singleton platform services**; never share fat feature services or components across remotes.

## Service ownership matrix

| Concern | Owner | Token / location | Remotes may |
|---------|--------|------------------|-------------|
| Auth session | Shell | `AUTH_SESSION` in `@store/auth` | Inject + read; call login/logout only via facade |
| Cart state | Shell | `CART_STORE` in `@store/cart-api` | Add/remove/update via port; never create a second store |
| Product API | Catalog remote | Private to catalog (next module) | Catalog only |
| `HttpClient` | Shell bootstrap (`provideHttpClient`) | — | Use injected client; do not re-provide in remotes when hosted |
| API base URL | Shell | `API_BASE_URL` in `@store/data-access` | Inject |
| UI chrome | Shared lib | `@store/ui` | Import presentational pieces only |

### Why tokens (not `providedIn: 'root'` classes in remotes)?

Under federation, module identity and injector boundaries matter. An `InjectionToken` in a **shared mapping** plus a **single provider in the shell** guarantees one store instance when remotes load into the host. Remotes get local stub providers only for standalone `ng serve` (`dev-providers.ts`).

## Phase 0 — Project setup (done)

You should be able to:

1. Boot all four apps with `npm run start:all`
2. Navigate shell → Catalog / Cart / Checkout without full page reload
3. Add a demo product in Catalog and see cart count update in the shell header
4. Demo-login and open Checkout

Key files to study:

- `projects/*/federation.config.mjs` — exposes, `shareAll`, `sharedMappings`
- `projects/shell/public/federation.manifest.json` — runtime remote URLs
- `projects/shell/src/main.ts` + `bootstrap.ts` — `initFederation` → DI-friendly `loadRemoteModule`
- `projects/shell/src/app/app.routes.ts` — host lazy routes to remotes
- `projects/shell/src/app/core/*` — shell implementations of contracts

## Phase 1 — Cart store + catalog “Add to cart” (next)

- Expand catalog with a small product list (still remote-private data access)
- Harden `ShellCartStore` (immutability, validation)
- Prove singleton: two remotes reading the same signal graph

## Phase 2 — Auth guard on checkout

- Functional `canActivate` in shell wrapping `/checkout`
- Redirect unauthenticated users; keep guard in shell (edge of the system)

## Phase 3 — HTTP + environments

- Interceptors in shell
- Environment-specific `federation.manifest.json` (dev vs prod remote URLs)

## Phase 4 — Dependency mismatch drills

- Intentionally break a shared version and observe NF strategies
- Practice `skip` lists and singleton/strictVersion trade-offs

## Prompt starters

```
Walk me through why CART_STORE must be a shared mapping + shell provider.
```

```
Add a catalog ProductService private to the catalog remote with mock products.
```

```
Protect /checkout with a shell authGuard using AUTH_SESSION.
```
