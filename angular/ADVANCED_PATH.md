# Angular Learning Plan — from [angular.dev/overview](https://angular.dev/overview)

**Level:** Advanced (8–10)  
**Rule:** Every overview pillar expands to its **In-depth Guide sidebar** (all nested pages). We implement topic-by-topic in this monorepo.

**Where we implement:** exclusively in **`projects/recipe-box`** (Smart Recipe Box remote).  
Shell/catalog/cart stay as NF reference; we do not add feature work there for this track.  
`@store/*` only if a phase needs a shared contract.

**Learning loop:** concept (docs) → implement in `recipe-box` → you confirm → next topic id.

**Status legend:** `pending` · `in progress` · `done` · `skip`

---

## Map: Overview → Phases

| [Overview](https://angular.dev/overview) pillar | Phase | Official guide root |
|-------------------------------------------------|-------|---------------------|
| Components | **1** | [Components](https://angular.dev/guide/components) + [Templates](https://angular.dev/guide/templates) + [Directives](https://angular.dev/guide/directives) |
| Angular Signals | **2** | [Signals](https://angular.dev/guide/signals) |
| Dependency injection | **3** | [DI](https://angular.dev/guide/di) |
| Angular Routing | **4** | [Routing](https://angular.dev/guide/routing) |
| Forms | **5** | [Forms](https://angular.dev/guide/forms) (+ Signal Forms) |
| *(needed for real apps)* HTTP | **6** | [HTTP Client](https://angular.dev/guide/http) |
| Server-side rendering | **7** | [SSR](https://angular.dev/guide/ssr) · [Hydration](https://angular.dev/guide/hydration) |
| CLI · DevTools · ng update · Language Service | **8** | [CLI](https://angular.dev/tools/cli) + tools |
| i18n · Security · Vite/esbuild · Performance | **9** | [i18n](https://angular.dev/guide/i18n) · [Security](https://angular.dev/best-practices/security) · [Performance](https://angular.dev/best-practices/performance) |
| *(quality)* Testing | **10** | [Testing](https://angular.dev/guide/testing) |
| Ecosystem (Material, Aria, Animations, images) | **11** | Material / Aria / Animations / image optimization |
| *(this repo)* Native Federation | **12** | [LEARNING.md](./LEARNING.md) |

**Recommended order:** `12.0 (done) → 1 → 2 → 3 → 4 → 6 → 5 → 12.x (store features) → 9 → 7 → 8 → 10 → 11`

---

## Phase 1 — Components · Templates · Directives

### 1A — Components — [guide/components](https://angular.dev/guide/components)

| # | Topic | Docs | Status |
|---|--------|------|--------|
| 1A.1 | Anatomy of a component | [/guide/components](https://angular.dev/guide/components) | **done** |
| 1A.2 | Selectors | [/selectors](https://angular.dev/guide/components/selectors) | **done** |
| 1A.3 | Styles / style encapsulation | [/styling](https://angular.dev/guide/components/styling) | **done** |
| 1A.4 | Inputs (`input()`, required, transforms) | [/inputs](https://angular.dev/guide/components/inputs) | **done** |
| 1A.5 | Outputs (`output()`) | [/outputs](https://angular.dev/guide/components/outputs) | **done** |
| 1A.6 | Host elements (`host: {}`) | [/host-elements](https://angular.dev/guide/components/host-elements) | **done** |
| 1A.7 | Content projection | [/content-projection](https://angular.dev/guide/components/content-projection) | **done** |
| 1A.8 | Queries (signal `viewChild` / `contentChild`) | [/queries](https://angular.dev/guide/components/queries) | **done** |
| 1A.9 | Lifecycle | [/lifecycle](https://angular.dev/guide/components/lifecycle) | **done** |
| 1A.10 | Inheritance | [/inheritance](https://angular.dev/guide/components/inheritance) | **done** |
| 1A.11 | Programmatic rendering | [/programmatic-rendering](https://angular.dev/guide/components/programmatic-rendering) | **done** |
| 1A.12 | Advanced configuration | [/advanced-configuration](https://angular.dev/guide/components/advanced-configuration) | **done** |
| 1A.13 | DOM APIs | [/dom-apis](https://angular.dev/guide/components/dom-apis) | **done** |

**Apply:** catalog product card · `@store/ui` · recipe-box layout.

### 1B — Templates — [guide/templates](https://angular.dev/guide/templates)

| # | Topic | Docs | Status |
|---|--------|------|--------|
| 1B.1 | Template syntax overview | [/templates](https://angular.dev/guide/templates) | **done** |
| 1B.2 | Binding (text, properties, attributes) | [/binding](https://angular.dev/guide/templates/binding) | **done** |
| 1B.3 | Event listeners | [/event-listeners](https://angular.dev/guide/templates/event-listeners) | **done** |
| 1B.4 | Two-way binding | [/two-way-binding](https://angular.dev/guide/templates/two-way-binding) | **done** |
| 1B.5 | Control flow `@if` `@for` `@switch` | [/control-flow](https://angular.dev/guide/templates/control-flow) | **done** |
| 1B.6 | Pipes | [/pipes](https://angular.dev/guide/templates/pipes) | **done** |
| 1B.7 | `ng-content` | [/ng-content](https://angular.dev/guide/templates/ng-content) | **done** |
| 1B.8 | `ng-template` | [/ng-template](https://angular.dev/guide/templates/ng-template) | **done** |
| 1B.9 | `ng-container` | [/ng-container](https://angular.dev/guide/templates/ng-container) | **done** |
| 1B.10 | Template variables | [/variables](https://angular.dev/guide/templates/variables) | **done** |
| 1B.11 | `@defer` | [/defer](https://angular.dev/guide/templates/defer) | **done** |
| 1B.12 | Expression syntax | [/expression-syntax](https://angular.dev/guide/templates/expression-syntax) | **done** |
| 1B.13 | Whitespace | [/whitespace](https://angular.dev/guide/templates/whitespace) | **done** |

### 1C — Directives — [guide/directives](https://angular.dev/guide/directives)

| # | Topic | Docs | Status |
|---|--------|------|--------|
| 1C.1 | Directives overview | [/directives](https://angular.dev/guide/directives) | **done** |
| 1C.2 | Attribute directives | [/attribute-directives](https://angular.dev/guide/directives/attribute-directives) | **done** |
| 1C.3 | Structural directives | [/structural-directives](https://angular.dev/guide/directives/structural-directives) | **done** |
| 1C.4 | Directive composition API | [/directive-composition-api](https://angular.dev/guide/directives/directive-composition-api) | **done** |

---

## Phase 2 — Signals

Guide: [guide/signals](https://angular.dev/guide/signals)

| # | Topic | Docs | Status |
|---|--------|------|--------|
| 2.1 | Overview: writable `set` / `update` / `asReadonly` | [/signals](https://angular.dev/guide/signals) | **done** |
| 2.2 | Computed (lazy, memoized, dynamic deps) | same | **done** |
| 2.3 | Reactive contexts · `untracked` · async boundary | same | **done** |
| 2.4 | Equality functions · `isSignal` / `isWritableSignal` | same | **done** |
| 2.5 | Signals + OnPush | same + [skipping-subtrees](https://angular.dev/best-practices/skipping-subtrees) | **done** |
| 2.6 | RxJS interop | [rxjs-interop](https://angular.dev/ecosystem/rxjs-interop) | **done** |
| 2.7 | `linkedSignal` | [/linked-signal](https://angular.dev/guide/signals/linked-signal) | **done** |
| 2.8 | `resource` | [/resource](https://angular.dev/guide/signals/resource) | **done** |
| 2.9 | `debounced` *(experimental)* | [/debounced](https://angular.dev/guide/signals/debounced) | **done** |
| 2.10 | `effect` / `afterRenderEffect` | [/effect](https://angular.dev/guide/signals/effect) | **done** |

**Apply:** harden `ShellCartStore` · catalog filters · recipe-box search.

---

## Phase 3 — Dependency Injection

Guide: [guide/di](https://angular.dev/guide/di)

| # | Topic | Docs | Status |
|---|--------|------|--------|
| 3.1 | DI overview · services · `inject()` | [/di](https://angular.dev/guide/di) | **done** |
| 3.2 | Creating and using services | [/creating-and-using-services](https://angular.dev/guide/di/creating-and-using-services) | **done** |
| 3.3 | Defining dependency providers | [/defining-dependency-providers](https://angular.dev/guide/di/defining-dependency-providers) | **done** |
| 3.4 | Injection context | [/dependency-injection-context](https://angular.dev/guide/di/dependency-injection-context) | **done** |
| 3.5 | Hierarchical DI | [/hierarchical-dependency-injection](https://angular.dev/guide/di/hierarchical-dependency-injection) | **done** |
| 3.6 | Lazy-loading services | [/lazy-loading-services](https://angular.dev/guide/di/lazy-loading-services) | **done** |
| 3.7 | DI in action | [/di-in-action](https://angular.dev/guide/di/di-in-action) | **done** |
| 3.8 | Lightweight injection tokens | [/lightweight-injection-tokens](https://angular.dev/guide/di/lightweight-injection-tokens) | **done** |
| 3.9 | Debugging / troubleshooting DI | [/debugging-and-troubleshooting-di](https://angular.dev/guide/di/debugging-and-troubleshooting-di) | **done** |
| 3.10 | **Repo:** sharedMappings + shell providers + remote stubs | [LEARNING.md](./LEARNING.md) | deferred → Phase 12 |

---

## Phase 4 — Routing

Guide: [guide/routing](https://angular.dev/guide/routing)

| # | Topic | Docs | Status |
|---|--------|------|--------|
| 4.1 | Routing overview | [/routing](https://angular.dev/guide/routing) | **done** |
| 4.2 | Define routes | [/define-routes](https://angular.dev/guide/routing/define-routes) | **done** |
| 4.3 | Show routes with outlets | [/show-routes-with-outlets](https://angular.dev/guide/routing/show-routes-with-outlets) | **done** |
| 4.4 | Navigate to routes | [/navigate-to-routes](https://angular.dev/guide/routing/navigate-to-routes) | **done** |
| 4.5 | Read route state | [/read-route-state](https://angular.dev/guide/routing/read-route-state) | **done** |
| 4.6 | Nested / common router tasks | [/common-router-tasks](https://angular.dev/guide/routing/common-router-tasks) | **done** |
| 4.7 | Redirecting routes | [/redirecting-routes](https://angular.dev/guide/routing/redirecting-routes) | **done** |
| 4.8 | Route guards | [/route-guards](https://angular.dev/guide/routing/route-guards) | **done** |
| 4.9 | Data resolvers | [/data-resolvers](https://angular.dev/guide/routing/data-resolvers) | **done** |
| 4.10 | Loading strategies (lazy) | [/loading-strategies](https://angular.dev/guide/routing/loading-strategies) | **done** |
| 4.11 | Rendering strategies | [/rendering-strategies](https://angular.dev/guide/routing/rendering-strategies) | skip (SSR later) |
| 4.12 | Customizing route behavior | [/customizing-route-behavior](https://angular.dev/guide/routing/customizing-route-behavior) | **done** (title) |
| 4.13 | Lifecycle and events | [/lifecycle-and-events](https://angular.dev/guide/routing/lifecycle-and-events) | skim |
| 4.14 | `UrlMatcher` | [/routing-with-urlmatcher](https://angular.dev/guide/routing/routing-with-urlmatcher) | skip |
| 4.15 | Route transition animations | [/route-transition-animations](https://angular.dev/guide/routing/route-transition-animations) | pending |
| 4.16 | Router testing | [/testing](https://angular.dev/guide/routing/testing) | pending |
| 4.17 | Router reference | [/router-reference](https://angular.dev/guide/routing/router-reference) | pending |
| 4.18 | **Repo:** `loadRemoteModule` host routes | shell `app.routes.ts` | **partial** |

---

## Phase 5 — Forms

Guide: [guide/forms](https://angular.dev/guide/forms)

### 5A — Classic forms *(know; prefer Signal Forms for new work)*

| # | Topic | Docs | Status |
|---|--------|------|--------|
| 5A.1 | Forms overview (reactive vs template-driven) | [/forms](https://angular.dev/guide/forms) | pending |
| 5A.2 | Reactive forms | [/reactive-forms](https://angular.dev/guide/forms/reactive-forms) | pending |
| 5A.3 | Typed forms | [/typed-forms](https://angular.dev/guide/forms/typed-forms) | pending |
| 5A.4 | Template-driven forms | [/template-driven-forms](https://angular.dev/guide/forms/template-driven-forms) | pending |
| 5A.5 | Form validation | [/form-validation](https://angular.dev/guide/forms/form-validation) | pending |
| 5A.6 | Dynamic forms | [/dynamic-forms](https://angular.dev/guide/forms/dynamic-forms) | pending |

### 5B — Signal Forms *(primary for advanced)*

| # | Topic | Docs | Status |
|---|--------|------|--------|
| 5B.1 | Overview | [/signals/overview](https://angular.dev/guide/forms/signals/overview) | pending |
| 5B.2 | Models | [/signals/models](https://angular.dev/guide/forms/signals/models) | pending |
| 5B.3 | Model design | [/signals/model-design](https://angular.dev/guide/forms/signals/model-design) | pending |
| 5B.4 | Form logic | [/signals/form-logic](https://angular.dev/guide/forms/signals/form-logic) | pending |
| 5B.5 | Field state management | [/signals/field-state-management](https://angular.dev/guide/forms/signals/field-state-management) | pending |
| 5B.6 | Field metadata | [/signals/field-metadata](https://angular.dev/guide/forms/signals/field-metadata) | pending |
| 5B.7 | Validation | [/signals/validation](https://angular.dev/guide/forms/signals/validation) | pending |
| 5B.8 | Form submission | [/signals/form-submission](https://angular.dev/guide/forms/signals/form-submission) | pending |
| 5B.9 | Async operations | [/signals/async-operations](https://angular.dev/guide/forms/signals/async-operations) | pending |
| 5B.10 | Cross-field logic | [/signals/cross-field-logic](https://angular.dev/guide/forms/signals/cross-field-logic) | pending |
| 5B.11 | Custom controls | [/signals/custom-controls](https://angular.dev/guide/forms/signals/custom-controls) | pending |
| 5B.12 | Schemas | [/signals/schemas](https://angular.dev/guide/forms/signals/schemas) | pending |
| 5B.13 | Dynamic forms with JSON | [/signals/dynamic-forms-with-json](https://angular.dev/guide/forms/signals/dynamic-forms-with-json) | pending |
| 5B.14 | Comparison (vs classic) | [/signals/comparison](https://angular.dev/guide/forms/signals/comparison) | pending |
| 5B.15 | Migration | [/signals/migration](https://angular.dev/guide/forms/signals/migration) | pending |
| 5B.16 | Testing Signal Forms | [/signals/testing](https://angular.dev/guide/forms/signals/testing) | pending |

**Apply:** checkout address · recipe create/edit in `recipe-box`.

---

## Phase 6 — HTTP Client

Guide: [guide/http](https://angular.dev/guide/http)

| # | Topic | Docs | Status |
|---|--------|------|--------|
| 6.1 | HTTP overview | [/http](https://angular.dev/guide/http) | pending |
| 6.2 | Setup | [/setup](https://angular.dev/guide/http/setup) | pending |
| 6.3 | Making requests | [/making-requests](https://angular.dev/guide/http/making-requests) | pending |
| 6.4 | Interceptors | [/interceptors](https://angular.dev/guide/http/interceptors) | pending |
| 6.5 | `httpResource` | [/http-resource](https://angular.dev/guide/http/http-resource) | pending |
| 6.6 | Testing HttpClient | [/testing](https://angular.dev/guide/http/testing) | pending |

**Apply:** catalog `ProductService` · shell interceptors · `API_BASE_URL`.

---

## Phase 7 — SSR · Hydration · Hybrid rendering

| # | Topic | Docs | Status |
|---|--------|------|--------|
| 7.1 | Server-side & hybrid rendering | [/guide/ssr](https://angular.dev/guide/ssr) | pending |
| 7.2 | Hydration | [/guide/hydration](https://angular.dev/guide/hydration) | pending |
| 7.3 | SSR performance notes | [/best-practices/performance/ssr](https://angular.dev/best-practices/performance/ssr) | pending |
| 7.4 | **Design drill:** SSR + Native Federation host | notes | pending |

---

## Phase 8 — Developer tools (Overview “Develop faster”)

### 8A — CLI — [tools/cli](https://angular.dev/tools/cli)

| # | Topic | Docs | Status |
|---|--------|------|--------|
| 8A.1 | CLI overview / local setup | [/tools/cli](https://angular.dev/tools/cli) · [/setup-local](https://angular.dev/tools/cli/setup-local) | pending |
| 8A.2 | `serve` | [/serve](https://angular.dev/tools/cli/serve) | pending |
| 8A.3 | `build` (Vite/esbuild) | [/build](https://angular.dev/tools/cli/build) | pending |
| 8A.4 | Build system migration | [/build-system-migration](https://angular.dev/tools/cli/build-system-migration) | pending |
| 8A.5 | Environments | [/environments](https://angular.dev/tools/cli/environments) | pending |
| 8A.6 | Deployment | [/deployment](https://angular.dev/tools/cli/deployment) | pending |
| 8A.7 | AOT compiler / metadata errors | [/aot-compiler](https://angular.dev/tools/cli/aot-compiler) | pending |
| 8A.8 | Template typecheck | [/template-typecheck](https://angular.dev/tools/cli/template-typecheck) | pending |
| 8A.9 | CLI builders | [/cli-builder](https://angular.dev/tools/cli/cli-builder) | pending |
| 8A.10 | Schematics (use + author + libs) | [/schematics](https://angular.dev/tools/cli/schematics) | pending |
| 8A.11 | End-to-end | [/end-to-end](https://angular.dev/tools/cli/end-to-end) | pending |

### 8B — Other tools

| # | Topic | Docs | Status |
|---|--------|------|--------|
| 8B.1 | DevTools (component + injector + profiler) | [DevTools](https://angular.dev/tools/devtools) | pending |
| 8B.2 | Language Service | [Language Service](https://angular.dev/tools/language-service) | pending |
| 8B.3 | `ng update` / keeping up-to-date | [Keeping up-to-date](https://angular.dev/update) | pending |

---

## Phase 9 — Scale & production quality

### 9A — Internationalization — [guide/i18n](https://angular.dev/guide/i18n)

| # | Topic | Docs | Status |
|---|--------|------|--------|
| 9A.1 | i18n overview | [/i18n](https://angular.dev/guide/i18n) | pending |
| 9A.2 | Add package | [/add-package](https://angular.dev/guide/i18n/add-package) | pending |
| 9A.3 | Locale ID | [/locale-id](https://angular.dev/guide/i18n/locale-id) | pending |
| 9A.4 | Prepare / mark text | [/prepare](https://angular.dev/guide/i18n/prepare) · [/manage-marked-text](https://angular.dev/guide/i18n/manage-marked-text) | pending |
| 9A.5 | Translation files · merge | [/translation-files](https://angular.dev/guide/i18n/translation-files) · [/merge](https://angular.dev/guide/i18n/merge) | pending |
| 9A.6 | Format data for locale | [/format-data-locale](https://angular.dev/guide/i18n/format-data-locale) | pending |
| 9A.7 | Global variants · example · deploy | [/import-global-variants](https://angular.dev/guide/i18n/import-global-variants) · [/example](https://angular.dev/guide/i18n/example) · [/deploy](https://angular.dev/guide/i18n/deploy) | pending |

### 9B — Security — [best-practices/security](https://angular.dev/best-practices/security)

| # | Topic | Status |
|---|--------|--------|
| 9B.1 | XSS sanitization · Trusted Types · CSRF | pending |

### 9C — Performance / Vite·esbuild — [best-practices/performance](https://angular.dev/best-practices/performance)

| # | Topic | Docs | Status |
|---|--------|------|--------|
| 9C.1 | Performance overview | [/performance](https://angular.dev/best-practices/performance) | pending |
| 9C.2 | Runtime performance · zone pollution · slow computations | [/runtime-performance](https://angular.dev/best-practices/runtime-performance) · [/zone-pollution](https://angular.dev/best-practices/zone-pollution) · [/slow-computations](https://angular.dev/best-practices/slow-computations) | pending |
| 9C.3 | Skipping subtrees (OnPush) | [/skipping-subtrees](https://angular.dev/best-practices/skipping-subtrees) | pending |
| 9C.4 | `@defer` performance | [/performance/defer](https://angular.dev/best-practices/performance/defer) | pending |
| 9C.5 | Image optimization (`NgOptimizedImage`) | [/performance/image-optimization](https://angular.dev/best-practices/performance/image-optimization) | pending |
| 9C.6 | Lazy-loaded routes · lazy services | [/lazy-loaded-routes](https://angular.dev/best-practices/performance/lazy-loaded-routes) · [/lazy-loading-services](https://angular.dev/best-practices/performance/lazy-loading-services) | pending |
| 9C.7 | Profiling (Chrome / Angular) | [/profiling-with-chrome-devtools](https://angular.dev/best-practices/profiling-with-chrome-devtools) | pending |
| 9C.8 | Build budgets · federation manifests (dev/prod) | `angular.json` · shell `public/` | pending |

---

## Phase 10 — Testing

Guide: [guide/testing](https://angular.dev/guide/testing)

| # | Topic | Docs | Status |
|---|--------|------|--------|
| 10.1 | Testing overview | [/testing](https://angular.dev/guide/testing) | pending |
| 10.2 | Component basics · scenarios | [/components-basics](https://angular.dev/guide/testing/components-basics) · [/components-scenarios](https://angular.dev/guide/testing/components-scenarios) | pending |
| 10.3 | Services · pipes · attribute directives | [/services](https://angular.dev/guide/testing/services) · [/pipes](https://angular.dev/guide/testing/pipes) · [/attribute-directives](https://angular.dev/guide/testing/attribute-directives) | pending |
| 10.4 | Component harnesses (overview → create → use → envs) | [/component-harnesses-overview](https://angular.dev/guide/testing/component-harnesses-overview) | pending |
| 10.5 | Code coverage · debugging · utility APIs | [/code-coverage](https://angular.dev/guide/testing/code-coverage) · [/debugging](https://angular.dev/guide/testing/debugging) · [/utility-apis](https://angular.dev/guide/testing/utility-apis) | pending |
| 10.6 | Vitest migration · Karma · Zone testing utils | [/migrating-to-vitest](https://angular.dev/guide/testing/migrating-to-vitest) · [/karma](https://angular.dev/guide/testing/karma) · [/zone-js-testing-utilities](https://angular.dev/guide/testing/zone-js-testing-utilities) | pending |

---

## Phase 11 — Ecosystem (Overview partners)

| # | Topic | Docs | Status |
|---|--------|------|--------|
| 11.1 | Angular Aria | [/guide/aria/overview](https://angular.dev/guide/aria/overview) | pending |
| 11.2 | Animations (CSS) | [/guide/animations](https://angular.dev/guide/animations) · [/css](https://angular.dev/guide/animations/css) | pending |
| 11.3 | Drag and drop (CDK) | [Angular CDK](https://material.angular.dev/cdk/categories) | pending |
| 11.4 | Angular Material | [material.angular.dev](https://material.angular.dev) | pending |
| 11.5 | Accessibility best practices | [/best-practices/a11y](https://angular.dev/best-practices/a11y) | pending |

---

## Phase 12 — Enterprise Native Federation (this repo)

| # | Topic | Status |
|---|--------|--------|
| 12.0 | Host + remotes + sharedMappings | **done** |
| 12.1 | Harden cart store + catalog product list | pending |
| 12.2 | Auth guard on checkout | pending |
| 12.3 | HTTP + interceptors + env manifests | pending |
| 12.4 | Shared dependency mismatch drills | pending |

Details: [LEARNING.md](./LEARNING.md) · [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)

---

## Current pointer

| Setting | Value |
|---------|--------|
| Level | Advanced (8–10) |
| Implement in | `projects/recipe-box` |
| Active | **Phase 5 · Forms** — next (then 6 HTTP) |
