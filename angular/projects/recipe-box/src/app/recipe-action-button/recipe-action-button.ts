import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActionButtonBase } from '../action-button.base';

/**
 * Phase 1 · 1A.10 / 1A.12 — Extends ActionButtonBase + OnPush
 */
@Component({
  selector: 'button[rb-action]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    // Merged with base host bindings
    class: 'rb-action rb-action--primary',
  },
  template: `<ng-content />`,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.55rem 1rem;
      border: 1px solid var(--rb-accent);
      border-radius: var(--rb-radius);
      background: var(--rb-accent);
      color: var(--rb-surface);
      font: inherit;
      font-weight: 600;
      cursor: pointer;
    }

    :host:hover:not(:disabled) {
      background: var(--rb-accent-hover);
    }

    :host:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }

    :host.rb-action--busy {
      opacity: 0.75;
    }
  `,
})
export class RecipeActionButton extends ActionButtonBase {}
