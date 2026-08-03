import { booleanAttribute, ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/**
 * Phase 1 · 1A.10 / 1A.12 — Base + OnPush for action buttons
 */
@Component({
  // Not used in templates — children override the selector.
  selector: 'button[rb-action-base]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    type: 'button',
    '[class.rb-action--busy]': 'busy()',
    '[attr.aria-busy]': 'busy()',
    '[disabled]': 'disabled() || busy()',
    '(click)': 'onHostClick($event)',
  },
  template: `<ng-content />`,
})
export class ActionButtonBase {
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly busy = input(false, { transform: booleanAttribute });
  readonly pressed = output<void>();

  protected onHostClick(event: Event): void {
    if (this.disabled() || this.busy()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.pressed.emit();
  }
}
