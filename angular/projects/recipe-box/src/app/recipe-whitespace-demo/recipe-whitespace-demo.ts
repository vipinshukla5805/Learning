import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Phase 1B · 1B.13 — Whitespace
 * Default: Angular collapses significant whitespace in templates.
 * `preserveWhitespaces: true` keeps author spacing (rare; prefer CSS).
 * @see https://angular.dev/guide/templates/whitespace
 */
@Component({
  selector: 'rb-whitespace-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  preserveWhitespaces: true,
  template: `
    <p class="ws">
      preserved   spaces   between   words
    </p>
  `,
  styles: `
    .ws {
      margin: 0;
      font-size: 0.82rem;
      color: var(--rb-muted);
      white-space: pre-wrap;
    }
  `,
})
export class RecipeWhitespaceDemo {}
