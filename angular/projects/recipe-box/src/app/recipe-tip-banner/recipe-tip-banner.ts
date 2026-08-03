import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  input,
} from '@angular/core';

/**
 * Phase 1 · 1A.12 / 1A.13 — Advanced config + DOM (customElements in afterNextRender)
 * @see https://angular.dev/guide/components/advanced-configuration
 * @see https://angular.dev/guide/components/dom-apis
 *
 * - changeDetection: OnPush
 * - preserveWhitespaces / CUSTOM_ELEMENTS_SCHEMA
 * - Register CE only after render (DOM available; skipped on SSR)
 */
@Component({
  selector: 'rb-tip-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  preserveWhitespaces: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <aside class="tip">
      <strong>{{ title() }}</strong>
      <p>{{ body() }}</p>
      <!-- Unknown to Angular unless CUSTOM_ELEMENTS_SCHEMA — real CE registered below -->
      <rb-metric value="4"></rb-metric>
    </aside>
  `,
  styles: `
    :host {
      display: block;
    }

    .tip {
      padding: 0.75rem 1rem;
      border-radius: var(--rb-radius);
      border: 1px solid color-mix(in srgb, var(--rb-accent) 20%, transparent);
      background: color-mix(in srgb, var(--rb-accent) 8%, white);
    }

    strong {
      display: block;
      margin-bottom: 0.25rem;
      font-size: 0.95rem;
    }

    p {
      margin: 0 0 0.5rem;
      color: var(--rb-muted);
      font-size: 0.9rem;
    }

    rb-metric {
      display: inline-block;
      font-size: 0.8rem;
      font-weight: 650;
      color: var(--rb-accent);
    }
  `,
})
export class RecipeTipBanner {
  readonly title = input.required<string>();
  readonly body = input('');

  constructor() {
    afterNextRender(() => {
      if (typeof customElements === 'undefined' || customElements.get('rb-metric')) {
        return;
      }
      customElements.define(
        'rb-metric',
        class extends HTMLElement {
          connectedCallback(): void {
            const value = this.getAttribute('value') ?? '0';
            this.textContent = `${value}★ weeknight picks`;
          }
        },
      );
    });
  }
}
