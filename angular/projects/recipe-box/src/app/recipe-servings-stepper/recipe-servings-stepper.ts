import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { RecipeSecondaryActionButton } from '../recipe-secondary-action-button/recipe-secondary-action-button';

/**
 * Phase 1B · 1B.4 — Two-way binding via `model()`
 * Parent uses: `[(servings)]="servings"`
 * @see https://angular.dev/guide/templates/two-way-binding
 */
@Component({
  selector: 'rb-servings-stepper',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RecipeSecondaryActionButton],
  template: `
    <div class="stepper">
      <button type="button" rb-action-secondary (pressed)="bump(-1)" [disabled]="servings() <= 1">
        −
      </button>
      <span class="stepper__value" aria-live="polite">{{ servings() }}</span>
      <button type="button" rb-action-secondary (pressed)="bump(1)" [disabled]="servings() >= 12">
        +
      </button>
    </div>
  `,
  styles: `
    .stepper {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }
    .stepper__value {
      min-width: 1.5rem;
      text-align: center;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
    }
  `,
})
export class RecipeServingsStepper {
  /** Writable signal input — enables `[(servings)]` on the host. */
  readonly servings = model(2);

  protected bump(delta: number): void {
    this.servings.update((n) => Math.min(12, Math.max(1, n + delta)));
  }
}
