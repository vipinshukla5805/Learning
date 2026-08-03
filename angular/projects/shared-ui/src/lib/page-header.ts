import { Component, input } from '@angular/core';

@Component({
  selector: 'store-page-header',
  template: `
    <header class="page-header">
      <h1>{{ title() }}</h1>
      @if (subtitle()) {
        <p>{{ subtitle() }}</p>
      }
    </header>
  `,
  styles: `
    .page-header {
      margin-bottom: 1.5rem;
    }
    h1 {
      margin: 0 0 0.25rem;
      font-size: 1.75rem;
    }
    p {
      margin: 0;
      color: #5c6570;
    }
  `,
})
export class PageHeader {
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
}
