import { Directive, input, signal } from '@angular/core';

/**
 * Phase 1C · 1C.2 — Attribute directive
 * @see https://angular.dev/guide/directives/attribute-directives
 */
@Directive({
  selector: '[rbHighlight]',
  host: {
    '(mouseenter)': 'onEnter()',
    '(mouseleave)': 'onLeave()',
    '[style.backgroundColor]': 'hovering() ? (rbHighlight() || defaultColor() || "#ffe8a3") : null',
    '[style.transition]': '"background-color 120ms ease"',
  },
})
export class RbHighlightDirective {
  /** Same name as selector → `[rbHighlight]="color"` both applies + binds. */
  readonly rbHighlight = input('');
  readonly defaultColor = input('');

  protected readonly hovering = signal(false);

  protected onEnter(): void {
    this.hovering.set(true);
  }

  protected onLeave(): void {
    this.hovering.set(false);
  }
}
