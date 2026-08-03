# Online Store — Native Federation Workspace

Angular **22** multi-app monorepo demonstrating enterprise Module Federation (Native Federation) with shared service contracts.

## Architecture

| App / Lib | Port | Role |
|-----------|------|------|
| `shell` | 4200 | Dynamic host — layout, auth, cart store ownership |
| `catalog` | 4201 | Remote — product surface |
| `cart` | 4202 | Remote — cart UI |
| `checkout` | 4203 | Remote — checkout |
| `@store/auth` | — | Auth session contract + token |
| `@store/cart-api` | — | Cart port + token |
| `@store/data-access` | — | `API_BASE_URL` token |
| `@store/ui` | — | Shared chrome primitives |

## Run locally

Start remotes first (or all together):

```bash
npm run start:all
```

Or individually:

```bash
npm run start:catalog
npm run start:cart
npm run start:checkout
npm run start:shell
```

Open http://localhost:4200 — navigate Catalog → Cart → Checkout.

## Project structure

Folder-by-folder map of apps, remotes, shared libs, and ownership:

→ **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)**

## Learning track

See [LEARNING.md](./LEARNING.md) for the Module Federation + enterprise services curriculum.
