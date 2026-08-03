import { Directive, effect, inject, input, TemplateRef, ViewContainerRef } from '@angular/core';

/**
 * Phase 1C · 1C.3 — Structural directive (custom *rbUnless)
 * @see https://angular.dev/guide/directives/structural-directives
 *
 * Usage: `<p *rbUnless="hide()">…</p>` → microsyntax desugars to ng-template.
 */
@Directive({
  selector: '[rbUnless]',
})
export class RbUnlessDirective {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);

  readonly rbUnless = input(false);

  private hasView = false;

  constructor() {
    effect(() => {
      const hide = this.rbUnless();
      if (!hide && !this.hasView) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.hasView = true;
      } else if (hide && this.hasView) {
        this.viewContainer.clear();
        this.hasView = false;
      }
    });
  }
}
