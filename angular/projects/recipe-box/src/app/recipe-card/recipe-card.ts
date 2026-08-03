import { TitleCasePipe } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  numberAttribute,
  OnChanges,
  OnInit,
  output,
  signal,
  SimpleChanges,
  afterNextRender,
} from '@angular/core';
import { CookMinutesPipe } from '../pipes/cook-minutes.pipe';
import { KebabCasePipe } from '../pipes/kebab-case.pipe';
import { toKebabCase } from '../pipes/to-kebab-case';
import { RbFocusRingDirective } from '../directives/rb-focus-ring.directive';

function trimLabel(value: string | undefined): string {
  return value?.trim() ?? '';
}

/**
 * Phase 1 · 1A.9 — Lifecycle hooks
 * @see https://angular.dev/guide/components/lifecycle
 *
 * Prefer: ngOnInit / ngOnChanges / DestroyRef / afterNextRender
 * Avoid: ngDoCheck, ngAfterViewChecked, ngAfterContentChecked (hot paths)
 */
@Component({
  selector: 'rb-recipe-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TitleCasePipe, CookMinutesPipe, KebabCasePipe],
  hostDirectives: [
    {
      directive: RbFocusRingDirective,
      inputs: ['rbFocusRing: focusRing'],
    },
  ],
  host: {
    role: 'listitem',
    '[class.rb-recipe-card--featured]': 'featured()',
    '[class.rb-recipe-card--active]': 'active()',
    '[attr.aria-label]': 'ariaLabel()',
    '[attr.data-slug]': 'slug()',
    '[style.--rb-card-ring]': 'featured() ? "var(--rb-accent)" : "transparent"',
    '(keydown.enter)': 'onSelect()',
    '(keydown.space)': 'onSpace($event)',
    tabindex: '0',
  },
  template: `
    <article class="card">
      <div class="card__main">
        <h2>{{ name() | titlecase }}</h2>
        @if (summary()) {
          <p>{{ summary() }}</p>
        }
        <p class="meta">{{ minutes() | cookMinutes }} · <code>{{ name() | kebabCase }}</code></p>
        <p class="life" aria-hidden="true">{{ lifeNote() }}</p>
      </div>
      <div class="card__actions">
        <button type="button" class="linkish" (click)="onSelect(); $event.stopPropagation()">
          Select
        </button>
        <button
          type="button"
          class="linkish linkish--danger"
          (click)="onRemove(); $event.stopPropagation()"
        >
          Remove
        </button>
      </div>
    </article>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
      outline: none;
    }

    :host:focus-visible .card {
      box-shadow: 0 0 0 2px var(--rb-surface), 0 0 0 4px var(--rb-accent);
    }

    :host.rb-recipe-card--active .card {
      background: color-mix(in srgb, var(--rb-accent) 6%, white);
    }

    .card {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 0.9rem 1rem;
      border: 1px solid color-mix(in srgb, var(--rb-accent) 18%, transparent);
      border-radius: var(--rb-radius);
      background: #fff;
      box-shadow: 0 0 0 1px var(--rb-card-ring);
    }

    :host.rb-recipe-card--featured .card {
      border-color: var(--rb-accent);
    }

    .card__main {
      flex: 1 1 12rem;
      min-width: 0;
    }

    h2 {
      margin: 0 0 0.35rem;
      font-size: 1.1rem;
      font-weight: 650;
    }

    p {
      margin: 0 0 0.5rem;
      color: var(--rb-muted);
      font-size: 0.92rem;
    }

    .meta {
      margin: 0 0 0.35rem;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--rb-ink);
    }

    .life {
      margin: 0;
      font-size: 0.75rem;
      font-family: ui-monospace, monospace;
      color: color-mix(in srgb, var(--rb-muted) 80%, var(--rb-accent));
    }

    .card__actions {
      display: flex;
      gap: 0.5rem;
    }

    .linkish {
      padding: 0.25rem 0.45rem;
      border: 0;
      background: transparent;
      color: var(--rb-accent);
      font: inherit;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      text-decoration: underline;
    }

    .linkish--danger {
      color: #8b2e2e;
    }
  `,
})
export class RecipeCard implements OnInit, OnChanges {
  private readonly destroyRef = inject(DestroyRef);

  readonly name = input.required<string>();
  readonly summary = input('', { transform: trimLabel });
  readonly minutes = input(0, { transform: numberAttribute });
  readonly featured = input(false, { transform: booleanAttribute });

  readonly selected = output<string>();
  readonly removed = output<string>();

  protected readonly active = signal(false);
  protected readonly lifeNote = signal('constructor…');

  protected readonly slug = computed(() => toKebabCase(this.name()));

  protected readonly ariaLabel = computed(() => {
    const m = this.minutes();
    const time = m > 0 ? `${m} min` : 'Time TBD';
    return `${this.name()}, ${time}`;
  });

  constructor() {
    // Cleanup without a big ngOnDestroy method — keeps setup next to teardown
    this.destroyRef.onDestroy(() => {
      // e.g. clear timers, abort fetches, unsubscribe
      console.debug(`[rb-recipe-card] destroy: ${this.name()}`);
    });

    // Runs once after the next full DOM render (not SSR)
    afterNextRender(() => {
      this.lifeNote.update((n) => `${n} → afterNextRender`);
    });
  }

  /** First input change runs before ngOnInit. */
  ngOnChanges(changes: SimpleChanges<RecipeCard>): void {
    if (changes['name']) {
      const c = changes['name'];
      this.lifeNote.set(
        `ngOnChanges(name): ${String(c.previousValue)} → ${String(c.currentValue)}` +
          (c.firstChange ? ' (first)' : ''),
      );
    }
  }

  /** Runs once after inputs are set — safe place for init based on inputs. */
  ngOnInit(): void {
    this.lifeNote.update((n) => `${n} → ngOnInit`);
  }

  protected onSelect(): void {
    this.active.set(true);
    this.selected.emit(this.name());
  }

  protected onSpace(event: Event): void {
    event.preventDefault();
    this.onSelect();
  }

  protected onRemove(): void {
    this.active.set(false);
    this.removed.emit(this.name());
  }
}
