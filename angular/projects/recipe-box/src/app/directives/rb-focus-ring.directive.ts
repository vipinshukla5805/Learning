import { Directive, input, signal } from '@angular/core';

/**
 * Phase 1C · 1C.4 — Composable host behavior (used via hostDirectives)
 */
@Directive({
  selector: '[rbFocusRing]',
  host: {
    '[style.outline]': 'focused() ? "2px solid " + (rbFocusRing() || "var(--rb-accent)") : "none"',
    '[style.outlineOffset]': 'focused() ? "2px" : null',
    '(focus)': 'onFocus()',
    '(blur)': 'onBlur()',
  },
})
export class RbFocusRingDirective {
  readonly rbFocusRing = input('');
  protected readonly focused = signal(false);

  protected onFocus(): void {
    this.focused.set(true);
  }

  protected onBlur(): void {
    this.focused.set(false);
  }
}
