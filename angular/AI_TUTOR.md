# Angular AI Tutor — Smart Recipe Box

> **Note (advanced learners):** Prefer [ADVANCED_PATH.md](./ADVANCED_PATH.md), mapped from [angular.dev/overview](https://angular.dev/overview). This file is the beginner [AI Tutor](https://angular.dev/ai/ai-tutor) track (Modules 1–21). Phase 1 fundamentals below are **optional / skipped** at experience level 8–10.

Guided path based on the official [Angular AI Tutor](https://angular.dev/ai/ai-tutor).
We build a **Smart Recipe Box** inside the Native Federation remote `projects/recipe-box`.

## How to run

```bash
cd angular
npm run start:recipe-box
```

Standalone: http://localhost:4204  

With the shell (also start other remotes as needed):

```bash
npm run start:all
```

Then open http://localhost:4200/recipe-box

## Learning loop (each module)

1. **Learn** — short concept + example
2. **Apply** — you solve the exercise in `recipe-box`
3. **Check** — tell me when you're done (or ask for a **hint** / **detailed guide**)

**Your level:** Advanced (8–10) — use [ADVANCED_PATH.md](./ADVANCED_PATH.md).

## Curriculum progress

### Phase 1: Angular Fundamentals

| Module | Topic | Status |
|--------|--------|--------|
| 1 | Getting Started | **skipped (advanced)** |
| 2 | Dynamic Text with Interpolation | **skipped (advanced)** |
| 3 | Event Listeners (`(click)`) | **skipped (advanced)** |

### Phase 2: State and Signals

| Module | Topic | Status |
|--------|--------|--------|
| 4 | Writable Signals — `set` | pending |
| 5 | Writable Signals — `update` | pending |
| 6 | Computed Signals | pending |

### Phase 3: Component Architecture

| Module | Topic | Status |
|--------|--------|--------|
| 7 | Template Binding (Properties & Attributes) | pending |
| 8 | Creating & Nesting Components | pending |
| 9 | Component Inputs with Signals | pending |
| 10 | Styling Components | pending |
| 11 | List Rendering with `@for` | pending |
| 12 | Conditional Rendering with `@if` | pending |

### Phase 4: Advanced Features & Architecture

| Module | Topic | Status |
|--------|--------|--------|
| 13 | Two-Way Binding | pending |
| 14 | Services & Dependency Injection | pending |
| 15 | Basic Routing | pending |
| 16 | Introduction to Forms | pending |
| 17 | Intro to Angular Material | pending |

### Phase 5: Signal Forms

| Module | Topic | Status |
|--------|--------|--------|
| 18 | Introduction to Signal Forms | pending |
| 19 | Submitting & Resetting | pending |
| 20 | Validation in Signal Forms | pending |
| 21 | Field State & Error Messages | pending |

## Key files

- `projects/recipe-box/src/app/recipe-box-home.ts` — main UI for early modules
- `projects/recipe-box/src/app/remote-routes.ts` — routes exposed to the shell
- `projects/recipe-box/federation.config.mjs` — NF remote config (port **4204**)
