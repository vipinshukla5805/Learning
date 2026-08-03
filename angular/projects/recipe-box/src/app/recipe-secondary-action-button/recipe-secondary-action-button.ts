import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActionButtonBase } from '../action-button.base';

@Component({
  selector: 'button[rb-action-secondary]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'rb-action rb-action--secondary',
  },
  template: `<ng-content />`,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.4rem 0.7rem;
      border: 1px solid color-mix(in srgb, var(--rb-accent) 25%, transparent);
      border-radius: var(--rb-radius);
      background: #fff;
      color: var(--rb-ink);
      font: inherit;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
    }

    :host:hover:not(:disabled) {
      background: color-mix(in srgb, var(--rb-surface) 50%, white);
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
export class RecipeSecondaryActionButton extends ActionButtonBase {}
