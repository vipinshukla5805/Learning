import { ChangeDetectionStrategy, Component, inject, Injector, runInInjectionContext, signal } from '@angular/core';
import { ConsoleRecipeLogger } from '../di/console-recipe-logger';
import { PantryCatalogService } from '../di/pantry.services';
import { RECIPE_API_BASE, RecipeLogger } from '../di/tokens';
import { RecipeBoxStore } from '../recipe-box.store';

/** Phase 3 — DI lab (compact). */
@Component({
  selector: 'rb-di-lab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="lab">
      <p class="lab__title">DI lab (Phase 3)</p>
      <p class="lab__line">API base token: <code>{{ apiBase }}</code></p>
      <p class="lab__line">Staples: {{ staples.join(', ') }}</p>
      <p class="lab__line">
        Store recipes (hierarchical): <strong>{{ store.recipeCount() }}</strong>
      </p>
      <button type="button" class="chip" (click)="ping()">Log via inject() + runInInjectionContext</button>
      <p class="lab__meta">{{ note() }}</p>
      <p class="lab__meta">Logger snapshot: {{ logs().join(' · ') || '—' }}</p>
    </section>
  `,
  styles: `
    .lab {
      padding: 0.85rem 1rem;
      border: 1px solid color-mix(in srgb, var(--rb-accent) 22%, transparent);
      border-radius: calc(var(--rb-radius) + 0.1rem);
      background: color-mix(in srgb, #f4efe6 70%, white);
    }
    .lab__title {
      margin: 0 0 0.4rem;
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--rb-muted);
    }
    .lab__line {
      margin: 0 0 0.3rem;
      font-size: 0.9rem;
    }
    .lab__meta {
      margin: 0.35rem 0 0;
      font-size: 0.78rem;
      color: var(--rb-muted);
    }
    .chip {
      margin-top: 0.35rem;
      border: 1px solid color-mix(in srgb, var(--rb-accent) 30%, transparent);
      background: #fff;
      border-radius: var(--rb-radius);
      padding: 0.3rem 0.55rem;
      font: inherit;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
    }
    code {
      font-size: 0.84em;
    }
  `,
})
export class RecipeDiLab {
  private readonly injector = inject(Injector);
  private readonly logger = inject(RecipeLogger);
  private readonly consoleLogger = inject(ConsoleRecipeLogger);
  protected readonly store = inject(RecipeBoxStore);
  protected readonly apiBase = inject(RECIPE_API_BASE);
  protected readonly staples = inject(PantryCatalogService).listStaples();

  protected readonly note = signal('Ready.');
  protected readonly logs = signal<string[]>([]);

  protected ping(): void {
    // 3.4 — inject() only works in an injection context; bridge with runInInjectionContext
    runInInjectionContext(this.injector, () => {
      const log = inject(RecipeLogger);
      log.info(`ping @ ${inject(RECIPE_API_BASE)}`);
    });
    this.note.set('Logged (see console). Hierarchical store still shared with home.');
    this.logs.set(this.consoleLogger.snapshot());
  }
}
