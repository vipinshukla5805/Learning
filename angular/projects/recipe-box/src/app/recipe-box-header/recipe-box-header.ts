import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Phase 1 · 1A.12 — OnPush on presentational header
 */
@Component({
  selector: 'rb-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="rb-header">
      <div class="rb-header__text">
        <h1>{{ title() }}</h1>
        @if (tagline()) {
          <p class="rb-header__tagline">{{ tagline() }}</p>
        }
      </div>
      <div class="rb-header__actions">
        <ng-content select="[rbHeaderActions]" />
      </div>
    </header>
  `,
  styles: `
    :host {
      display: block;
    }

    .rb-header {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    h1 {
      margin: 0 0 0.35rem;
      font-size: 1.85rem;
      font-weight: 650;
      letter-spacing: -0.02em;
      color: var(--rb-ink);
    }

    .rb-header__tagline {
      margin: 0;
      color: var(--rb-muted);
      font-size: 1rem;
      line-height: 1.45;
    }

    .rb-header__actions {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }
  `,
})
export class RecipeBoxHeader {
  readonly title = input.required<string>();
  readonly tagline = input<string>();
}
