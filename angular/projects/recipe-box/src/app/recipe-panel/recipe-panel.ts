import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  contentChildren,
  DestroyRef,
  ElementRef,
  inject,
  Renderer2,
  signal,
} from '@angular/core';
import { ActionButtonBase } from '../action-button.base';
import { RecipeCard } from '../recipe-card/recipe-card';

/**
 * Phase 1 · 1A.13 — Using DOM APIs safely
 * @see https://angular.dev/guide/components/dom-apis
 *
 * Prefer templates/bindings. When you must touch the DOM:
 * - inject ElementRef for the host
 * - read/write geometry in afterNextRender / afterEveryRender (not ngOnInit)
 * - use observers (ResizeObserver, …) + DestroyRef cleanup
 * - Renderer2 when you need encapsulation-aware DOM ops / animation hooks
 * Never set innerHTML by hand (XSS).
 */
@Component({
  selector: 'rb-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-rb-height]': 'hostHeightPx()',
  },
  template: `
    <section class="panel">
      <header class="panel__header">
        <div class="panel__title">
          <ng-content select="[rbPanelTitle]">Untitled section</ng-content>
        </div>
        <div class="panel__actions">
          <ng-content select="[rbPanelActions]" />
        </div>
      </header>
      <div class="panel__body">
        <ng-content />
      </div>
      <footer class="panel__footer">
        @if (cardCount() > 0) {
          <span>{{ cardCount() }} recipe(s) projected</span>
        } @else {
          <span>No recipe cards</span>
        }
        <span class="panel__measure">host ≈ {{ hostHeightPx() }}px</span>
      </footer>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }

    .panel {
      border: 1px solid color-mix(in srgb, var(--rb-accent) 16%, transparent);
      border-radius: calc(var(--rb-radius) + 0.15rem);
      background: #fff;
      overflow: clip;
    }

    .panel__header {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid color-mix(in srgb, var(--rb-accent) 12%, transparent);
      background: color-mix(in srgb, var(--rb-surface) 80%, white);
    }

    .panel__title {
      font-size: 1rem;
      font-weight: 650;
      color: var(--rb-ink);
    }

    .panel__actions {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .panel__body {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      padding: 1rem;
    }

    .panel__footer {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 0.5rem;
      padding: 0.55rem 1rem;
      border-top: 1px solid color-mix(in srgb, var(--rb-accent) 12%, transparent);
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--rb-muted);
      background: color-mix(in srgb, var(--rb-surface) 70%, white);
    }

    .panel__measure {
      font-family: ui-monospace, monospace;
      font-weight: 500;
    }
  `,
})
export class RecipePanel {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);
  private readonly destroyRef = inject(DestroyRef);

  private readonly actionButton = contentChild(ActionButtonBase);
  private readonly actionButtonEl = contentChild(ActionButtonBase, {
    read: ElementRef<HTMLButtonElement>,
  });
  private readonly cards = contentChildren(RecipeCard, { descendants: true });

  protected readonly cardCount = computed(() => this.cards().length);
  protected readonly hostHeightPx = signal(0);

  constructor() {
    // DOM reads belong in render callbacks — not ngOnInit / ngAfterViewInit
    afterNextRender(() => {
      this.measureHost();
      this.renderer.setAttribute(this.host.nativeElement, 'data-rb-measured', 'true');

      if (typeof ResizeObserver === 'undefined') {
        return;
      }

      const observer = new ResizeObserver(() => this.measureHost());
      observer.observe(this.host.nativeElement);
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  /** Focus via ElementRef — valid DOM API use case. */
  focusAddButton(): void {
    this.actionButtonEl()?.nativeElement.focus();
    void this.actionButton();
  }

  private measureHost(): void {
    const height = Math.round(this.host.nativeElement.getBoundingClientRect().height);
    this.hostHeightPx.set(height);
  }
}
