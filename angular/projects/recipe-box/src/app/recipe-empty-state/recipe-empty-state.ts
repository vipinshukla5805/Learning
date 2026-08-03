import { booleanAttribute, ChangeDetectionStrategy, Component, input, ViewEncapsulation } from '@angular/core';

/**
 * Phase 1 · 1A.6 / 1A.12 — Host bindings + OnPush
 */
@Component({
  selector: 'rb-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    role: 'status',
    '[attr.aria-label]': 'title()',
    '[class.rb-empty--compact]': 'compact()',
  },
  template: `
    <div class="empty">
      <p class="title">{{ title() }}</p>
      @if (hint()) {
        <p class="hint">{{ hint() }}</p>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      margin-bottom: 1.25rem;
    }

    .empty {
      padding: 1rem 1.1rem;
      border: 1px dashed color-mix(in srgb, var(--rb-accent) 35%, transparent);
      border-radius: var(--rb-radius);
      background: color-mix(in srgb, var(--rb-surface) 70%, white);
    }

    :host.rb-empty--compact .empty {
      padding: 0.65rem 0.85rem;
    }

    .title {
      margin: 0 0 0.35rem;
      font-size: 1.05rem;
      font-weight: 650;
      color: var(--rb-ink);
    }

    .hint {
      margin: 0;
      font-size: 0.92rem;
      color: var(--rb-muted);
    }
  `,
})
export class RecipeEmptyState {
  readonly title = input.required<string>();
  readonly hint = input<string>();
  readonly compact = input(false, { transform: booleanAttribute });
}
