# Service ownership notes

## Ownership matrix

| Concern | Owner | Token | Notes |
|---------|--------|-------|-------|
| Auth | shell | `AUTH_SESSION` | Remotes inject; never own session |
| Cart | shell | `CART_STORE` | Single writable store |
| Products | catalog | (private) | Do not put product HTTP in shared libs |
| API URL | shell | `API_BASE_URL` | Env-specific later |
| HttpClient | shell | — | One `provideHttpClient()` when hosted |

## Shared vs private

- **Share:** contracts, tokens, tiny presentational UI, pure utils
- **Do not share:** feature containers, NgRx feature stores, domain HTTP services

## Local remotes

Each remote’s `dev-providers.ts` exists only so `ng serve <remote>` works alone.
When loaded through the shell, shell providers win (component DI walks up to the host injector).
